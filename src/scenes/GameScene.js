import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, PITCH_WIDTH, PITCH_HEIGHT,
  GOAL_WIDTH, GOAL_HEIGHT, GOAL_Y, SUPERSHOT,
} from '../config.js';
import { Ball } from '../entities/Ball.js';
import { Player } from '../entities/Player.js';
import { Goal } from '../entities/Goal.js';
import { InputManager } from '../systems/InputManager.js';
import { MatchManager } from '../systems/MatchManager.js';
import { PowerUpManager } from '../systems/PowerUpManager.js';
import { HUD } from '../ui/HUD.js';
import { Celebration } from '../ui/Celebration.js';
import { defaultCharacter } from '../data/characterParts.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.mode = data?.mode || 'local';
    this.p1Character = data?.p1Character || { ...defaultCharacter, playerName: 'P1', playerNumber: 7 };
    this.p2Character = data?.p2Character || { ...defaultCharacter, playerName: 'P2', playerNumber: 10, shirtColor: 0x3366cc };
    this.isHost = data?.isHost !== false;
    this.roomCode = data?.roomCode || null;
  }

  create() {
    this.cameras.main.setBackgroundColor('#2d5a27');

    this.drawPitch();

    this.pitchCenterX = PITCH_WIDTH / 2;
    this.pitchCenterY = PITCH_HEIGHT / 2;

    this.ball = new Ball(this, this.pitchCenterX, this.pitchCenterY);

    this.goalLeft = new Goal(this, 0, 'left');
    this.goalRight = new Goal(this, PITCH_WIDTH, 'right');

    const p1StartX = 250;
    const p1StartY = PITCH_HEIGHT / 2;
    const p2StartX = PITCH_WIDTH - 250;
    const p2StartY = PITCH_HEIGHT / 2;

    this.player1 = new Player(this, p1StartX, p1StartY, {
      character: this.p1Character,
      team: 0,
      playerIndex: 0,
    });

    this.player2 = new Player(this, p2StartX, p2StartY, {
      character: this.p2Character,
      team: 1,
      playerIndex: 1,
    });

    this.players = [this.player1, this.player2];

    this.input1 = new InputManager(this);
    this.input2 = null;

    if (this.mode === 'local') {
      this.input2 = new InputManager(this);
    }

    this.matchManager = new MatchManager(this);
    this.powerUpManager = new PowerUpManager(this);
    this.hud = new HUD(this);
    this.celebration = new Celebration(this);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.supershotCharge1 = 0;
    this.supershotCharge2 = 0;
    this.isChargingSupershot1 = false;
    this.isChargingSupershot2 = false;

    this.goalParticles = [];

    this.cameraScrollX = 0;

    this.matchManager.onGoal((team, scores) => {
      this.hud.showGoal(team);
      const scorer = team === 0 ? this.player1 : this.player2;
      const idx = team === 0 ? 0 : 1;
      const goalPos = team === 0
        ? { x: this.goalRight.sensorBody.position.x, y: this.goalRight.sensorBody.position.y }
        : { x: this.goalLeft.sensorBody.position.x, y: this.goalLeft.sensorBody.position.y };
      this.spawnGoalParticles(goalPos.x, goalPos.y);
      scorer.startCelebration('arms_up');
      this.celebration.play(scorer, 'arms_up', scorer.body.position.x, scorer.body.position.y - 60);
      this.time.delayedCall(1500, () => this.resetAfterGoal());
    });

    this.matchManager.onEnd((winner, scores) => {
      this.hud.showMatchEnd(winner);
    });

    this.startMatch();
  }

  startMatch() {
    this.matchManager.start();
    this.ball.reset(this.pitchCenterX, this.pitchCenterY);

    this.scene.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach((pair) => {
        this.handleCollision(pair);
      });
    });
  }

  resetAfterGoal() {
    this.ball.reset(this.pitchCenterX, this.pitchCenterY);

    this.scene.matter.body.setPosition(this.player1.body, { x: 250, y: PITCH_HEIGHT / 2 });
    this.scene.matter.body.setPosition(this.player1.headBody, { x: 250, y: PITCH_HEIGHT / 2 - 50 });
    this.scene.matter.body.setVelocity(this.player1.body, { x: 0, y: 0 });
    this.scene.matter.body.setVelocity(this.player1.headBody, { x: 0, y: 0 });

    this.scene.matter.body.setPosition(this.player2.body, { x: PITCH_WIDTH - 250, y: PITCH_HEIGHT / 2 });
    this.scene.matter.body.setPosition(this.player2.headBody, { x: PITCH_WIDTH - 250, y: PITCH_HEIGHT / 2 - 50 });
    this.scene.matter.body.setVelocity(this.player2.body, { x: 0, y: 0 });
    this.scene.matter.body.setVelocity(this.player2.headBody, { x: 0, y: 0 });
  }

  handleCollision(pair) {
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;

    if (bodyA.label === 'ball' && bodyB.label === 'goal') {
      const team = bodyB.goalSide === 'left' ? 1 : 0;
      if (!this.matchManager.goalScored) {
        this.matchManager.scoreGoal(team);
      }
    }
    if (bodyB.label === 'ball' && bodyA.label === 'goal') {
      const team = bodyA.goalSide === 'left' ? 1 : 0;
      if (!this.matchManager.goalScored) {
        this.matchManager.scoreGoal(team);
      }
    }

    if (bodyA.label === 'player' && bodyB.label === 'powerup') {
      this.powerUpManager.checkCollision(bodyA);
    }
    if (bodyB.label === 'player' && bodyA.label === 'powerup') {
      this.powerUpManager.checkCollision(bodyB);
    }

    const ballBody = bodyA.label === 'ball' ? bodyA : bodyB.label === 'ball' ? bodyB : null;
    const playerBody = bodyA.label === 'player' ? bodyA : bodyB.label === 'player' ? bodyB : null;
    if (ballBody && playerBody) {
      this.ball.prevOwner = playerBody.playerRef;
    }
  }

  update(time, delta) {
    const dt = delta;

    this.ball.update();

    this.handleInput1(dt);
    this.handleInput2(dt);

    this.player1.updateTimers(dt);
    this.player2.updateTimers(dt);

    this.player1.draw(this.cameraScrollX);
    this.player2.draw(this.cameraScrollX);

    this.goalLeft.draw(this.cameraScrollX);
    this.goalRight.draw(this.cameraScrollX);

    this.powerUpManager.update(dt);
    this.matchManager.update(dt);

    this.containPlayersInPitch(this.player1);
    this.containPlayersInPitch(this.player2);
    this.containBallInPitch();

    this.updateCamera();

    this.hud.update(
      this.matchManager.timeRemaining,
      this.matchManager.scores,
      this.player1.supershotReady,
      this.player2.supershotReady
    );

    this.updateGoalParticles(dt);

    if (this.matchManager.matchOver && this.matchManager.goalCooldown <= 0) {
      this.hud.showMatchEnd(this.matchManager.winner);
    }
  }

  handleInput1(dt) {
    const input = this.input1.getPlayerInput(
      this.player1.body.position.x,
      this.player1.body.position.y
    );
    this.player1.updateInput(input, null, dt);

    if (this.input1.isJumpPressed()) {
      this.player1.jump();
    }
    if (this.input1.isSlidePressed()) {
      this.player1.slide();
    }

    if (this.input1.isSupershotPressed()) {
      if (!this.isChargingSupershot1 && this.player1.supershotReady) {
        this.isChargingSupershot1 = true;
        this.supershotCharge1 = 0;
      }
      if (this.isChargingSupershot1) {
        this.supershotCharge1 += dt;
      }
    } else if (this.isChargingSupershot1) {
      const charge = Math.min(this.supershotCharge1 / SUPERSHOT.chargeTime, 1);
      const aimAngle = this.input1.getAimDirection(
        this.player1.body.position.x,
        this.player1.body.position.y
      );
      const released = this.player1.supershotChargeKick(charge, this.ball, aimAngle);
      if (released) {
        this.spawnSupershotParticles(
          this.ball.body.position.x,
          this.ball.body.position.y,
          aimAngle
        );
      }
      this.isChargingSupershot1 = false;
      this.supershotCharge1 = 0;
    }

    if (this.input1.isKickPressed()) {
      this.player1.kick(this.ball);
    }
  }

  handleInput2(dt) {
    if (!this.input2) return;

    const input = this.input2.getPlayerInput(
      this.player2.body.position.x,
      this.player2.body.position.y
    );
    this.player2.updateInput(input, null, dt);

    if (this.input2.isJumpPressed()) {
      this.player2.jump();
    }
    if (this.input2.isSlidePressed()) {
      this.player2.slide();
    }

    if (this.input2.isSupershotPressed()) {
      if (!this.isChargingSupershot2 && this.player2.supershotReady) {
        this.isChargingSupershot2 = true;
        this.supershotCharge2 = 0;
      }
      if (this.isChargingSupershot2) {
        this.supershotCharge2 += dt;
      }
    } else if (this.isChargingSupershot2) {
      const charge = Math.min(this.supershotCharge2 / SUPERSHOT.chargeTime, 1);
      const aimAngle = this.input2.getAimDirection(
        this.player2.body.position.x,
        this.player2.body.position.y
      );
      const released = this.player2.supershotChargeKick(charge, this.ball, aimAngle);
      if (released) {
        this.spawnSupershotParticles(
          this.ball.body.position.x,
          this.ball.body.position.y,
          aimAngle
        );
      }
      this.isChargingSupershot2 = false;
      this.supershotCharge2 = 0;
    }

    if (this.input2.isKickPressed()) {
      this.player2.kick(this.ball);
    }
  }

  containPlayersInPitch(player) {
    const margin = 20;
    const bodies = [player.body, player.headBody, player.leftLeg, player.rightLeg];
    bodies.forEach((b) => {
      if (!b) return;
      if (b.position.x < margin) {
        this.matter.body.setPosition(b, { x: margin + 1, y: b.position.y });
        this.matter.body.setVelocity(b, { x: 0, y: b.velocity.y });
      }
      if (b.position.x > PITCH_WIDTH - margin) {
        this.matter.body.setPosition(b, { x: PITCH_WIDTH - margin - 1, y: b.position.y });
        this.matter.body.setVelocity(b, { x: 0, y: b.velocity.y });
      }
      if (b.position.y < margin) {
        this.matter.body.setPosition(b, { x: b.position.x, y: margin + 1 });
        this.matter.body.setVelocity(b, { x: b.velocity.x, y: 0 });
      }
      if (b.position.y > PITCH_HEIGHT - margin) {
        this.matter.body.setPosition(b, { x: b.position.x, y: PITCH_HEIGHT - margin - 1 });
        this.matter.body.setVelocity(b, { x: b.velocity.x, y: 0 });
      }
    });
  }

  containBallInPitch() {
    const margin = 20;
    const b = this.ball.body;
    const r = 14;

    if (b.position.x < margin + r) {
      this.matter.body.setPosition(b, { x: margin + r, y: b.position.y });
      this.matter.body.setVelocity(b, { x: Math.abs(b.velocity.x) * 0.5, y: b.velocity.y });
    }
    if (b.position.x > PITCH_WIDTH - margin - r) {
      this.matter.body.setPosition(b, { x: PITCH_WIDTH - margin - r, y: b.position.y });
      this.matter.body.setVelocity(b, { x: -Math.abs(b.velocity.x) * 0.5, y: b.velocity.y });
    }
    if (b.position.y < margin + r) {
      this.matter.body.setPosition(b, { x: b.position.x, y: margin + r });
      this.matter.body.setVelocity(b, { x: b.velocity.x, y: Math.abs(b.velocity.y) * 0.5 });
    }
    if (b.position.y > PITCH_HEIGHT - margin - r) {
      this.matter.body.setPosition(b, { x: b.position.x, y: PITCH_HEIGHT - margin - r });
      this.matter.body.setVelocity(b, { x: b.velocity.x, y: -Math.abs(b.velocity.y) * 0.5 });
    }

    // Stop condition for very slow balls
    if (Math.abs(b.velocity.x) < 1 && Math.abs(b.velocity.y) < 1) {
      this.matter.body.setVelocity(b, { x: 0, y: 0 });
    }
  }

  updateCamera() {
    const ballX = this.ball.body.position.x;
    const targetScroll = ballX - GAME_WIDTH / 2;
    const maxScroll = PITCH_WIDTH - GAME_WIDTH;
    const clamped = Phaser.Math.Clamp(targetScroll, 0, maxScroll);

    this.cameraScrollX += (clamped - this.cameraScrollX) * 0.1;
    this.cameras.main.scrollX = this.cameraScrollX;
  }

  drawPitch() {
    const bg = this.add.graphics();
    bg.setScrollFactor(1);

    bg.fillStyle(0x3a7d30, 1);
    bg.fillRect(0, 0, PITCH_WIDTH, PITCH_HEIGHT);

    for (let x = 0; x < PITCH_WIDTH; x += 80) {
      for (let y = 0; y < PITCH_HEIGHT; y += 80) {
        const shade = (Math.floor(x / 80) + Math.floor(y / 80)) % 2 === 0 ? 0x3d8032 : 0x377a2e;
        bg.fillStyle(shade, 1);
        bg.fillRect(x, y, 80, 80);
      }
    }

    bg.lineStyle(3, 0xffffff, 0.6);
    bg.beginPath();
    bg.moveTo(0, 0);
    bg.lineTo(PITCH_WIDTH, 0);
    bg.lineTo(PITCH_WIDTH, PITCH_HEIGHT);
    bg.lineTo(0, PITCH_HEIGHT);
    bg.lineTo(0, 0);
    bg.strokePath();

    bg.lineStyle(3, 0xffffff, 0.5);
    bg.beginPath();
    bg.moveTo(PITCH_WIDTH / 2, 0);
    bg.lineTo(PITCH_WIDTH / 2, PITCH_HEIGHT);
    bg.strokePath();

    bg.lineStyle(2, 0xffffff, 0.5);
    bg.strokeCircle(PITCH_WIDTH / 2, PITCH_HEIGHT / 2, 80);

    bg.fillStyle(0xffffff, 0.5);
    bg.fillCircle(PITCH_WIDTH / 2, PITCH_HEIGHT / 2, 6);

    bg.fillStyle(0xffffff, 0.2);
    const leftPenalty = new Phaser.Geom.Rectangle(0, PITCH_HEIGHT / 2 - 80, 150, 160);
    const rightPenalty = new Phaser.Geom.Rectangle(PITCH_WIDTH - 150, PITCH_HEIGHT / 2 - 80, 150, 160);
    bg.strokeRectShape(leftPenalty);
    bg.strokeRectShape(rightPenalty);

    const leftGoalArea = new Phaser.Geom.Rectangle(0, PITCH_HEIGHT / 2 - 40, 60, 80);
    const rightGoalArea = new Phaser.Geom.Rectangle(PITCH_WIDTH - 60, PITCH_HEIGHT / 2 - 40, 60, 80);
    bg.strokeRectShape(leftGoalArea);
    bg.strokeRectShape(rightGoalArea);

    bg.fillStyle(0xffffff, 0.15);
    bg.fillRect(0, GOAL_Y, GOAL_WIDTH, GOAL_HEIGHT);
    bg.fillRect(PITCH_WIDTH - GOAL_WIDTH, GOAL_Y, GOAL_WIDTH, GOAL_HEIGHT);

    this.matter.add.rectangle(PITCH_WIDTH / 2, -10, PITCH_WIDTH, 20, { isStatic: true, label: 'wall' });
    this.matter.add.rectangle(PITCH_WIDTH / 2, PITCH_HEIGHT + 10, PITCH_WIDTH, 20, { isStatic: true, label: 'wall' });

    this.matter.world.setBounds(0, 0, PITCH_WIDTH, PITCH_HEIGHT, 50, true, true, false, false);

    this.pitchGraphics = bg;
  }

  spawnGoalParticles(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.goalParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1.5,
        maxLife: 1.5,
        color: Math.random() > 0.5 ? 0xffdd00 : 0xffaa00,
      });
    }
  }

  spawnSupershotParticles(x, y, angle) {
    for (let i = 0; i < 10; i++) {
      const spread = angle + (Math.random() - 0.5) * 1.2;
      this.goalParticles.push({
        x,
        y,
        vx: Math.cos(spread) * 8,
        vy: Math.sin(spread) * 8,
        life: 0.8,
        maxLife: 0.8,
        color: 0xff6600,
      });
    }
  }

  updateGoalParticles(dt) {
    const g = this.add.graphics();
    g.setScrollFactor(1);

    for (let i = this.goalParticles.length - 1; i >= 0; i--) {
      const p = this.goalParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life -= dt / 1000;

      if (p.life <= 0) {
        this.goalParticles.splice(i, 1);
        continue;
      }

      g.fillStyle(p.color, p.life / p.maxLife);
      g.fillCircle(p.x, p.y, 3);
    }
  }

  getGameResult() {
    return {
      winner: this.matchManager.winner,
      scores: this.matchManager.scores,
      players: [
        { name: this.p1Character.playerName, team: 0 },
        { name: this.p2Character.playerName, team: 1 },
      ],
    };
  }

  shutdown() {
    this.matchManager?.destroy();
    this.powerUpManager?.destroy();
    this.hud?.destroy();
    this.input1?.destroy();
    this.input2?.destroy();
    this.celebration?.clear();
    this.goalParticles = [];
  }
}
