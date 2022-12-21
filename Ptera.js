import * as THREE from './libs/three137/three.module.js';
import { GLTFLoader } from './libs/three137/GLTFLoader.js';
let mixer, clock;

class Ptera {
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
        if (this.ptera !== undefined) this.ptera.getWorldPosition(this.tmpPos);
        return this.tmpPos;
    }

    // Set object to visible
    set visible(mode) {
        this.ptera.visible = mode;
    }

    load() {
        const loader = new GLTFLoader().setPath(`${this.assetsPath}ptera/`);
        this.ready = false;

        // Load a glTF resource
        loader.load(
            // resource URL
            'dino.glb',
            // called when the resource is loaded
            gltf => {

                gltf.scene.scale.set(0.5, 0.5, 0.5);
                const model = gltf.scene;
                this.ptera = model;
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

                this.loadingBar.update('ptera', xhr.loaded, xhr.total);

            },
            // called when loading has errors
            err => {

                console.error(err);

            }
        );
    }

    animate() {
        if (mixer) mixer.update(game.clockPtera.getDelta());
    }

    reset() {
        this.ptera.position.set(0, 0, 0);
        this.ptera.visible = true;
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
            if (this.game.right && this.ptera.position.x < xLimit) {
                this.velocity.x += velInc;
            }
            else if (this.game.left && this.ptera.position.x > xNegLimit) {
                this.velocity.x -= velInc;
            }
            else {
                this.velocity.x = 0;
                this.velocity.y = 0;
            }

            // The object will keep on moving forward
            this.velocity.z += 0.0001;

            // Actual function call to move/translate the object within the x,y,z axes
            this.ptera.translateX(this.velocity.x);
            this.ptera.translateZ(this.velocity.z);

            // Debugging Purposes
            // console.log("y position: " + this.ptera.position.y);
            // console.log("this.game.up: "  + this.ptera.up);

        } else {
            this.ptera.position.y = Math.cos(time) * 1.5;
        }

    }
}

export { Ptera };