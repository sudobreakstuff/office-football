import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    const cx = GAME_WIDTH / 2;

    this.add.text(cx, 70, 'OFFICE FOOTBALL', {
      fontSize: '64px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#334455',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(cx, 145, 'The Office Tournament Game', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
    }).setOrigin(0.5);

    const menuItems = [
      { text: 'Practice vs AI', scene: 'PracticeScene', desc: 'Play against the computer' },
      { text: 'Local 1v1', scene: 'GameScene', desc: 'Two players, same keyboard', data: { mode: 'local' } },
      { text: 'Online Match', scene: 'LobbyScene', desc: 'Create or join a room' },
      { text: 'Tournament', scene: 'TournamentScene', desc: 'Bracket tournament mode' },
      { text: 'Customize Character', scene: 'CustomizeScene', desc: 'Design your bobblehead' },
      { text: 'Stats & Leaderboard', scene: 'StatsScene', desc: 'View your stats' },
      { text: 'Watch Live Games', scene: 'SpectateScene', desc: 'Spectate matches' },
      { text: 'Supabase Setup', scene: 'SetupSupabaseScene', desc: 'Connect online backend' },
    ];

    const startY = 200;
    const spacing = 58;

    menuItems.forEach((item, i) => {
      const y = startY + i * spacing;

      const btn = this.add.text(cx, y, item.text, {
        fontSize: '22px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: '#ffffff',
        backgroundColor: '#222244',
        padding: { x: 24, y: 8 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      this.add.text(cx, y + 18, item.desc, {
        fontSize: '11px',
        fontFamily: 'Arial, sans-serif',
        color: '#555577',
      }).setOrigin(0.5);

      btn.on('pointerover', () => {
        btn.setColor('#ffdd44');
        btn.setBackgroundColor('#334466');
      });

      btn.on('pointerout', () => {
        btn.setColor('#ffffff');
        btn.setBackgroundColor('#222244');
      });

      btn.on('pointerdown', () => {
        if (item.data) {
          this.scene.start(item.scene, item.data);
        } else {
          this.scene.start(item.scene);
        }
      });
    });

    this.add.text(cx, GAME_HEIGHT - 24, 'Mouse: click to navigate | In-game: move cursor + left click to shoot', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#556677',
    }).setOrigin(0.5);
  }
}
