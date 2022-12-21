import { Group, Vector3 } from "./libs/three137/three.module.js";
import { GLTFLoader } from "./libs/three137/GLTFLoader.js";
import { Explosion } from "./Explosion.js";

class Obstacles {
  constructor(game) {
    this.assetsPath = game.assetsPath;
    this.loadingBar = game.loadingBar;
    this.game = game;
    this.scene = game.scene;
    this.loadStar();
    this.loadBomb();
    this.loadShield();
    this.loadHeart(); 
    this.tmpPos = new Vector3();
    this.explosions = [];
  }

  loadStar() {
    const loader = new GLTFLoader().setPath(`${this.assetsPath}plane/`);
    this.ready = false;

    // Load a glTF resource
    loader.load(
      // resource URL
      "star.glb",
      // called when the resource is loaded
      (gltf) => {
        this.star = gltf.scene.children[0];

        this.star.name = "star";

        if (this.bomb !== undefined && this.shield !== undefined && this.heart !== undefined) 
          this.initialize();
      },
      // called while loading is progressing
      (xhr) => {
        this.loadingBar.update("star", xhr.loaded, xhr.total);
      },
      // called when loading has errors
      (err) => {
        console.error(err);
      }
    );
  }

  loadBomb() {
    const loader = new GLTFLoader().setPath(`${this.assetsPath}plane/`);

    // Load a glTF resource
    loader.load(
      // resource URL
      "bomb.glb",
      // called when the resource is loaded
      (gltf) => {
        this.bomb = gltf.scene.children[0];

        if (this.star !== undefined && this.shield !== undefined && this.heart !== undefined) 
          this.initialize();
      },
      // called while loading is progressing
      (xhr) => {
        this.loadingBar.update("bomb", xhr.loaded, xhr.total);
      },
      // called when loading has errors
      (err) => {
        console.error(err);
      }
    );
  }

  loadShield() {
    const loader = new GLTFLoader().setPath(`${this.assetsPath}plane/`);

    // Load a glTF resource
    loader.load(
      // resource URL
      "shield.glb",
      // called when the resource is loaded
      (gltf) => {
        this.shield = gltf.scene.children[0];
        this.shield.name = "shield";

        if (this.star !== undefined && this.bomb !== undefined && this.heart !== undefined) 
          this.initialize();
      },
      // called while loading is progressing
      (xhr) => {
        this.loadingBar.update("shield", xhr.loaded, xhr.total);
      },
      // called when loading has errors
      (err) => {
        console.error(err);
      }
    );
  }

  loadHeart() {
    const loader = new GLTFLoader().setPath(`${this.assetsPath}plane/`);

    // Load a glTF resource
    loader.load(
      // resource URL
      "heart.glb",
      // called when the resource is loaded
      (gltf) => {
        this.heart = gltf.scene.children[0];
        this.heart.name = "heart";

        if (this.star !== undefined && this.bomb !== undefined && this.shield !== undefined) 
          this.initialize();
      },
      // called while loading is progressing
      (xhr) => {
        this.loadingBar.update("heart", xhr.loaded, xhr.total);
      },
      // called when loading has errors
      (err) => {
        console.error(err);
      }
    );
  }

  initialize() {
    console.log(this.heart);
    this.obstacles = [];

    const obstacle = new Group();

    obstacle.add(this.star);

    this.bomb.rotation.x = -Math.PI * 0.5;
    this.bomb.position.x = 7.5;
    obstacle.add(this.bomb);

    let rotate = true;

    for (let x = 5; x > -8; x -= 2.5) {
      rotate = !rotate;
      if (x == 0) continue;
      const bomb = this.bomb.clone();
      bomb.rotation.x = rotate ? -Math.PI * 0.5 : 0;
      bomb.position.x = x;
      obstacle.add(bomb);
    }
    this.obstacles.push(obstacle);

    this.scene.add(obstacle);

    for (let i = 0; i < 3; i++) {
      const obstacle1 = obstacle.clone();

      // Memunculkan shield dan heart pada baris ke-4 
      if (i == 2) {
        this.shield.rotation.z = Math.PI;
        this.shield.position.x = 11;
        obstacle1.add(this.shield);

        this.heart.rotation.z = Math.PI;
        this.heart.position.x = -11;
        obstacle1.add(this.heart);
      }

      this.scene.add(obstacle1);
      this.obstacles.push(obstacle1);
    }

    this.reset();

    this.ready = true;
  }

  removeExplosion(explosion) {
    const index = this.explosions.indexOf(explosion);
    if (index != -1) this.explosions.indexOf(index, 1);
  }

  reset() {
    this.obstacleSpawn = { pos: 20, offset: 5 };
    this.obstacles.forEach((obstacle) => this.respawnObstacle(obstacle));
    let count;
    while (this.explosions.length > 0 && count < 100) {
      this.explosions[0].onComplete();
      count++;
    }
  }

  respawnObstacle(obstacle) {
    this.obstacleSpawn.pos += 30;
    const offset = (Math.random() * 2 - 1) * this.obstacleSpawn.offset;
    if (this.obstacleSpawn.offset <5) {
      this.obstacleSpawn.offset += 0.2;
    }
    obstacle.position.set(offset, 0, this.obstacleSpawn.pos);
    obstacle.children[0].rotation.y = Math.random() * Math.PI * 2;
    obstacle.userData.hit = false;
    obstacle.children.forEach((child) => {
      if ((child.name == "shield" || child.name == "heart") && (Math.random()<0.7)) {
        // "despawn" powerup
        child.visible = false;
      } else {
        child.visible = true;
      }
    });
  }

  update(pos, time) {
    let collisionObstacle;

    this.obstacles.forEach((obstacle) => {
      obstacle.children[0].rotateY(0.01);

      // Memutar shield jika pada baris terdapat shield
      if (obstacle.children[7] !== undefined) obstacle.children[7].rotateZ(0.01);

      const relativePosZ = obstacle.position.z - pos.z;
      if (Math.abs(relativePosZ) < 2 && !obstacle.userData.hit) {
        collisionObstacle = obstacle;
      }
      if (relativePosZ < -20) {
        this.respawnObstacle(obstacle);
      }
    });

    if (collisionObstacle !== undefined) {
      collisionObstacle.children.some((child) => {
        child.getWorldPosition(this.tmpPos);
        const dist = this.tmpPos.distanceToSquared(pos);
        if (dist < 5) {
          collisionObstacle.userData.hit = true;
          if (child.visible) {
            this.hit(child);
          }
          return true;
        }
      });
    }

    this.explosions.forEach((explosion) => {
      explosion.update(time);
    });
  }

  hit(obj) {
    if (obj.name == "star") {
      obj.visible = false;
      this.game.incScore();
    } else if (obj.name == "shield" && this.game.health_point >= 0) {
      obj.visible = false;
      this.game.fillShield();
    } else if (obj.name == "heart" && this.game.health_point >= 0) {
      obj.visible = false;
      this.game.incLives();
    } else {
      this.explosions.push(new Explosion(obj, this));

      if (this.game.shield_point != 0) {
        this.game.decShield();
      } else if (this.game.health_point != 0) {
        this.game.decLives();
      }
    }
  }
}

export { Obstacles };
