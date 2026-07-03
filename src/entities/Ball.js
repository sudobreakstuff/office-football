import Phaser from 'phaser';
import { BALL_CONFIG } from '../config.js';

export class Ball {
  constructor(scene, x, y) {
    this.scene = scene;

    this.body = scene.matter.add.circle(x, y, BALL_CONFIG.radius, {
      restitution: BALL_CONFIG.bounce,
      friction: 0.02,
      frictionAir: 0.005,
      density: 0.002,
      label: 'ball',
    });

    this.body.plugin = this;

    this.graphics = scene.add.graphics();
    this.shadow = scene.add.graphics();

    this.trail = [];
    this.prevOwner = null;
  }

  update() {
    this.clampSpeed();
    this.updateTrail();
    this.draw();
  }

  clampSpeed() {
    const vx = this.body.velocity.x;
    const vy = this.body.velocity.y;
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > BALL_CONFIG.maxSpeed) {
      const scale = BALL_CONFIG.maxSpeed / speed;
      this.scene.matter.body.setVelocity(this.body, {
        x: vx * scale,
        y: vy * scale,
      });
    }
  }

  updateTrail() {
    if (Math.abs(this.body.velocity.x) > 200 || Math.abs(this.body.velocity.y) > 200) {
      this.trail.push({
        x: this.body.position.x,
        y: this.body.position.y,
        alpha: 0.5,
      });
    }
    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].alpha -= 0.04;
      if (this.trail[i].alpha <= 0) {
        this.trail.splice(i, 1);
      }
    }
  }

  draw() {
    this.shadow.clear();
    this.shadow.fillStyle(0x000000, 0.3);
    this.shadow.fillEllipse(
      this.body.position.x + 2,
      this.body.position.y + 4,
      BALL_CONFIG.radius * 2.5,
      BALL_CONFIG.radius * 1.2
    );

    this.graphics.clear();

    for (const p of this.trail) {
      this.graphics.fillStyle(0x888888, p.alpha * 0.5);
      this.graphics.fillCircle(p.x, p.y, 4);
    }

    const bx = this.body.position.x;
    const by = this.body.position.y;

    this.graphics.fillStyle(0xffffff, 1);
    this.graphics.fillCircle(bx, by, BALL_CONFIG.radius);

    this.graphics.lineStyle(1.5, 0x222222, 0.8);
    this.graphics.strokeCircle(bx, by, BALL_CONFIG.radius);

    this.graphics.fillStyle(0x222222, 0.6);
    this.graphics.fillCircle(bx - 4, by - 4, 4);
    this.graphics.fillCircle(bx + 5, by - 3, 3);
  }

  reset(x, y) {
    this.scene.matter.body.setPosition(this.body, { x, y });
    this.scene.matter.body.setVelocity(this.body, { x: 0, y: 0 });
    this.scene.matter.body.setAngularVelocity(this.body, 0);
    this.trail = [];
  }

  destroy() {
    this.graphics.destroy();
    this.shadow.destroy();
    this.scene.matter.world.remove(this.body);
  }
}
