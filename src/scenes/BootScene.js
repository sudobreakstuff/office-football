import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const bar = this.add.rectangle(w / 2, h / 2, 320, 24, 0x222244);
    bar.setStrokeStyle(2, 0x4488cc);

    const fill = this.add.rectangle(w / 2 - 158, h / 2, 0, 20, 0x4488cc);
    fill.setOrigin(0, 0.5);

    const title = this.add.text(w / 2, h / 2 - 50, 'OFFICE FOOTBALL', {
      fontSize: '36px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#223344',
      strokeThickness: 6,
    });
    title.setOrigin(0.5);

    const loading = this.add.text(w / 2, h / 2 + 40, 'Loading...', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
    });
    loading.setOrigin(0.5);

    this.load.on('progress', (v) => {
      fill.width = 316 * v;
    });

    this.load.on('complete', () => {
      loading.setText('Ready!');
    });

    this.generateTextures();
  }

  generateTextures() {
    const g = this.make.graphics({ add: false });

    g.fillStyle(0xffffff, 1);
    g.fillCircle(10, 10, 10);
    g.generateTexture('particle', 20, 20);
    g.clear();

    g.fillStyle(0xffcc00, 1);
    g.fillCircle(10, 10, 10);
    g.generateTexture('powerup_orb', 20, 20);
    g.clear();

    g.lineStyle(2, 0xcc4444, 1);
    g.strokeCircle(30, 30, 28);
    g.generateTexture('freeze_indicator', 60, 60);
    g.clear();

    g.fillStyle(0x333333, 1);
    g.fillCircle(3, 3, 3);
    g.generateTexture('goal_particle', 6, 6);
    g.clear();

    g.fillStyle(0xffaa00, 0.8);
    g.fillCircle(6, 6, 6);
    g.generateTexture('supershot_particle', 12, 12);
    g.clear();

    g.lineStyle(3, 0xff4444, 1);
    g.strokeCircle(12, 12, 10);
    g.generateTexture('target_circle', 24, 24);
    g.clear();

    g.destroy();
  }

  create() {
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}
