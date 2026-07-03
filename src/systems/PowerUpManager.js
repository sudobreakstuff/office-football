import Phaser from 'phaser';
import { POWERUP_TYPES, POWERUP_INTERVAL } from '../config.js';

export class PowerUpManager {
  constructor(scene) {
    this.scene = scene;
    this.powerUps = [];
    this.spawnTimer = 0;
    this.active = true;

    this.powerUpColors = {
      speed: 0x44dd44,
      supershot: 0xdd4444,
      freeze: 0x4488ff,
    };
  }

  update(dt) {
    if (!this.active) return;

    this.spawnTimer += dt;

    if (this.spawnTimer >= POWERUP_INTERVAL) {
      this.spawnTimer = 0;
      this.spawnRandom();
    }

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pu = this.powerUps[i];
      pu.life -= dt;
      if (pu.life <= 0) {
        this.remove(pu);
      } else {
        this.draw(pu);
      }
    }
  }

  spawnRandom() {
    if (this.powerUps.length >= 2) return;

    const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    const x = 400 + Math.random() * 480;
    const y = 100 + Math.random() * 520;

    const body = this.scene.matter.add.circle(x, y, 14, {
      isSensor: true,
      isStatic: true,
      label: 'powerup',
    });
    body.powerUpType = type;

    this.powerUps.push({
      type,
      body,
      life: 12000,
      graphic: this.scene.add.graphics(),
      bobOffset: Math.random() * Math.PI * 2,
    });
  }

  checkCollision(playerBody) {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pu = this.powerUps[i];
      const dx = playerBody.position.x - pu.body.position.x;
      const dy = playerBody.position.y - pu.body.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 40) {
        const type = pu.type;
        const player = playerBody.playerRef || playerBody.gameObject?.playerRef;
        if (player) {
          player.applyPowerUp(type);
        }
        this.remove(pu);
        return type;
      }
    }
    return null;
  }

  draw(pu) {
    pu.bobOffset += 0.03;
    const g = pu.graphic;
    g.clear();

    const x = pu.body.position.x;
    const y = pu.body.position.y + Math.sin(pu.bobOffset) * 4;

    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(x, y + 10, 16, 6);

    g.fillStyle(this.powerUpColors[pu.type], 1);
    g.fillCircle(x, y, 12);

    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(x - 3, y - 4, 4);

    g.lineStyle(2, 0xffffff, 0.6);
    g.strokeCircle(x, y, 12);

    if (pu.life < 3000) {
      const blink = Math.sin(pu.life * 0.02) > 0;
      g.setAlpha(blink ? 0.3 : 1);
    }
  }

  remove(pu) {
    pu.graphic.destroy();
    this.scene.matter.world.remove(pu.body);
    const idx = this.powerUps.indexOf(pu);
    if (idx > -1) this.powerUps.splice(idx, 1);
  }

  destroy() {
    for (const pu of [...this.powerUps]) {
      this.remove(pu);
    }
    this.active = false;
  }
}
