export class CharacterRenderer {
  constructor(scene) {
    this.scene = scene;
  }

  drawCharacterPreview(x, y, config, scale = 1) {
    const g = this.scene.add.graphics();

    const headRadius = 28 * scale;
    const bodyW = 34 * scale;
    const bodyH = 44 * scale;

    this.drawShadow(g, x, y + bodyH / 2 + 28 * scale, scale);

    g.fillStyle(0x333344, 1);
    g.fillRect(x - 4 * scale, y + bodyH / 2 - 4 * scale, 8 * scale, 22 * scale);
    g.fillRect(x + 4 * scale - 8 * scale, y + bodyH / 2 - 4 * scale, 8 * scale, 22 * scale);

    const skinColor = this.getSkinColor(config);
    g.fillStyle(skinColor, 1);
    g.fillEllipse(x - 16 * scale, y - 2 * scale, 8 * scale, 18 * scale);
    g.fillEllipse(x + 16 * scale, y - 2 * scale, 8 * scale, 18 * scale);

    g.fillCircle(x - 16 * scale, y + 8 * scale, 5 * scale);
    g.fillCircle(x + 16 * scale, y + 8 * scale, 5 * scale);

    const shirtColor = config.shirtColor || 0xcc3333;
    g.fillStyle(shirtColor, 1);
    g.fillRoundedRect(x - bodyW / 2, y - bodyH / 2, bodyW, bodyH, 4 * scale);
    g.lineStyle(1 * scale, 0x000000, 0.2);
    g.strokeRoundedRect(x - bodyW / 2, y - bodyH / 2, bodyW, bodyH, 4 * scale);

    const hy = y - bodyH / 2 - headRadius + 8 * scale;
    const headShape = config.headShape || 'round';

    g.fillStyle(skinColor, 1);
    switch (headShape) {
      case 'oval':
        g.fillEllipse(x, hy, headRadius * 1.8 * scale, headRadius * 2.1 * scale);
        break;
      case 'square':
        g.fillRoundedRect(
          x - headRadius * 0.9 * scale,
          hy - headRadius * scale,
          headRadius * 1.8 * scale,
          headRadius * 2 * scale,
          6 * scale
        );
        break;
      case 'wide':
        g.fillEllipse(x, hy, headRadius * 2.1 * scale, headRadius * 1.7 * scale);
        break;
      default:
        g.fillCircle(x, hy, headRadius * scale);
    }

    this.drawHair(g, x, hy, config, scale);

    const eyeStyle = config.eyeStyle || 'normal';
    const eyeY = hy - 2 * scale;
    if (eyeStyle === 'shades') {
      g.fillStyle(0x222222, 0.9);
      g.fillRect(x - 12 * scale, eyeY - 6 * scale, 24 * scale, 10 * scale);
    } else {
      g.fillStyle(0xffffff, 1);
      g.fillEllipse(x - 8 * scale, eyeY, 8 * scale, 5 * scale);
      g.fillEllipse(x + 8 * scale, eyeY, 8 * scale, 5 * scale);
      g.fillStyle(0x222222, 1);
      g.fillCircle(x - 8 * scale, eyeY, 2.5 * scale);
      g.fillCircle(x + 8 * scale, eyeY, 2.5 * scale);
    }

    g.fillStyle(0x000000, 0.5);
    g.lineStyle(1.5 * scale, 0x883333, 0.8);
    g.beginPath();
    g.arc(x, hy + 8 * scale, 6 * scale, 0.1, Math.PI - 0.1, false);
    g.strokePath();

    return g;
  }

  getSkinColor(config) {
    const colors = { light: 0xf5d0b0, medium: 0xe0a87c, tan: 0xc68642, brown: 0x8d5524, dark: 0x5c3a1e };
    return colors[config.skinColor || 'medium'] || 0xe0a87c;
  }

  drawShadow(gfx, x, y, scale) {
    gfx.fillStyle(0x000000, 0.25);
    gfx.fillEllipse(x, y, 30 * scale, 10 * scale);
  }

  drawHair(gfx, x, hy, config, scale) {
    const style = config.hairStyle || 'short';
    if (style === 'none') return;

    const hairColor = this.getHairColor(config);
    const headRadius = 28 * scale;
    const top = hy - headRadius * 0.85;
    const r = headRadius;

    switch (style) {
      case 'short':
        gfx.fillStyle(hairColor, 1);
        gfx.fillEllipse(x, top - 2 * scale, r * 1.8, 10 * scale);
        break;
      case 'spiky':
        gfx.fillStyle(hairColor, 1);
        for (let i = 0; i < 7; i++) {
          const sx = x - 20 * scale + i * 7 * scale;
          gfx.fillTriangle(sx - 3 * scale, top, sx + 3 * scale, top, sx, top - 14 * scale);
        }
        break;
      case 'mohawk':
        gfx.fillStyle(hairColor, 1);
        gfx.fillRect(x - 3 * scale, top - 18 * scale, 6 * scale, 20 * scale);
        break;
      case 'flat':
        gfx.fillStyle(hairColor, 1);
        gfx.fillRect(x - r * 0.9, top - 4 * scale, r * 1.8, 8 * scale);
        break;
      case 'curly':
        gfx.fillStyle(hairColor, 1);
        for (let i = 0; i < 8; i++) {
          gfx.fillCircle(x - 18 * scale + i * 5 * scale, top - 5 * scale, 6 * scale);
        }
        break;
      case 'long':
        gfx.fillStyle(hairColor, 1);
        gfx.fillEllipse(x, hy - r * 0.3, r * 1.7, r * 0.5);
        gfx.fillRect(x - r, hy - r * 0.5, 8 * scale, r * 0.6);
        gfx.fillRect(x + r - 8 * scale, hy - r * 0.5, 8 * scale, r * 0.6);
        break;
      case 'afro':
        gfx.fillStyle(hairColor, 1);
        gfx.fillCircle(x, hy - 2 * scale, r * 1.3);
        break;
      case 'swept':
        gfx.fillStyle(hairColor, 1);
        gfx.fillEllipse(x - 5 * scale, top - 2 * scale, r * 1.6, 10 * scale);
        break;
    }
  }

  getHairColor(config) {
    const colors = {
      black: 0x222222, brown: 0x5c3317, blonde: 0xd4a854,
      red: 0xc04040, blue: 0x4060c0, green: 0x40a040,
      pink: 0xd870a0, grey: 0x888888,
    };
    return colors[config.hairColor || 'brown'] || 0x5c3317;
  }
}
