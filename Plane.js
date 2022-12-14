import * as THREE from './libs/three137/three.module.js';
import { GLTFLoader } from './libs/three137/GLTFLoader.js';
let mixer, clock;

class Plane {
    constructor(game) {
        this.assetsPath = game.assetsPath;
        this.loadingBar = game.loadingBar;
        this.renderer = game.renderer;
        this.game = game;
        this.scene = game.scene;
        this.load();
        this.tmpPos = new THREE.Vector3();
    }

    // Get Dino position in the world
    get position() {
        if (this.plane !== undefined) this.plane.getWorldPosition(this.tmpPos);
        return this.tmpPos;
    }

    // Set Dino to visible
    set visible(mode) {
        this.plane.visible = mode;
    }

    load() {
        const loader = new GLTFLoader().setPath(`${this.assetsPath}plane/`);
        this.ready = false;

        // Load a glTF resource
        loader.load(
            // resource URL
            'dino.glb',
            // called when the resource is loaded
            gltf => {

                gltf.scene.scale.set(0.5, 0.5, 0.5); 
                const model = gltf.scene;                
                this.plane = model;
                this.scene.add(model);

                mixer = new THREE.AnimationMixer(gltf.scene);
                gltf.animations.forEach((clip) => {
                    mixer.clipAction(clip).play();
                });
        
                // Velocity of Dino
                this.velocity = new THREE.Vector3(0, 0, 0.1);
                this.ready = true;

            },
            // called while loading is progressing
            xhr => {

                this.loadingBar.update('plane', xhr.loaded, xhr.total);

            },
            // called when loading has errors
            err => {

                console.error(err);

            }
        );
    }

    animate() {
        if ( mixer ) mixer.update( game.clock.getDelta() );
    }
    
    reset() {
        this.plane.position.set(0, 0, 0);
        this.plane.visible = true;
        this.velocity.set(0, 0, 0.1);
    }

    update(time) {

        if (this.game.active) {
            if (!this.game.spaceKey) {
                this.velocity.y -= 0.001;
            } else {
                this.velocity.y += 0.001;
            }
            this.velocity.z += 0.0001;

            // Euler rotation, swaying effect 
            this.plane.rotation.set(0, 0, Math.sin(time * 3) * 0.2, 'XYZ');
            this.plane.translateZ(this.velocity.z);
            this.plane.translateY(this.velocity.y);
        } else {
            this.plane.rotation.set(0, 0, Math.sin(time * 3) * 0.2, 'XYZ');
            this.plane.position.y = Math.cos(time) * 1.5;
        }

    }
}

export { Plane };