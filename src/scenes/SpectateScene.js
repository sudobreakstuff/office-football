import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export class SpectateScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SpectateScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    const cx = GAME_WIDTH / 2;

    this.add.text(cx, 60, 'WATCH LIVE', {
      fontSize: '36px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44aaff',
      stroke: '#223344',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(cx, 110, 'Spectate games currently being played', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
    }).setOrigin(0.5);

    const demoGames = [
      { p1: 'Dave', p2: 'Mike', score: '2 - 1', time: '0:45', code: 'AX7K2M' },
      { p1: 'Sarah', p2: 'Tom', score: '0 - 0', time: '1:22', code: 'B3N9PQ' },
      { p1: 'Alex', p2: 'Jordan', score: '3 - 2', time: '0:12', code: 'C5R8XT' },
    ];

    const listY = 170;

    if (demoGames.length === 0) {
      this.add.text(cx, listY + 40, 'No active games right now', {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#556677',
      }).setOrigin(0.5);
    } else {
      this.add.text(cx, listY - 10, 'LIVE GAMES', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#44dd66',
      }).setOrigin(0.5);

      demoGames.forEach((game, i) => {
        const y = listY + 30 + i * 70;
        const bg = this.add.rectangle(cx, y, 500, 56, 0x222244, 0.8);
        bg.setStrokeStyle(2, 0x334466);

        this.add.text(cx - 220, y - 14, `${game.p1} vs ${game.p2}`, {
          fontSize: '16px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#ffffff',
        }).setOrigin(0, 0.5);

        this.add.text(cx + 100, y - 14, game.score, {
          fontSize: '18px', fontFamily: 'monospace', color: '#ffdd44',
        }).setOrigin(0, 0.5);

        this.add.text(cx - 220, y + 10, `Room: ${game.code} | Time: ${game.time}`, {
          fontSize: '11px', fontFamily: 'Arial, sans-serif', color: '#666688',
        }).setOrigin(0, 0.5);

        const watchBtn = this.add.rectangle(cx + 220, y, 80, 30, 0x224466);
        watchBtn.setStrokeStyle(1, 0x44aaff);
        watchBtn.setInteractive({ useHandCursor: true });

        this.add.text(cx + 220, y, 'WATCH', {
          fontSize: '12px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#ffffff',
        }).setOrigin(0.5);

        watchBtn.on('pointerover', () => watchBtn.setFillStyle(0x335577));
        watchBtn.on('pointerout', () => watchBtn.setFillStyle(0x224466));
        watchBtn.on('pointerdown', () => {
          this.statusText.setText(`Connecting to game ${game.code}... Spectator view loading.`);
        });
      });
    }

    this.statusText = this.add.text(cx, GAME_HEIGHT - 100, '', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#88cc88',
    }).setOrigin(0.5);

    const backBtn = this.add.text(cx, GAME_HEIGHT - 40, '← Back to Menu', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#6688aa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#88aacc'));
    backBtn.on('pointerout', () => backBtn.setColor('#6688aa'));
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
