import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { defaultCharacter } from '../data/characterParts.js';

export class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LobbyScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    const cx = GAME_WIDTH / 2;

    this.add.text(cx, 40, 'ONLINE MATCH', {
      fontSize: '40px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44aaff',
      stroke: '#223344',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.statusText = this.add.text(cx, 100, '', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
    }).setOrigin(0.5);

    const modeY = 160;
    this.add.text(cx, modeY, 'Select Mode:', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    const modes = ['1v1', '2v2'];
    this.selectedMode = '1v1';

    modes.forEach((mode, i) => {
      const mx = cx - 60 + i * 120;
      const btn = this.add.rectangle(mx, modeY + 40, 100, 36, 0x222244);
      btn.setStrokeStyle(2, mode === '1v1' ? 0x4488cc : 0x334466);
      btn.setInteractive({ useHandCursor: true });

      const label = this.add.text(mx, modeY + 40, mode, {
        fontSize: '20px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: '#ffffff',
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        this.selectedMode = mode;
        modes.forEach((m, j) => {
          const b = this.children.list.find(
            (c) => c.type === 'Rectangle' && c.x === cx - 60 + j * 120 && c.y === modeY + 40
          );
          if (b) b.setStrokeStyle(2, j === i ? 0x4488cc : 0x334466);
        });
      });
    });

    const nickY = 240;
    this.add.text(cx, nickY, 'Your Nickname:', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    this.nicknameInput = this.add.dom(cx, nickY + 40)
      .createFromHTML(`
        <input type="text" id="nickname" maxlength="15" placeholder="Enter nickname..."
          style="width:240px;padding:10px;font-size:16px;text-align:center;
                 background:#222244;color:#ffffff;border:2px solid #334466;
                 border-radius:6px;outline:none;font-family:Arial,sans-serif;">
      `);

    this.domListener = this.input.keyboard?.on('keydown-ENTER', () => {
      this.focusRoomCode();
    });

    const createY = 340;
    this.add.text(cx, createY, 'Create a Room', {
      fontSize: '20px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44dd66',
    }).setOrigin(0.5);

    const createBtn = this.add.rectangle(cx, createY + 50, 220, 50, 0x226622);
    createBtn.setStrokeStyle(2, 0x44dd66);
    createBtn.setInteractive({ useHandCursor: true });

    this.add.text(cx, createY + 50, 'CREATE ROOM', {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
    }).setOrigin(0.5);

    createBtn.on('pointerover', () => {
      createBtn.setFillStyle(0x338833);
    });
    createBtn.on('pointerout', () => {
      createBtn.setFillStyle(0x226622);
    });
    createBtn.on('pointerdown', () => {
      this.createOnlineRoom();
    });

    const joinY = 440;
    this.add.text(cx, joinY, 'Join a Room', {
      fontSize: '20px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#dd6644',
    }).setOrigin(0.5);

    this.roomCodeInput = this.add.dom(cx, joinY + 45)
      .createFromHTML(`
        <input type="text" id="roomcode" maxlength="6" placeholder="Room code..."
          style="width:200px;padding:10px;font-size:18px;text-align:center;
                 background:#222244;color:#ffffff;border:2px solid #334466;
                 border-radius:6px;outline:none;font-family:monospace;letter-spacing:4px;text-transform:uppercase;">
      `);

    const joinBtn = this.add.rectangle(cx, joinY + 100, 220, 50, 0x662222);
    joinBtn.setStrokeStyle(2, 0xdd6644);
    joinBtn.setInteractive({ useHandCursor: true });

    this.add.text(cx, joinY + 100, 'JOIN ROOM', {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
    }).setOrigin(0.5);

    joinBtn.on('pointerover', () => {
      joinBtn.setFillStyle(0x883333);
    });
    joinBtn.on('pointerout', () => {
      joinBtn.setFillStyle(0x662222);
    });
    joinBtn.on('pointerdown', () => {
      this.joinOnlineRoom();
    });

    const backBtn = this.add.text(cx, GAME_HEIGHT - 40, '← Back to Menu', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#6688aa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#88aacc'));
    backBtn.on('pointerout', () => backBtn.setColor('#6688aa'));
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.statusText.setText('Supabase backend not connected yet. Room codes shown for demo.');
  }

  focusRoomCode() {
    const input = document.getElementById('roomcode');
    if (input) input.focus();
  }

  createOnlineRoom() {
    const nickname = this.getNickname();
    if (!nickname) {
      this.statusText.setText('Please enter a nickname');
      return;
    }

    const code = this.generateCode();
    this.statusText.setText(`Room created! Code: ${code}\nWaiting for opponent...`);

    this.time.delayedCall(1500, () => {
      this.statusText.setText('Online mode ready. Opponent would join here.');

      this.lobbyPlayers = this.add.text(GAME_WIDTH / 2, 530, `Players (1): ${nickname}`, {
        fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#88cc88',
      }).setOrigin(0.5);

      this.add.text(GAME_WIDTH / 2, 560, `Share code: ${code}`, {
        fontSize: '20px', fontFamily: 'monospace', color: '#ffdd44',
      }).setOrigin(0.5);
    });
  }

  joinOnlineRoom() {
    const nickname = this.getNickname();
    const roomCode = document.getElementById('roomcode')?.value?.toUpperCase()?.trim();

    if (!nickname) {
      this.statusText.setText('Please enter a nickname');
      return;
    }
    if (!roomCode || roomCode.length < 4) {
      this.statusText.setText('Please enter a valid room code');
      return;
    }

    this.statusText.setText(`Attempting to join room: ${roomCode}...`);

    this.time.delayedCall(1000, () => {
      this.lobbyPlayers = this.add.text(GAME_WIDTH / 2, 530, `Joined room: ${roomCode}`, {
        fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#88cc88',
      }).setOrigin(0.5);

      const startBtn = this.add.rectangle(GAME_WIDTH / 2, 590, 200, 44, 0x226622);
      startBtn.setStrokeStyle(2, 0x44dd66);
      startBtn.setInteractive({ useHandCursor: true });

      this.add.text(GAME_WIDTH / 2, 590, 'START GAME', {
        fontSize: '16px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#ffffff',
      }).setOrigin(0.5);

      startBtn.on('pointerdown', () => {
        this.scene.start('GameScene', {
          mode: 'online',
          roomCode,
          isHost: false,
          p1Character: { ...defaultCharacter, playerName: nickname },
        });
      });

      this.statusText.setText(`Connected to room: ${roomCode}`);
    });
  }

  getNickname() {
    const el = document.getElementById('nickname');
    return el?.value?.trim() || '';
  }

  generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  shutdown() {
    if (this.domListener) {
      this.input.keyboard?.off('keydown-ENTER', this.domListener);
    }
  }
}
