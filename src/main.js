import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Chess } from 'chess.js';
import { ChessPieces } from './models/ChessPieces';
import * as TWEEN from '@tweenjs/tween.js';

class ChessGame {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.chessGame = new Chess();
        this.pieces = new Map();
        this.selected = null;
        this.possibleMoves = [];
        this.highlightedSquares = [];
        this.pieceModels = new ChessPieces();
    }
    
    async init() {
        try {
            // Setup renderer
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setClearColor(0x87CEEB); // Cor de céu azul claro
            document.getElementById('game-container').appendChild(this.renderer.domElement);

            // Setup camera
            this.camera.position.set(0, 10, 10);
            this.camera.lookAt(0, 0, 0);

            // Setup controls
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 5;
            this.controls.maxDistance = 20;

            // Add lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(10, 10, 10);
            this.scene.add(directionalLight);

            // Create chessboard
            this.createBoard();
            
            // Initialize piece models
            await this.pieceModels.loadModels();
            this.createPieces();

            // Setup event listeners
            window.addEventListener('resize', () => this.onWindowResize());
            this.renderer.domElement.addEventListener('click', (event) => this.onBoardClick(event));

            // Update initial game status
            this.updateBoard();

            // Start animation loop
            this.animate();
        } catch (error) {
            console.error('Error initializing chess game:', error);
            document.getElementById('game-status').textContent = 'Erro ao iniciar o jogo';
            throw error;
        }
    }

    createBoard() {
        const boardGeometry = new THREE.BoxGeometry(8, 0.2, 8);
        const boardMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        this.scene.add(board);

        // Create squares
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const squareGeometry = new THREE.BoxGeometry(1, 0.1, 1);
                const color = (i + j) % 2 === 0 ? 0xffffff : 0x000000;
                const squareMaterial = new THREE.MeshPhongMaterial({ color });
                const square = new THREE.Mesh(squareGeometry, squareMaterial);
                square.position.set(i - 3.5, 0.1, j - 3.5);
                this.scene.add(square);
            }
        }
    }    createPieces() {
        const board = this.chessGame.board();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const pieceMesh = this.pieceModels.createPiece(piece.type, piece.color);
                    if (pieceMesh) {
                        const x = col - 3.5;
                        const z = row - 3.5;
                        pieceMesh.position.set(x, 0.15, z);
                        this.scene.add(pieceMesh);
                        // Armazenar usando a notação algébrica (ex: "e2")
                        const file = String.fromCharCode(97 + col); // 'a' to 'h'
                        const rank = 8 - row; // 1 to 8
                        this.pieces.set(`${file}${rank}`, pieceMesh);
                    }
                }
            }
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onBoardClick(event) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            const clickedPoint = intersects[0].point;
            const squareX = Math.floor(clickedPoint.x + 4);
            const squareY = Math.floor(clickedPoint.z + 4);

            if (squareX >= 0 && squareX < 8 && squareY >= 0 && squareY < 8) {
                this.handleSquareClick(squareX, squareY);
            }
        }
    }    handleSquareClick(x, y) {
        const square = this.chessGame.board()[y][x];
        
        if (this.selected) {
            const move = {
                from: this.selected,
                to: `${String.fromCharCode(97 + x)}${8 - y}`
            };

            try {
                const moveResult = this.chessGame.move(move);
                if (moveResult) {
                    console.log('Moving piece:', moveResult);
                    this.animateMove(moveResult);
                    this.selected = null;
                    // Clear highlights
                    this.highlightedSquares.forEach(square => this.scene.remove(square));
                    this.highlightedSquares = [];
                } else {
                    console.log('Move not valid');
                }
            } catch (e) {
                console.log('Invalid move:', e);
            }
        } else if (square && square.color === 'w') {
            this.selected = `${String.fromCharCode(97 + x)}${8 - y}`;
            this.highlightPossibleMoves(x, y);
            console.log('Selected piece at:', this.selected);
        }
    }    highlightPossibleMoves(x, y) {
        // Clear previous highlights
        this.highlightedSquares.forEach(square => this.scene.remove(square));
        this.highlightedSquares = [];

        const moves = this.chessGame.moves({ square: this.selected, verbose: true });
        const highlightMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5
        });

        moves.forEach(move => {
            const destX = move.to.charCodeAt(0) - 97;
            const destY = 8 - parseInt(move.to[1]);
            const highlightGeometry = new THREE.BoxGeometry(1, 0.1, 1);
            const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
            highlight.position.set(destX - 3.5, 0.15, destY - 3.5);
            this.scene.add(highlight);
            this.highlightedSquares.push(highlight);
        });
    }    makeComputerMove() {
        const moves = this.chessGame.moves({ verbose: true });
        if (moves.length > 0) {
            const move = moves[Math.floor(Math.random() * moves.length)];
            const moveResult = this.chessGame.move(move);
            this.animateMove(moveResult);
        }
    }

    updateBoard() {
        // Remove all existing pieces
        this.pieces.forEach(piece => this.scene.remove(piece));
        this.pieces.clear();

        // Create new pieces based on current game state
        this.createPieces();

        // Update game status
        const playerTurn = this.chessGame.turn();
        let status = '';

        if (this.chessGame.isGameOver()) {
            if (this.chessGame.isCheckmate()) {
                status = `Xeque-mate! ${playerTurn === 'w' ? 'Pretas' : 'Brancas'} venceu.`;
            } else if (this.chessGame.isStalemate()) {
                status = 'Empate por afogamento!';
            } else if (this.chessGame.isThreefoldRepetition()) {
                status = 'Empate por repetição!';
            } else if (this.chessGame.isInsufficientMaterial()) {
                status = 'Empate por material insuficiente!';
            } else if (this.chessGame.isDraw()) { // General draw, could be 50-move rule
                status = 'Empate!';
            } else {
                status = 'Fim de jogo!'; // Fallback
            }
        } else {
            status = `Sua vez (${playerTurn === 'w' ? 'Brancas' : 'Pretas'})`;
        }
        document.getElementById('game-status').textContent = status;
    }    animateMove(moveResult) {
        if (!moveResult) return;
        
        // Pegar a peça usando a notação algébrica (ex: "e2")
        const piece = this.pieces.get(moveResult.from);
        
        if (!piece) {
            console.error('Piece not found at:', moveResult.from);
            console.log('Available pieces:', Array.from(this.pieces.keys()));
            return;
        }

        // Calcular posições no tabuleiro
        const toX = moveResult.to.charCodeAt(0) - 97 - 3.5; // Convertendo para coordenadas 3D
        const toZ = (8 - parseInt(moveResult.to[1])) - 3.5; // Invertendo Z para corresponder à notação do xadrez

        console.log('Moving from:', moveResult.from, 'to:', moveResult.to);
        console.log('Initial position:', piece.position);
        console.log('Target position:', { x: toX, y: 0.15, z: toZ });

        // Criar uma cópia da posição inicial
        const startPos = piece.position.clone();
        
        // Atualizar o mapa de peças
        this.pieces.delete(moveResult.from);
        this.pieces.set(moveResult.to, piece);

        // Coordenadas finais
        const endPos = new THREE.Vector3(toX, 0.15, toZ);

        // Ponto de controle para o arco (no meio do caminho, mas mais alto)
        const control = new THREE.Vector3(
            (startPos.x + endPos.x) / 2,
            1.5, // Altura do arco
            (startPos.z + endPos.z) / 2
        );

        // Configurar a animação
        const steps = 30; // Número de passos na animação
        const duration = 1000; // Duração total em ms
        let currentStep = 0;

        const animate = () => {
            currentStep++;
            const t = currentStep / steps;

            if (t > 1) {
                // Animação completa
                piece.position.copy(endPos);
                if (moveResult.color === 'w') {
                    setTimeout(() => this.makeComputerMove(), 300);
                }
                this.updateBoard(); // Refresh status and board
                return;
            }

            // Interpolação quadrática para criar um arco suave
            const t2 = (1 - t) * (1 - t);
            const t1 = 2 * (1 - t) * t;
            const t0 = t * t;

            piece.position.x = t2 * startPos.x + t1 * control.x + t0 * endPos.x;
            piece.position.y = t2 * startPos.y + t1 * control.y + t0 * endPos.y;
            piece.position.z = t2 * startPos.z + t1 * control.z + t0 * endPos.z;

            // Continuar a animação
            setTimeout(() => requestAnimationFrame(animate), duration / steps);
        };

        // Iniciar a animação
        animate();
    }    animate() {
        const animate = () => {
            requestAnimationFrame(animate);
            TWEEN.update();
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
}

// Start the game
(async () => {
    const game = new ChessGame();
    await game.init();
})().catch(console.error);
