import * as THREE from 'three';

export class ChessPieces {    constructor() {
        this.materials = {
            white: new THREE.MeshPhongMaterial({ color: 0xffffff }),
            black: new THREE.MeshPhongMaterial({ color: '#0813a8' })
        };
        this.pieceGeometries = null;
    }    async loadModels() {
        try {
            // Create geometries for each piece type
            this.pieceGeometries = {
                p: this.createPawnGeometry(),
                r: this.createRookGeometry(),
                n: this.createKnightGeometry(),
                b: this.createBishopGeometry(),
                q: this.createQueenGeometry(),
                k: this.createKingGeometry()
            };
        } catch (error) {
            console.error('Error loading piece models:', error);
            throw error;
        }
    }

    createPawnGeometry() {
        const group = new THREE.Group();

        // Base
        const base = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
        const baseMesh = new THREE.Mesh(base);
        baseMesh.position.y = 0.05;
        group.add(baseMesh);

        // Body
        const body = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 32);
        const bodyMesh = new THREE.Mesh(body);
        bodyMesh.position.y = 0.3;
        group.add(bodyMesh);

        // Head
        const head = new THREE.SphereGeometry(0.2, 32, 32);
        const headMesh = new THREE.Mesh(head);
        headMesh.position.y = 0.6;
        group.add(headMesh);

        return group;
    }

    createRookGeometry() {
        const group = new THREE.Group();

        // Base
        const base = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 32);
        const baseMesh = new THREE.Mesh(base);
        baseMesh.position.y = 0.075;
        group.add(baseMesh);

        // Body
        const body = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 32);
        const bodyMesh = new THREE.Mesh(body);
        bodyMesh.position.y = 0.375;
        group.add(bodyMesh);

        // Crown
        const crown = new THREE.CylinderGeometry(0.35, 0.3, 0.15, 32);
        const crownMesh = new THREE.Mesh(crown);
        crownMesh.position.y = 0.7;
        group.add(crownMesh);

        // Battlements
        for (let i = 0; i < 4; i++) {
            const battlement = new THREE.BoxGeometry(0.1, 0.15, 0.1);
            const battlementMesh = new THREE.Mesh(battlement);
            battlementMesh.position.y = 0.825;
            battlementMesh.position.x = (i < 2 ? 0.15 : -0.15);
            battlementMesh.position.z = (i % 2 === 0 ? 0.15 : -0.15);
            group.add(battlementMesh);
        }

        return group;
    }

    createKnightGeometry() {
        const group = new THREE.Group();

        // Base
        const base = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 32);
        const baseMesh = new THREE.Mesh(base);
        baseMesh.position.y = 0.075;
        group.add(baseMesh);

        // Body
        const body = new THREE.CylinderGeometry(0.2, 0.3, 0.4, 32);
        const bodyMesh = new THREE.Mesh(body);
        bodyMesh.position.y = 0.35;
        group.add(bodyMesh);

        // Head
        const head = new THREE.BoxGeometry(0.25, 0.4, 0.6);
        const headMesh = new THREE.Mesh(head);
        headMesh.position.y = 0.7;
        headMesh.rotation.x = -0.3;
        group.add(headMesh);

        return group;
    }

    createBishopGeometry() {
        const group = new THREE.Group();

        // Base
        const base = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 32);
        const baseMesh = new THREE.Mesh(base);
        baseMesh.position.y = 0.075;
        group.add(baseMesh);

        // Body
        const body = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 32);
        const bodyMesh = new THREE.Mesh(body);
        bodyMesh.position.y = 0.4;
        group.add(bodyMesh);

        // Head
        const head = new THREE.SphereGeometry(0.15, 32, 32);
        const headMesh = new THREE.Mesh(head);
        headMesh.position.y = 0.8;
        group.add(headMesh);

        // Cross
        const cross1 = new THREE.BoxGeometry(0.1, 0.2, 0.1);
        const crossMesh1 = new THREE.Mesh(cross1);
        crossMesh1.position.y = 0.95;
        group.add(crossMesh1);

        const cross2 = new THREE.BoxGeometry(0.2, 0.1, 0.1);
        const crossMesh2 = new THREE.Mesh(cross2);
        crossMesh2.position.y = 0.9;
        group.add(crossMesh2);

        return group;
    }

    createQueenGeometry() {
        const group = new THREE.Group();

        // Base
        const base = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 32);
        const baseMesh = new THREE.Mesh(base);
        baseMesh.position.y = 0.075;
        group.add(baseMesh);

        // Body
        const body = new THREE.CylinderGeometry(0.25, 0.35, 0.6, 32);
        const bodyMesh = new THREE.Mesh(body);
        bodyMesh.position.y = 0.45;
        group.add(bodyMesh);

        // Crown
        const crown = new THREE.CylinderGeometry(0.35, 0.25, 0.2, 32);
        const crownMesh = new THREE.Mesh(crown);
        crownMesh.position.y = 0.85;
        group.add(crownMesh);

        // Points
        for (let i = 0; i < 8; i++) {
            const point = new THREE.ConeGeometry(0.06, 0.15, 32);
            const pointMesh = new THREE.Mesh(point);
            const angle = (i * Math.PI * 2) / 8;
            pointMesh.position.set(
                Math.cos(angle) * 0.25,
                0.95,
                Math.sin(angle) * 0.25
            );
            group.add(pointMesh);
        }

        return group;
    }

    createKingGeometry() {
        const group = new THREE.Group();

        // Base
        const base = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 32);
        const baseMesh = new THREE.Mesh(base);
        baseMesh.position.y = 0.075;
        group.add(baseMesh);

        // Body
        const body = new THREE.CylinderGeometry(0.25, 0.35, 0.6, 32);
        const bodyMesh = new THREE.Mesh(body);
        bodyMesh.position.y = 0.45;
        group.add(bodyMesh);

        // Crown
        const crown = new THREE.CylinderGeometry(0.35, 0.25, 0.2, 32);
        const crownMesh = new THREE.Mesh(crown);
        crownMesh.position.y = 0.85;
        group.add(crownMesh);

        // Cross
        const cross1 = new THREE.BoxGeometry(0.1, 0.3, 0.1);
        const crossMesh1 = new THREE.Mesh(cross1);
        crossMesh1.position.y = 1.1;
        group.add(crossMesh1);

        const cross2 = new THREE.BoxGeometry(0.25, 0.1, 0.1);
        const crossMesh2 = new THREE.Mesh(cross2);
        crossMesh2.position.y = 1.0;
        group.add(crossMesh2);

        return group;
    }

    createPiece(type, color) {
        const geometry = this.pieceGeometries[type.toLowerCase()];
        if (!geometry) return null;

        const material = color === 'w' ? this.materials.white : this.materials.black;
        const piece = new THREE.Group();

        geometry.children.forEach(child => {
            const mesh = new THREE.Mesh(child.geometry, material);
            mesh.position.copy(child.position);
            mesh.rotation.copy(child.rotation);
            piece.add(mesh);
        });

        return piece;
    }
}
