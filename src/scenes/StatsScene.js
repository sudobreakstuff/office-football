import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export class StatsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StatsScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    const cx = GAME_WIDTH / 2;

    this.add.text(cx, 30, 'STATS & LEADERBOARD', {
      fontSize: '30px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44aaff',
      stroke: '#223344',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const stats = this.loadStats();

    this.add.text(cx, 80, 'Your Stats (local)', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#888888',
    }).setOrigin(0.5);

    const statX = cx - 150;
    let sy = 120;

    const statItems = [
      ['Wins', stats.wins, '#44dd66'],
      ['Losses', stats.losses, '#dd4444'],
      ['Draws', stats.draws, '#dddd44'],
      ['Goals Scored', stats.goalsFor, '#44aaff'],
      ['Goals Conceded', stats.goalsAgainst, '#aa4444'],
      ['Tournaments Won', stats.tournamentsWon, '#ffdd44'],
      ['Win Rate', `${stats.wins + stats.losses > 0 ? Math.round(stats.wins / (stats.wins + stats.losses) * 100) : 0}%`, '#aaaaaa'],
    ];

    statItems.forEach(([label, value, color]) => {
      this.add.text(statX, sy, label, {
        fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#888888',
      });
      this.add.text(statX + 200, sy, String(value), {
        fontSize: '14px', fontFamily: 'Arial Black, Arial, sans-serif', color,
      }).setOrigin(1, 0);
      sy += 24;
    });

    this.add.text(cx, 330, 'Recent Matches', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#888888',
    }).setOrigin(0.5);

    const history = stats.matchHistory || [];
    if (history.length === 0) {
      this.add.text(cx, 380, 'No matches played yet. Go play some football!', {
        fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#556677',
      }).setOrigin(0.5);
    } else {
      let hy = 360;
      const recent = history.slice(-8).reverse();
      recent.forEach((match) => {
        const text = `${match.p1} ${match.p1Score} - ${match.p2Score} ${match.p2}`;
        this.add.text(cx, hy, text, {
          fontSize: '13px', fontFamily: 'monospace', color: '#aaaaaa',
        }).setOrigin(0.5);
        hy += 22;
      });
    }

    const backBtn = this.add.text(cx, GAME_HEIGHT - 40, '← Back to Menu', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#6688aa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#88aacc'));
    backBtn.on('pointerout', () => backBtn.setColor('#6688aa'));
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  loadStats() {
    try {
      const raw = localStorage.getItem('off-football-stats');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          wins: parsed.wins || 0,
          losses: parsed.losses || 0,
          draws: parsed.draws || 0,
          goalsFor: parsed.goalsFor || 0,
          goalsAgainst: parsed.goalsAgainst || 0,
          tournamentsWon: parsed.tournamentsWon || 0,
          matchHistory: parsed.matchHistory || [],
        };
      }
    } catch (e) {}
    return {
      wins: 0, losses: 0, draws: 0,
      goalsFor: 0, goalsAgainst: 0,
      tournamentsWon: 0, matchHistory: [],
    };
  }
}
