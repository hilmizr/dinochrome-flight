import * as THREE from "./libs/three137/three.module.js";
import { RGBELoader } from "./libs/three137/RGBELoader.js";
import { LoadingBar } from "./libs/LoadingBar.js";
import { Plane } from "./Plane.js";
import { Obstacles } from "./Obstacles.js";
import { SFX } from "./libs/SFX.js";

class Game {
  constructor() {
    const container = document.createElement("div");
    document.body.appendChild(container);

    // Loading Bar
    this.loadingBar = new LoadingBar();
    this.loadingBar.visible = false;

    // Keep track of elapsed time in the game
    this.clock = new THREE.Clock();

    // Path to assets
    this.assetsPath = "./assets/";

    // Set camera
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
    // this.camera.position.set(-4.37, 0, -4.75);
    this.camera.position.set(0, 3, -5);
    this.camera.lookAt(0, 0, 6);

    this.cameraController = new THREE.Object3D();
    this.cameraController.add(this.camera);
    this.cameraTarget = new THREE.Vector3(0, 0, 6);

    this.scene = new THREE.Scene();
    this.scene.add(this.cameraController);

    // Ambient Lighting
    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    ambient.position.set(0.5, 1, 0.2);
    this.scene.add(ambient);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(this.renderer.domElement);
    this.setEnvironment();

    this.load();

    window.addEventListener("resize", this.resize.bind(this));

    // Triggered when key is pressed
    document.addEventListener("keydown", this.keyDown.bind(this));

    // Triggered when key is released
    document.addEventListener("keyup", this.keyUp.bind(this));

    this.up = false;
    this.down = false;
    this.right = false;
    this.left = false;
    this.forward = false;

    // Check if the play button has been pressed and game is active
    this.active = false;
    const btn = document.getElementById("playBtn");
    btn.addEventListener("click", this.startGame.bind(this));
  }

  startGame() {
    // When game is started or active hide these elements
    const gameover = document.getElementById("gameover");
    const instructions = document.getElementById("instructions");
    const btn = document.getElementById("playBtn");

    gameover.style.display = "none";
    instructions.style.display = "none";
    btn.style.display = "none";

    this.score = 0;
    this.bonusScore = 0;
    this.health_point = 100;
    this.shield_point = 0;

    const score_elm = document.getElementById("score");
    score_elm.innerHTML = this.score;

    const health_bar = document.getElementById("health-bar");
    health_bar.value = this.health_point;

    const health_elm = document.querySelector("#health-span");
    health_elm.innerHTML = this.health_point + "%";
    health_elm.style.right = "205px";

    const shield_elm = document.querySelector("#shield-span");
    shield_elm.innerHTML = this.shield_point + "%";

    this.plane.reset();
    this.obstacles.reset();

    this.active = true;

    this.sfx.play("engine");
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // =============CONTROLS=================
  // Events relating to when a key is pressed down
  // This is basiscally for the WASD keys
  keyDown(evt) {
    switch (evt.keyCode) {
      // W
      case 87:
        this.up = true;
        break;
      // S
      case 83:
        this.down = true;
        break;
      // D
      case 65:
        this.right = true;
        break;
      // A
      case 68:
        this.left = true;
        break;
    }
  }
  // Events relating to when a key is released
  // Also for the WASD keys
  keyUp(evt) {
    switch (evt.keyCode) {
      case 87:
        this.up = false;
        break;
      case 83:
        this.down = false;
        break;
      case 65:
        this.right = false;
        break;
      case 68:
        this.left = false;
        break;
    }
  }

  setEnvironment() {
    const loader = new RGBELoader().setPath(this.assetsPath);
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    const self = this;

    loader.load(
      "hdr/venice_sunset_1k.hdr",
      (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        pmremGenerator.dispose();

        self.scene.environment = envMap;
      },
      undefined,
      (err) => {
        console.error(err.message);
      }
    );
  }

  // =============LOADERS=================
  load() {
    // Load all objects
    this.loadSkybox();
    this.loading = true;
    this.loadingBar.visible = true;
    this.plane = new Plane(this);
    this.obstacles = new Obstacles(this);
    this.loadSFX();
  }

  loadSFX() {
    this.sfx = new SFX(this.camera, this.assetsPath + "plane/");

    this.sfx.load("explosion");
    this.sfx.load("engine", true);
    this.sfx.load("gliss");
    this.sfx.load("gameover");
    this.sfx.load("bonus");
  }

  loadSkybox() {
    // Skybox is basically a cube with different images applied to each face
    this.scene.background = new THREE.CubeTextureLoader().setPath(`${this.assetsPath}/plane/paintedsky/`).load(["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"], () => {
      this.renderer.setAnimationLoop(this.render.bind(this));
    });
  }

  gameOver() {
    this.active = false;

    const gameover = document.getElementById("gameover");
    const btn = document.getElementById("playBtn");

    gameover.style.display = "block";
    btn.style.display = "block";

    this.plane.visible = false;

    this.sfx.stopAll();
    this.sfx.play("gameover");
  }

  incScore() {
    this.score++;

    const elm = document.getElementById("score");

    if (this.score % 3 == 0) {
      this.bonusScore += 3;
      this.sfx.play("bonus");
    } else {
      this.sfx.play("gliss");
    }

    elm.innerHTML = this.score + this.bonusScore;
  }

  decLives() {
    this.health_point -= 20;

    const health = document.querySelector("#health-span");
    health.innerHTML = this.health_point + "%";

    if (this.health_point > 10 && this.health_point < 100) health.style.right = "195px";
    else if (this.health_point < 10) health.style.right = "185px";

    const health_bar = document.getElementById("health-bar");
    health_bar.value = this.health_point;

    if (this.health_point == 0) setTimeout(this.gameOver.bind(this), 1200);

    this.sfx.play("explosion");
  }

  fillShield() {
    this.shield_point = 100;

    const shield = document.querySelector("#shield-span");
    shield.innerHTML = this.shield_point + "%";

    if (this.shield_point > 10 && this.shield_point < 100) shield.style.right = "195px";
    else if (this.shield_point == 100) shield.style.right = "205px";

    const shield_bar = document.getElementById("shield-bar");
    shield_bar.value = this.shield_point;

    this.sfx.play("gliss");
  }

  decShield() {
    this.shield_point -= 20;

    const shield = document.querySelector("#shield-span");
    shield.innerHTML = this.shield_point + "%";

    if (this.shield_point > 10 && this.shield_point < 100) shield.style.right = "195px";
    else if (this.shield_point == 100) shield.style.right = "205px";

    const shield_bar = document.getElementById("shield-bar");
    shield_bar.value = this.shield_point;

    this.sfx.play("explosion");
  }

  updateCamera() {
    this.cameraController.position.copy(this.plane.position);
    this.cameraController.position.y = 0;
    this.cameraTarget.copy(this.plane.position);
    this.cameraTarget.z += 6;
    this.camera.lookAt(this.cameraTarget);
  }

  render() {
    if (this.loading) {
      // When plane and obstacles are ready, hide the loading bar
      if (this.plane.ready && this.obstacles.ready) {
        this.loading = false;
        this.loadingBar.visible = false;
      } else {
        return;
      }
    }

    const dt = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    this.plane.update(time);
    requestAnimationFrame(this.plane.animate);
    this.updateCamera();

    if (this.active) {
      this.obstacles.update(this.plane.position, dt);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

export { Game };
