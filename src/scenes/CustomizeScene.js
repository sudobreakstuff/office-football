import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { characterParts, defaultCharacter } from '../data/characterParts.js';
import { CharacterRenderer } from '../ui/CharacterRenderer.js';

export class CustomizeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CustomizeScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.charConfig = JSON.parse(JSON.stringify(defaultCharacter));
    this.renderer = new CharacterRenderer(this);

    const cx = GAME_WIDTH / 2;

    this.add.text(cx, 20, 'CHARACTER CUSTOMIZATION', {
      fontSize: '28px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44aaff',
      stroke: '#223344',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.previewX = GAME_WIDTH / 2;
    this.previewY = 280;

    this.buildPanel();

    this.redrawPreview();

    this.add.text(cx, 580, 'Customization saves automatically to your browser', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#556677',
    }).setOrigin(0.5);

    const saveBtn = this.add.rectangle(cx, 620, 200, 40, 0x226622);
    saveBtn.setStrokeStyle(2, 0x44dd66);
    saveBtn.setInteractive({ useHandCursor: true });
    this.add.text(cx, 620, 'SAVE & BACK', {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
    }).setOrigin(0.5);

    saveBtn.on('pointerdown', () => {
      localStorage.setItem('off-football-character', JSON.stringify(this.charConfig));
      this.scene.start('MenuScene');
    });

    const backBtn = this.add.text(cx, 670, '← Back (without saving)', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#6688aa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#88aacc'));
    backBtn.on('pointerout', () => backBtn.setColor('#6688aa'));
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    const saved = localStorage.getItem('off-football-character');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.charConfig = { ...defaultCharacter, ...parsed };
        this.redrawPreview();
      } catch (e) {}
    }
  }

  buildPanel() {
    this.panelBtns = [];
    this.sectionLabels = [];

    const sections = [
      { label: 'Head Shape', key: 'headShape', options: characterParts.headShapes.map((h) => ({ id: h.id, label: h.name })) },
      { label: 'Skin Color', key: 'skinColor', options: characterParts.skinColors, colorPreview: true },
      { label: 'Hair Style', key: 'hairStyle', options: characterParts.hairStyles },
      { label: 'Hair Color', key: 'hairColor', options: characterParts.hairColors, colorPreview: true },
      { label: 'Eyes', key: 'eyeStyle', options: characterParts.eyeStyles.map((e) => ({ id: e.id, label: e.name })) },
      { label: 'Mouth', key: 'mouthStyle', options: characterParts.mouthStyles.map((m) => ({ id: m.id, label: m.name })) },
      { label: 'Shirt', key: 'shirt', options: characterParts.shirts.map((s) => ({ id: s.id, label: s.name, color: s.color })), setColor: true },
      { label: 'Accessory', key: 'accessory', options: characterParts.accessories.map((a) => ({ id: a.id, label: a.name })) },
    ];

    const panelX = 40;
    let currentY = 20;

    sections.forEach((section) => {
      const label = this.add.text(panelX, currentY, section.label, {
        fontSize: '11px',
        fontFamily: 'Arial, sans-serif',
        color: '#8888aa',
      });
      this.sectionLabels.push(label);
      currentY += 16;

      const itemsPerRow = 4;
      const btnW = 46;
      const btnH = 26;
      const gap = 4;
      const startX = panelX + 10;

      section.options.forEach((opt, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        const bx = startX + col * (btnW + gap);
        const by = currentY + row * (btnH + gap);

        const btn = this.add.rectangle(bx + btnW / 2, by + btnH / 2, btnW, btnH, 0x222244);
        btn.setStrokeStyle(1, this.charConfig[section.key] === opt.id ? 0x44aaff : 0x334466);
        btn.setInteractive({ useHandCursor: true });

        if (section.colorPreview && opt.color !== undefined) {
          btn.setFillStyle(opt.color, 1);
        }

        const btnLabel = this.add.text(bx + btnW / 2, by + btnH / 2, opt.label.slice(0, 4), {
          fontSize: '8px',
          fontFamily: 'Arial, sans-serif',
          color: '#cccccc',
        }).setOrigin(0.5);

        btn.on('pointerdown', () => {
          if (section.setColor && opt.color) {
            this.charConfig.shirtColor = opt.color;
          }
          this.charConfig[section.key] = opt.id;

          section.options.forEach((o, j) => {
            const r2 = Math.floor(j / itemsPerRow);
            const c2 = j % itemsPerRow;
            const b = this.children.list.find(
              (child) =>
                child.type === 'Rectangle' &&
                child.x === startX + c2 * (btnW + gap) + btnW / 2 &&
                child.y === currentY + r2 * (btnH + gap) + btnH / 2
            );
            if (b) b.setStrokeStyle(1, o.id === opt.id ? 0x44aaff : 0x334466);
          });

          this.redrawPreview();
        });

        this.panelBtns.push(btn);
      });

      const rows = Math.ceil(section.options.length / itemsPerRow);
      currentY += rows * (btnH + gap) + 10;
    });
  }

  redrawPreview() {
    if (this.previewGraphics) {
      this.previewGraphics.destroy();
    }

    this.previewGraphics = this.renderer.drawCharacterPreview(
      this.previewX, this.previewY, this.charConfig, 2.5
    );

    if (this.previewName) this.previewName.destroy();
    this.previewName = this.add.text(this.previewX, this.previewY + 160, this.charConfig.playerName || 'Player', {
      fontSize: '22px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    if (this.previewNum) this.previewNum.destroy();
    this.previewNum = this.add.text(this.previewX, this.previewY + 185, `#${this.charConfig.playerNumber}`, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa',
    }).setOrigin(0.5);
  }
}
