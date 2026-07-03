import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, setSupabaseCredentials, hasSupabaseCredentials } from '../config.js';

export class SetupSupabaseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SetupSupabaseScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');
    const cx = GAME_WIDTH / 2;

    this.add.text(cx, 50, 'SUPABASE SETUP', {
      fontSize: '30px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44dd66',
      stroke: '#223344',
      strokeThickness: 4,
    }).setOrigin(0.5);

    if (hasSupabaseCredentials()) {
      this.add.text(cx, 110, 'Supabase is already configured!', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#44dd66',
      }).setOrigin(0.5);
    }

    this.add.text(cx, 150, 'Step 1: Create a free Supabase project', {
      fontSize: '16px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(cx, 175, 'Go to supabase.com, sign up, and click "New Project".', {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color: '#888888',
    }).setOrigin(0.5);

    this.add.text(cx, 200, 'Step 2: Run the SQL schema', {
      fontSize: '16px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(cx, 225, 'In Supabase dashboard: SQL Editor → paste schema.sql → Run', {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color: '#888888',
    }).setOrigin(0.5);

    this.add.text(cx, 255, 'Step 3: Paste your Supabase credentials below', {
      fontSize: '16px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(cx, 290, 'Project URL:', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.add.dom(cx, 320).createFromHTML(`
      <input type="text" id="supabase-url" placeholder="https://xxxxxxxxxxxx.supabase.co"
        style="width:400px;padding:10px;font-size:14px;
               background:#222244;color:#ffffff;border:2px solid #334466;
               border-radius:6px;outline:none;font-family:monospace;">
    `);

    this.add.text(cx, 360, 'Anon Public Key:', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.add.dom(cx, 390).createFromHTML(`
      <input type="text" id="supabase-key" placeholder="eyJhbGciOiJIUzI1NiIs..."
        style="width:400px;padding:10px;font-size:14px;
               background:#222244;color:#ffffff;border:2px solid #334466;
               border-radius:6px;outline:none;font-family:monospace;">
    `);

    const saveBtn = this.add.rectangle(cx, 440, 200, 44, 0x226622);
    saveBtn.setStrokeStyle(2, 0x44dd66);
    saveBtn.setInteractive({ useHandCursor: true });
    this.add.text(cx, 440, 'SAVE & CONNECT', {
      fontSize: '16px', fontFamily: 'Arial Black, Arial, sans-serif', color: '#ffffff',
    }).setOrigin(0.5);

    this.statusText = this.add.text(cx, 490, '', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#88cc88',
    }).setOrigin(0.5);

    saveBtn.on('pointerdown', () => {
      const url = document.getElementById('supabase-url')?.value?.trim() || '';
      const key = document.getElementById('supabase-key')?.value?.trim() || '';

      if (!url || !key) {
        this.statusText.setText('Please fill in both fields');
        this.statusText.setColor('#ff6644');
        return;
      }

      setSupabaseCredentials(url, key);
      this.statusText.setText('Credentials saved! Refresh the page to connect.');
      this.statusText.setColor('#44dd66');

      this.time.delayedCall(2000, () => {
        window.location.reload();
      });
    });

    const getCreds = this.add.text(cx, 540, 'Where do I find my credentials?', {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#6688aa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.infoText = this.add.text(cx, 600, '', {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#666688',
    }).setOrigin(0.5);

    getCreds.on('pointerdown', () => {
      const show = !this.showingInfo;
      this.showingInfo = show;
      this.infoText.setText(show
        ? 'Supabase Dashboard → Project Settings → API → Copy URL + anon public key'
        : '');
    });

    const backBtn = this.add.text(cx, GAME_HEIGHT - 30, '← Back to Menu', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#6688aa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#88aacc'));
    backBtn.on('pointerout', () => backBtn.setColor('#6688aa'));
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
