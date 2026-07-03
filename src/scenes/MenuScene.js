import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    const cx = GAME_WIDTH / 2;

    this.add.text(cx, 80, 'OFFICE', {
      fontSize: '72px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#334455',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(cx, 150, 'FOOTBALL', {
      fontSize: '56px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44aaff',
      stroke: '#223344',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(cx, 210, '⚽ The Office Tournament Game ⚽', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
    }).setOrigin(0.5);

    const menuItems = [
      { text: 'PRACTICE', scene: 'PracticeScene', desc: 'Play vs AI opponent' },
      { text: 'LOCAL 1V1', scene: 'GameScene', desc: 'Two players, same keyboard', data: { mode: 'local' } },
      { text: 'ONLINE MATCH', scene: 'LobbyScene', desc: 'Create or join an online game' },
      { text: 'TOURNAMENT', scene: 'TournamentScene', desc: 'Create or join a tournament' },
      { text: 'CUSTOMIZE', scene: 'CustomizeScene', desc: 'Design your bobblehead' },
      { text: 'STATS', scene: 'StatsScene', desc: 'Player stats & leaderboard' },
      { text: 'WATCH LIVE', scene: 'SpectateScene', desc: 'Spectate ongoing games' },
      { text: '⚙ SUPABASE SETUP', scene: 'SetupSupabaseScene', desc: 'Connect your Supabase backend' },
    ];

    const startY = 280;
    const spacing = 54;

    menuItems.forEach((item, i) => {
      const y = startY + i * spacing;
      const bg = this.add.rectangle(cx, y, 360, 44, 0x222244, 0.8);
      bg.setStrokeStyle(2, 0x334466);
      bg.setInteractive({ useHandCursor: true });

      const label = this.add.text(cx, y, item.text, {
        fontSize: '20px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: '#ffffff',
      }).setOrigin(0.5);

      this.add.text(cx, y - 14, item.desc, {
        fontSize: '11px',
        fontFamily: 'Arial, sans-serif',
        color: '#666688',
      }).setOrigin(0.5);

      bg.on('pointerover', () => {
        bg.setFillStyle(0x334466);
        bg.setStrokeStyle(2, 0x4488cc);
      });

      bg.on('pointerout', () => {
        bg.setFillStyle(0x222244, 0.8);
        bg.setStrokeStyle(2, 0x334466);
      });

      bg.on('pointerdown', () => {
        if (item.data) {
          this.scene.start(item.scene, item.data);
        } else {
          this.scene.start(item.scene);
        }
      });
    });

    this.add.text(cx, GAME_HEIGHT - 30, 'Mouse: Move cursor to aim + Click to shoot | Keyboard: WASD + X/Z', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#556677',
    }).setOrigin(0.5);
  }
}
