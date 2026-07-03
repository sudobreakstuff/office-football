import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { TournamentManager } from '../systems/TournamentManager.js';
import { defaultCharacter } from '../data/characterParts.js';

export class TournamentScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TournamentScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.tournament = new TournamentManager();
    this.playerList = [];

    const cx = GAME_WIDTH / 2;

    this.add.text(cx, 30, 'TOURNAMENT MODE', {
      fontSize: '32px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44aaff',
      stroke: '#223344',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.statusText = this.add.text(cx, 70, 'Add players, then start the tournament!', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
    }).setOrigin(0.5);

    this.playerListContainer = this.add.container(cx - 150, 120);

    this.addPlayerUI();

    this.drawBracketPreview();

    const startBtn = this.add.rectangle(cx, GAME_HEIGHT - 80, 220, 50, 0x226622);
    startBtn.setStrokeStyle(2, 0x44dd66);
    startBtn.setInteractive({ useHandCursor: true });
    this.add.text(cx, GAME_HEIGHT - 80, 'START TOURNAMENT', {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
    }).setOrigin(0.5);

    startBtn.on('pointerover', () => startBtn.setFillStyle(0x338833));
    startBtn.on('pointerout', () => startBtn.setFillStyle(0x226622));
    startBtn.on('pointerdown', () => {
      if (this.tournament.startTournament()) {
        this.runTournament();
      } else {
        this.statusText.setText('Need at least 4 players to start!');
        this.statusText.setColor('#ff6644');
      }
    });

    const autoBtn = this.add.rectangle(cx, GAME_HEIGHT - 35, 220, 30, 0x333355);
    autoBtn.setInteractive({ useHandCursor: true });
    this.add.text(cx, GAME_HEIGHT - 35, 'QUICK FILL (Add 8 bots)', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#8888aa',
    }).setOrigin(0.5);

    autoBtn.on('pointerdown', () => {
      const existing = this.tournament.players.length;
      for (let i = existing; i < 8; i++) {
        const name = `Bot${i + 1}`;
        this.tournament.addPlayer(name);
        this.playerList.push(name);
      }
      this.refreshPlayerList();
    });

    const backBtn = this.add.text(cx, GAME_HEIGHT - 8, '← Back to Menu', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#6688aa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#88aacc'));
    backBtn.on('pointerout', () => backBtn.setColor('#6688aa'));
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  addPlayerUI() {
    this.add.dom(GAME_WIDTH / 2, 110)
      .createFromHTML(`
        <div style="display:flex;gap:8px;align-items:center;">
          <input type="text" id="tourneyPlayer" maxlength="15" placeholder="Player name..."
            style="width:160px;padding:8px;font-size:14px;text-align:center;
                   background:#222244;color:#ffffff;border:2px solid #334466;
                   border-radius:6px;outline:none;font-family:Arial,sans-serif;">
          <button id="addPlayerBtn" style="padding:8px 16px;background:#226622;color:#fff;
                   border:2px solid #44dd66;border-radius:6px;cursor:pointer;font-family:Arial;">
            Add
          </button>
        </div>
      `);

    this.time.delayedCall(200, () => {
      const btn = document.getElementById('addPlayerBtn');
      const input = document.getElementById('tourneyPlayer');
      if (btn && input) {
        btn.addEventListener('click', () => {
          const name = input.value.trim();
          if (name) {
            this.tournament.addPlayer(name);
            this.playerList.push(name);
            this.refreshPlayerList();
            input.value = '';
          }
        });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const name = input.value.trim();
            if (name) {
              this.tournament.addPlayer(name);
              this.playerList.push(name);
              this.refreshPlayerList();
              input.value = '';
            }
          }
        });
      }
    });
  }

  refreshPlayerList() {
    this.playerListContainer.removeAll(true);

    const text = this.tournament.players.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
    const list = this.add.text(0, 0, text || 'No players added', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#cccccc', lineSpacing: 6,
    });
    this.playerListContainer.add(list);

    this.drawBracketPreview();
  }

  drawBracketPreview() {
    if (this.bracketPreview) this.bracketPreview.destroy();

    const cx = GAME_WIDTH - 300;
    const g = this.add.graphics();
    this.bracketPreview = g;

    const count = this.tournament.players.length;
    const size = count >= 4 ? this.tournament.getBracketSize(count) : 4;
    const rounds = Math.log2(size);

    g.fillStyle(0x334466, 0.3);
    g.fillRoundedRect(cx - 10, 90, 280, 30, 4);

    const text = this.add.text(cx + 130, 105, count >= 4 ? `Bracket: ${size} players` : `Need 4+ (have ${count})`, {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#88aacc',
    }).setOrigin(0.5);

    const bracketX = cx;
    let by = 140;
    const matchH = 30;
    const colW = 80;

    for (let r = 0; r < rounds; r++) {
      const matches = size / Math.pow(2, r + 1);
      const spacing = Math.max(matchH + 10, (GAME_HEIGHT - 200) / matches);

      for (let m = 0; m < matches; m++) {
        const mx = bracketX + r * colW;
        const my = by + m * spacing;

        g.lineStyle(1, 0x334466, 0.5);
        g.strokeRect(mx, my, 70, matchH);

        if (r === 0 && m < count) {
          const pName = this.tournament.players[m]?.name || '';
          const t = this.add.text(mx + 4, my + 7, pName.slice(0, 8), {
            fontSize: '9px', fontFamily: 'Arial, sans-serif', color: '#88cc88',
          });
        }
      }

      if (r < rounds - 1) {
        const nextMatches = size / Math.pow(2, r + 2);
        for (let m = 0; m < nextMatches; m++) {
          const x1 = bracketX + r * colW + 70;
          const y1 = by + m * 2 * spacing + spacing / 4;
          const y2 = by + (m * 2 + 1) * spacing + spacing / 4;

          g.lineStyle(1, 0x334466, 0.3);
          g.lineBetween(x1, y1 + matchH / 2, x1 + 10, y1 + matchH / 2);
          g.lineBetween(x1 + 10, y1 + matchH / 2, x1 + 10, y2 + matchH / 2);
          g.lineBetween(x1 + 10, y2 + matchH / 2, x1, y2 + matchH / 2);
        }
      }
    }
  }

  runTournament() {
    this.statusText.setText('Tournament started! Playing matches...');
    this.statusText.setColor('#44dd66');

    this.matchIndex = 0;

    this.playNextMatch();
  }

  playNextMatch() {
    const round = this.tournament.currentRound;
    const matches = this.tournament.getCurrentRoundMatches();
    const unfinished = matches.filter((m) => m.player1 && m.player2 && m.status !== 'finished');

    if (unfinished.length === 0) {
      const advanced = this.tournament.advanceRound();
      if (!advanced) {
        const winner = this.tournament.getWinner();
        this.statusText.setText(`Tournament complete! Winner: ${winner?.name || 'TBD'}`);
        this.statusText.setColor('#ffdd44');

        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 130, 300, 40, 0x224466)
          .setStrokeStyle(2, 0x44aaff)
          .setInteractive({ useHandCursor: true });

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 130, 'BACK TO MENU', {
          fontSize: '16px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#ffffff',
        }).setOrigin(0.5);

        return;
      }
      this.playNextMatch();
      return;
    }

    const match = unfinished[0];
    const p1Name = match.player1.name;
    const p2Name = match.player2.name;

    this.statusText.setText(`Match: ${p1Name} vs ${p2Name} (Round ${round + 1})`);

    const p1Wins = Math.random() > 0.5;
    const winner = p1Wins ? match.player1 : match.player2;
    const score = `${Math.floor(Math.random() * 3) + (p1Wins ? 1 : 0)} - ${Math.floor(Math.random() * 3) + (p1Wins ? 0 : 1)}`;

    this.tournament.reportMatchResult(round, match.position, p1Wins ? 0 : 1, score);

    this.drawBracketPreview();

    this.time.delayedCall(2000, () => {
      this.playNextMatch();
    });
  }
}
