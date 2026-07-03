import Phaser from 'phaser';
import { GOAL_WIDTH, GOAL_HEIGHT, GOAL_Y, PITCH_HEIGHT } from '../config.js';

export class Goal {
  constructor(scene, x, side) {
    this.scene = scene;
    this.side = side;
    this.scored = false;

    const y = GOAL_Y + GOAL_HEIGHT / 2;

    this.sensorBody = scene.matter.add.rectangle(
      x + (side === 'left' ? GOAL_WIDTH / 2 : -GOAL_WIDTH / 2),
      y,
      GOAL_WIDTH,
      GOAL_HEIGHT,
      {
        isSensor: true,
        isStatic: true,
        label: 'goal',
      }
    );
    this.sensorBody.goalSide = side;

    this.posts = [];
    const postX = x + (side === 'left' ? GOAL_WIDTH : -GOAL_WIDTH);

    this.posts.push(
      scene.matter.add.rectangle(postX, GOAL_Y, 8, GOAL_HEIGHT, {
        isStatic: true,
        friction: 0.1,
        label: 'goalpost',
      })
    );

    this.topBar = scene.matter.add.rectangle(
      postX,
      GOAL_Y,
      8,
      GOAL_HEIGHT,
      {
        isStatic: true,
        isSensor: true,
        label: 'goalpost',
      }
    );

    this.graphics = scene.add.graphics();
  }

  draw(cameraScroll) {
    this.graphics.clear();

    const postX = this.side === 'left'
      ? this.sensorBody.position.x + GOAL_WIDTH / 2
      : this.sensorBody.position.x - GOAL_WIDTH / 2;

    const top = GOAL_Y;
    const bottom = GOAL_Y + GOAL_HEIGHT;

    this.graphics.fillStyle(0xeeeeee, 0.15);
    this.graphics.fillRect(
      postX - (this.side === 'left' ? GOAL_WIDTH : 0),
      top,
      GOAL_WIDTH,
      GOAL_HEIGHT
    );

    this.graphics.lineStyle(4, 0xffffff, 0.9);
    this.graphics.beginPath();
    this.graphics.moveTo(postX, top);
    this.graphics.lineTo(postX, bottom);
    this.graphics.strokePath();

    this.graphics.lineStyle(1, 0xffffff, 0.7);
    for (let i = 0; i < 10; i++) {
      const ny = top + (i / 9) * GOAL_HEIGHT;
      this.graphics.beginPath();
      this.graphics.moveTo(postX - (this.side === 'left' ? 10 : -10), ny);
      this.graphics.lineTo(this.side === 'left'
        ? postX + GOAL_WIDTH / 4
        : postX - GOAL_WIDTH / 4, ny);
      this.graphics.strokePath();
    }
  }

  isBallInGoal(ballBody) {
    if (!ballBody) return false;
    const bx = ballBody.position.x;
    const by = ballBody.position.y;
    const gx = this.sensorBody.position.x;
    const gy = this.sensorBody.position.y;

    return (
      bx > gx - GOAL_WIDTH / 2 &&
      bx < gx + GOAL_WIDTH / 2 &&
      by > gy - GOAL_HEIGHT / 2 &&
      by < gy + GOAL_HEIGHT / 2
    );
  }

  destroy() {
    this.graphics.destroy();
    this.posts.forEach((p) => this.scene.matter.world.remove(p));
    this.scene.matter.world.remove(this.sensorBody);
  }
}
