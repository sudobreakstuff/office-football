import Phaser from 'phaser';
import { PLAYER_CONFIG } from '../config.js';
import { defaultCharacter } from '../data/characterParts.js';

export class Player {
  constructor(scene, x, y, config = {}) {
    this.scene = scene;
    this.charConfig = { ...defaultCharacter, ...config.character, ...config };
    this.team = config.team || 0;
    this.playerIndex = config.playerIndex || 0;
    this.isRemote = config.isRemote || false;
    this.isAI = config.isAI || false;

    this.headRadius = PLAYER_CONFIG.headRadius;
    this.bodyW = PLAYER_CONFIG.bodyWidth;
    this.bodyH = PLAYER_CONFIG.bodyHeight;

    this.body = scene.matter.add.rectangle(x, y, this.bodyW * 0.7, this.bodyH, {
      friction: 0.05,
      frictionAir: 0.04,
      density: 0.003,
      restitution: 0,
      label: 'player',
    });
    this.body.playerRef = this;

    this.headBody = scene.matter.add.circle(x, y - this.bodyH / 2 - this.headRadius + 8, this.headRadius, {
      friction: 0.05,
      frictionAir: 0.04,
      density: 0.001,
      restitution: 0.1,
      label: 'playerHead',
    });
    this.headBody.playerRef = this;

    const constraint = scene.matter.add.constraint(this.body, this.headBody, 0, 6, 0, {
      stiffness: 0.05,
      damping: 0.1,
    });
    this.headConstraint = constraint;

    const legOffset = this.bodyH * 0.35;
    this.leftLeg = scene.matter.add.rectangle(x - 8, y + this.bodyH / 2 + 8, 8, PLAYER_CONFIG.legLength, {
      friction: 0.1,
      frictionAir: 0.02,
      density: 0.001,
      restitution: 0,
      label: 'playerLeg',
    });
    this.leftLeg.playerRef = this;

    this.rightLeg = scene.matter.add.rectangle(x + 8, y + this.bodyH / 2 + 8, 8, PLAYER_CONFIG.legLength, {
      friction: 0.1,
      frictionAir: 0.02,
      density: 0.001,
      restitution: 0,
      label: 'playerLeg',
    });
    this.rightLeg.playerRef = this;

    this.leftLegConstraint = scene.matter.add.constraint(this.body, this.leftLeg, 8, legOffset, 0, {
      stiffness: 0.3,
      damping: 0.05,
    });

    this.rightLegConstraint = scene.matter.add.constraint(this.body, this.rightLeg, -8, legOffset, 0, {
      stiffness: 0.3,
      damping: 0.05,
    });

    this.graphics = scene.add.graphics();
    this.hairGraphics = scene.add.graphics();
    this.accGraphics = scene.add.graphics();

    this.direction = 1;
    this.onGround = true;
    this.supershotCharge = 0;
    this.supershotReady = true;
    this.supershotCooldownTimer = 0;
    this.frozen = false;
    this.frozenTimer = 0;
    this.speedBoost = false;
    this.speedBoostTimer = 0;
    this.celebrating = false;
    this.celebrationTimer = 0;
    this.celebrationType = null;
    this.kickCooldown = 0;
    this.animTimer = 0;
    this.legPhase = 0;
    this.bobbleOffset = 0;
  }

  updateInput(keys, mouseInput, dt) {
    if (this.celebrating || this.frozen || this.isRemote) return;

    const inputX = mouseInput ? mouseInput.x : (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
    const inputY = mouseInput ? mouseInput.y : (keys.up ? -1 : 0) + (keys.down ? 1 : 0);

    const speed = PLAYER_CONFIG.maxSpeed * (this.speedBoost ? 1.5 : 1);

    if (inputX !== 0) {
      this.direction = inputX > 0 ? 1 : -1;
      this.scene.matter.body.setVelocity(this.body, {
        x: inputX * speed,
        y: this.body.velocity.y,
      });
    } else {
      const vx = this.body.velocity.x;
      this.scene.matter.body.setVelocity(this.body, {
        x: vx * 0.85,
        y: this.body.velocity.y,
      });
    }

    if (inputY !== 0) {
      this.scene.matter.body.setVelocity(this.body, {
        x: this.body.velocity.x,
        y: inputY * speed,
      });
    }

    this.scene.matter.body.setVelocity(this.headBody, {
      x: this.body.velocity.x,
      y: this.body.velocity.y,
    });
  }

  jump() {
    if (!this.onGround || this.celebrating || this.frozen) return;
    const force = PLAYER_CONFIG.jumpForce;
    this.scene.matter.body.applyForce(this.body, this.body.position, { x: 0, y: force });
  }

  slide() {
    if (!this.onGround || this.celebrating || this.frozen) return;
    const dirX = this.direction * 8;
    this.scene.matter.body.setVelocity(this.body, {
      x: dirX,
      y: -2,
    });
  }

  kick(ball) {
    if (this.kickCooldown > 0 || this.celebrating || this.frozen) return;
    const dx = ball.body.position.x - this.body.position.x;
    const dy = ball.body.position.y - this.body.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const reach = this.headRadius + 20;

    if (dist > reach) return;

    const kickForce = 0.015;
    const angle = Math.atan2(dy, dx);
    this.scene.matter.body.applyForce(ball.body, ball.body.position, {
      x: Math.cos(angle) * kickForce,
      y: Math.sin(angle) * kickForce - 0.005,
    });
    this.kickCooldown = 8;
  }

  supershotChargeKick(chargeAmount, ball, targetAngle) {
    if (!this.supershotReady || this.celebrating || this.frozen) return false;
    const dx = ball.body.position.x - this.body.position.x;
    const dy = ball.body.position.y - this.body.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > this.headRadius + 30) return false;

    const power = chargeAmount * 0.03;
    const angle = targetAngle !== undefined ? targetAngle : Math.atan2(dy, dx);
    this.scene.matter.body.applyForce(ball.body, ball.body.position, {
      x: Math.cos(angle) * power,
      y: Math.sin(angle) * power - 0.01,
    });

    this.supershotReady = false;
    this.supershotCooldownTimer = 5000;
    return true;
  }

  updateTimers(dt) {
    if (this.kickCooldown > 0) this.kickCooldown--;
    if (this.frozenTimer > 0) {
      this.frozenTimer -= dt;
      if (this.frozenTimer <= 0) this.frozen = false;
    }
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= dt;
      if (this.speedBoostTimer <= 0) this.speedBoost = false;
    }
    if (this.supershotCooldownTimer > 0) {
      this.supershotCooldownTimer -= dt;
      if (this.supershotCooldownTimer <= 0) this.supershotReady = true;
    }
    if (this.celebrating) {
      this.celebrationTimer -= dt;
      if (this.celebrationTimer <= 0) {
        this.celebrating = false;
        this.celebrationType = null;
      }
    }
  }

  applyPowerUp(type) {
    switch (type) {
      case 'speed':
        this.speedBoost = true;
        this.speedBoostTimer = 8000;
        break;
      case 'supershot':
        this.supershotReady = true;
        this.supershotCooldownTimer = 0;
        break;
      case 'freeze':
        this.frozen = true;
        this.frozenTimer = 3000;
        this.scene.matter.body.setVelocity(this.body, { x: 0, y: 0 });
        break;
    }
  }

  startCelebration(type) {
    this.celebrating = true;
    this.celebrationType = type;
    this.celebrationTimer = 2000;
    this.scene.matter.body.setVelocity(this.body, { x: 0, y: 0 });
  }

  draw(cameraScroll) {
    this.checkGrounded();
    this.animTimer++;

    const bx = this.body.position.x;
    const by = this.body.position.y;
    const hx = this.headBody.position.x;
    const hy = this.headBody.position.y;

    const speed = Math.abs(this.body.velocity.x);
    if (speed > 30) {
      this.legPhase += 0.15;
    }

    this.graphics.clear();
    this.hairGraphics.clear();
    this.accGraphics.clear();

    this.drawShadow(bx, by + this.bodyH / 2 + PLAYER_CONFIG.legLength + 2);

    this.drawLegs(bx, by, this.legPhase);

    this.drawBody(bx, by);

    this.drawArms(bx, by);

    this.bobbleOffset = Math.sin(this.animTimer * 0.08) * 3;
    const hby = hy + this.bobbleOffset;

    this.drawHead(hx, hby);

    if (this.frozen) {
      this.graphics.lineStyle(3, 0x88ccff, 0.8);
      this.graphics.strokeCircle(hx, hby, this.headRadius + 6);
    }

    if (this.speedBoost) {
      this.graphics.lineStyle(2, 0xffcc00, 0.7);
      this.graphics.strokeCircle(bx, by, this.bodyW + 4);
    }
  }

  drawShadow(x, y) {
    this.graphics.fillStyle(0x000000, 0.25);
    this.graphics.fillEllipse(x + 2, y, 30, 10);
  }

  drawLegs(bx, by, phase) {
    const legColor = 0x333344;
    this.graphics.fillStyle(legColor, 1);
    this.graphics.lineStyle(1, 0x222233, 0.5);

    const lx = this.leftLeg.position.x;
    const ly = this.leftLeg.position.y;

    const rl = PLAYER_CONFIG.legLength;
    const sinVal = Math.sin(phase) * 0.4;
    const cosVal = Math.cos(phase) * 0.4;

    this.graphics.fillRect(lx - 4, ly - rl / 2, 8, rl);
    this.graphics.strokeRect(lx - 4, ly - rl / 2, 8, rl);

    const rx = this.rightLeg.position.x;
    const ry = this.rightLeg.position.y;

    this.graphics.fillRect(rx - 4, ry - rl / 2, 8, rl);
    this.graphics.strokeRect(rx - 4, ry - rl / 2, 8, rl);

    const shoeColor = 0x111122;
    this.graphics.fillStyle(shoeColor, 1);
    this.graphics.fillRoundedRect(lx - 5, ly + 2, 10, 8, 2);
    this.graphics.fillRoundedRect(rx - 5, ry + 2, 10, 8, 2);
  }

  drawBody(bx, by) {
    const shirtColor = this.charConfig.shirtColor || 0xcc3333;
    this.graphics.fillStyle(shirtColor, 1);
    this.graphics.fillRoundedRect(bx - this.bodyW / 2, by - this.bodyH / 2, this.bodyW, this.bodyH, 4);

    this.graphics.lineStyle(1, 0x000000, 0.2);
    this.graphics.strokeRoundedRect(bx - this.bodyW / 2, by - this.bodyH / 2, this.bodyW, this.bodyH, 4);

    if (this.charConfig.playerNumber) {
      this.graphics.fillStyle(0xffffff, 0.9);
      this.drawTextCentered(bx, by - 2, String(this.charConfig.playerNumber), 14, '#ffffff');
    }
  }

  drawTextCentered(x, y, text, size, color) {
    const ctx = (typeof this.scene.sys?.game?.context === 'function') ? null : null;
  }

  drawArms(bx, by) {
    const skinColor = this.getSkinColor();
    this.graphics.fillStyle(skinColor, 1);

    const angleL = Math.sin(this.animTimer * 0.1) * 0.3;
    const angleR = Math.cos(this.animTimer * 0.1) * 0.3;

    const axL = bx - this.bodyW / 2 - 2;
    const axR = bx + this.bodyW / 2 + 2;
    const ay = by - this.bodyH / 2 + 8;

    this.graphics.fillEllipse(axL - 2, ay + 10, 8, 18);
    this.graphics.fillEllipse(axR + 2, ay + 10, 8, 18);

    this.graphics.fillCircle(axL - 2, ay + 20, 5);
    this.graphics.fillCircle(axR + 2, ay + 20, 5);
  }

  drawHead(hx, hy) {
    const skinColor = this.getSkinColor();
    const headShape = this.charConfig.headShape || 'round';

    this.graphics.fillStyle(skinColor, 1);

    switch (headShape) {
      case 'oval':
        this.graphics.fillEllipse(hx, hy, this.headRadius * 1.8, this.headRadius * 2.1);
        break;
      case 'square':
        this.graphics.fillRoundedRect(
          hx - this.headRadius * 0.9,
          hy - this.headRadius,
          this.headRadius * 1.8,
          this.headRadius * 2,
          6
        );
        break;
      case 'wide':
        this.graphics.fillEllipse(hx, hy, this.headRadius * 2.1, this.headRadius * 1.7);
        break;
      default:
        this.graphics.fillCircle(hx, hy, this.headRadius);
        break;
    }

    this.drawHair(hx, hy);
    this.drawEyes(hx, hy);
    this.drawMouth(hx, hy);
    this.drawAccessory(hx, hy);
  }

  getSkinColor() {
    const part = this.charConfig.skinColor || 'medium';
    const colors = { light: 0xf5d0b0, medium: 0xe0a87c, tan: 0xc68642, brown: 0x8d5524, dark: 0x5c3a1e };
    return colors[part] || 0xe0a87c;
  }

  drawHair(hx, hy) {
    const style = this.charConfig.hairStyle || 'short';
    if (style === 'none') return;

    const hairColor = this.getHairColor();
    this.hairGraphics.fillStyle(hairColor, 1);

    const top = hy - this.headRadius * 0.85;
    const r = this.headRadius;

    switch (style) {
      case 'short':
        this.hairGraphics.fillEllipse(hx, top - 2, r * 1.8, 10);
        break;
      case 'spiky':
        for (let i = 0; i < 7; i++) {
          const sx = hx - 20 + i * 7;
          const spikeH = 8 + Math.random() * 10;
          this.hairGraphics.fillTriangle(sx - 3, top, sx + 3, top, sx, top - spikeH);
        }
        break;
      case 'mohawk':
        this.hairGraphics.fillRect(hx - 3, top - 18, 6, 20);
        break;
      case 'flat':
        this.hairGraphics.fillRect(hx - r * 0.9, top - 4, r * 1.8, 8);
        break;
      case 'curly':
        for (let i = 0; i < 8; i++) {
          const cx = hx - 18 + i * 5;
          this.hairGraphics.fillCircle(cx + Math.sin(i * 2) * 3, top - 5, 6);
        }
        break;
      case 'long':
        this.hairGraphics.fillEllipse(hx, hy - r * 0.3, r * 1.7, r * 0.5);
        this.hairGraphics.fillRect(hx - r, hy - r * 0.5, 8, r * 0.6);
        this.hairGraphics.fillRect(hx + r - 8, hy - r * 0.5, 8, r * 0.6);
        break;
      case 'afro':
        this.hairGraphics.fillCircle(hx, hy - 2, r * 1.3);
        break;
      case 'swept':
        this.hairGraphics.fillEllipse(hx - 5, top - 2, r * 1.6, 10);
        break;
    }
  }

  getHairColor() {
    const part = this.charConfig.hairColor || 'brown';
    const colors = {
      black: 0x222222, brown: 0x5c3317, blonde: 0xd4a854,
      red: 0xc04040, blue: 0x4060c0, green: 0x40a040,
      pink: 0xd870a0, grey: 0x888888,
    };
    return colors[part] || 0x5c3317;
  }

  drawEyes(hx, hy) {
    const style = this.charConfig.eyeStyle || 'normal';
    const eyeY = hy - 2;

    if (style === 'shades') {
      this.accGraphics.fillStyle(0x222222, 0.9);
      this.accGraphics.fillRect(hx - 12, eyeY - 6, 24, 10);
      return;
    }

    const leX = hx - 8;
    const reX = hx + 8;

    this.graphics.fillStyle(0xffffff, 1);

    switch (style) {
      case 'big':
        this.graphics.fillCircle(leX, eyeY, 6);
        this.graphics.fillCircle(reX, eyeY, 6);
        break;
      case 'small':
        this.graphics.fillCircle(leX, eyeY, 3);
        this.graphics.fillCircle(reX, eyeY, 3);
        break;
      case 'angry':
        this.graphics.fillRect(leX - 5, eyeY - 2, 10, 3);
        this.graphics.fillRect(reX - 5, eyeY - 2, 10, 3);
        break;
      case 'sleepy':
        this.graphics.fillEllipse(leX, eyeY, 8, 3);
        this.graphics.fillEllipse(reX, eyeY, 8, 3);
        break;
      case 'round':
        this.graphics.fillCircle(leX, eyeY, 5.5);
        this.graphics.fillCircle(reX, eyeY, 5.5);
        break;
      case 'cool':
        this.graphics.fillEllipse(leX, eyeY, 10, 5);
        this.graphics.fillEllipse(reX, eyeY, 10, 5);
        break;
      default:
        this.graphics.fillEllipse(leX, eyeY, 8, 5);
        this.graphics.fillEllipse(reX, eyeY, 8, 5);
        break;
    }

    this.graphics.fillStyle(0x222222, 1);
    this.graphics.fillCircle(leX, eyeY, 2.5);
    this.graphics.fillCircle(reX, eyeY, 2.5);
  }

  drawMouth(hx, hy) {
    const style = this.charConfig.mouthStyle || 'smile';
    const mouthY = hy + 8;

    this.graphics.fillStyle(0x000000, 0.5);
    this.graphics.lineStyle(1.5, 0x883333, 0.8);

    switch (style) {
      case 'smile':
        this.graphics.beginPath();
        this.graphics.arc(hx, mouthY, 6, 0.1, Math.PI - 0.1, false);
        this.graphics.strokePath();
        break;
      case 'neutral':
        this.graphics.fillRect(hx - 6, mouthY, 12, 2);
        break;
      case 'open':
        this.graphics.fillEllipse(hx, mouthY + 2, 8, 5);
        break;
      case 'grin':
        this.graphics.beginPath();
        this.graphics.arc(hx, mouthY - 1, 7, 0.1, Math.PI - 0.1, false);
        this.graphics.strokePath();
        this.graphics.fillStyle(0xffffff, 0.9);
        this.graphics.fillRect(hx - 6, mouthY - 1, 4, 5);
        this.graphics.fillRect(hx + 2, mouthY - 1, 4, 5);
        break;
      case 'tongue':
        this.graphics.beginPath();
        this.graphics.arc(hx, mouthY, 5, 0.1, Math.PI - 0.1, false);
        this.graphics.strokePath();
        this.graphics.fillStyle(0xcc4444, 1);
        this.graphics.fillEllipse(hx, mouthY + 4, 4, 3);
        break;
      case 'frown':
        this.graphics.beginPath();
        this.graphics.arc(hx, mouthY + 6, 6, -0.1 - Math.PI, -0.1, false);
        this.graphics.strokePath();
        break;
    }
  }

  drawAccessory(hx, hy) {
    const acc = this.charConfig.accessory || 'none';
    this.accGraphics.fillStyle(0x000000, 1);

    const top = hy - this.headRadius * 0.85;

    switch (acc) {
      case 'headband':
        this.accGraphics.fillStyle(0xff4444, 1);
        this.accGraphics.fillRect(hx - this.headRadius + 2, top - 2, this.headRadius * 2 - 4, 5);
        break;
      case 'cap':
        this.accGraphics.fillStyle(0x2255aa, 1);
        this.accGraphics.fillEllipse(hx, top - 6, this.headRadius * 1.8, 10);
        this.accGraphics.fillRect(hx + 8, top - 14, 16, 12);
        break;
      case 'crown':
        this.accGraphics.fillStyle(0xffcc00, 1);
        const pts = [hx - 12, top + 2, hx - 8, top - 12, hx - 2, top, hx + 2, top - 14, hx + 8, top, hx + 12, top + 2];
        this.accGraphics.fillPoints(
          pts.map((v, i) => {
            const g = new Phaser.GameObjects.Graphics(this.scene);
            return new Phaser.Geom.Point(v, pts[++i] || 0);
          }),
          true
        );
        break;
      case 'glasses':
        this.accGraphics.lineStyle(2, 0x333333, 1);
        this.accGraphics.strokeCircle(hx - 8, hy - 2, 7);
        this.accGraphics.strokeCircle(hx + 8, hy - 2, 7);
        this.accGraphics.beginPath();
        this.accGraphics.moveTo(hx - 1, hy - 2);
        this.accGraphics.lineTo(hx + 1, hy - 2);
        this.accGraphics.strokePath();
        break;
      case 'sunglasses':
        this.accGraphics.fillStyle(0x111122, 1);
        this.accGraphics.fillRect(hx - 14, hy - 7, 28, 10);
        break;
      case 'tophat':
        this.accGraphics.fillStyle(0x222233, 1);
        this.accGraphics.fillRect(hx - 10, top - 24, 20, 24);
        this.accGraphics.fillRect(hx - 16, top - 4, 32, 6);
        break;
      case 'beanie':
        this.accGraphics.fillStyle(0x3366aa, 1);
        this.accGraphics.fillEllipse(hx, top - 2, this.headRadius * 1.9, 12);
        this.accGraphics.fillCircle(hx, top - 10, 5);
        break;
    }
  }

  checkGrounded() {
    const bodies = this.scene.matter.world.localWorld.bodies;
    this.onGround = false;
    const footY = this.body.position.y + this.bodyH / 2 + PLAYER_CONFIG.legLength;
    for (const b of bodies) {
      if (b.isStatic && !b.isSensor && b !== this.body) {
        if (footY >= b.bounds.min.y - 4 && footY <= b.bounds.min.y + 12) {
          this.onGround = true;
          break;
        }
      }
    }
  }

  destroy() {
    this.graphics.destroy();
    this.hairGraphics.destroy();
    this.accGraphics.destroy();
    this.scene.matter.world.remove(this.headConstraint);
    this.scene.matter.world.remove(this.leftLegConstraint);
    this.scene.matter.world.remove(this.rightLegConstraint);
    [this.body, this.headBody, this.leftLeg, this.rightLeg].forEach((b) => {
      if (b) this.scene.matter.world.remove(b);
    });
  }
}
