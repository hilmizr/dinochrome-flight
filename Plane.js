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

    // Get object position in the world
    get position() {
        if (this.plane !== undefined) this.plane.getWorldPosition(this.tmpPos);
        return this.tmpPos;
    }

    // Set object to visible
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

                // Velocity of object
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
        if (mixer) mixer.update(game.clock.getDelta());
    }

    reset() {
        this.plane.position.set(0, 0, 0);
        this.plane.visible = true;
        this.velocity.set(0, 0, 0.1);
    }
    
    update(time) {

        // =============CONTROLS=================
        // These variables will make sure that the object won't go out of frame
        // Limit for x axis
        const xLimit = 15;
        const xNegLimit = -1 * xLimit;

        // This is basically for incrementing the velocity
        let velInc = 0.0025;

        // Object will move when appropriate keys are pressed and its position is still within limits
        if (this.game.active) {
            if (this.game.right && this.plane.position.x < xLimit) {
                this.velocity.x += velInc;
            } 
            else if (this.game.left && this.plane.position.x > xNegLimit) {
                this.velocity.x -= velInc;
            } 
            else {
                this.velocity.x = 0;
                this.velocity.y = 0;
            }

            // The object will keep on moving forward
            this.velocity.z += 0.0001;
            
            // Actual function call to move/translate the object within the x,y,z axes
            this.plane.translateX(this.velocity.x);
            this.plane.translateZ(this.velocity.z);

            // Debugging Purposes
            // console.log("y position: " + this.plane.position.y);
            // console.log("this.game.up: "  + this.plane.up);

        } else {
            this.plane.position.y = Math.cos(time) * 1.5;
        }

    }
}

export { Plane };