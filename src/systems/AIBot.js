import { BALL_CONFIG, PLAYER_CONFIG } from '../config.js';

const State = {
  DEFEND: 'defend',
  CHASE: 'chase',
  ATTACK: 'attack',
  RECOVER: 'recover',
};

export class AIBot {
  constructor(player, ball, opponent, goalTarget, difficulty = 'medium') {
    this.player = player;
    this.ball = ball;
    this.opponent = opponent;
    this.goalTarget = goalTarget;
    this.difficulty = difficulty;
    this.state = State.DEFEND;
    this.stateTimer = 0;
    this.shootCooldown = 0;
    this.jumpCooldown = 0;
    this.decisionTimer = 0;

    this.config = {
      easy: { speed: 0.5, reaction: 40, accuracy: 0.3, aggression: 0.2, shootDist: 200 },
      medium: { speed: 0.75, reaction: 20, accuracy: 0.6, aggression: 0.5, shootDist: 300 },
      hard: { speed: 0.95, reaction: 8, accuracy: 0.85, aggression: 0.8, shootDist: 400 },
    };
  }

  get cfg() {
    return this.config[this.difficulty];
  }

  update(dt) {
    this.decisionTimer += dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.jumpCooldown > 0) this.jumpCooldown -= dt;

    if (this.decisionTimer < this.cfg.reaction) return;

    this.decisionTimer = 0;
    this.updateState();
    this.executeState();
  }

  updateState() {
    const px = this.player.body.position.x;
    const py = this.player.body.position.y;
    const bx = this.ball.body.position.x;
    const by = this.ball.body.position.y;
    const distToBall = this.dist(px, py, bx, by);

    const nearBall = distToBall < 50;
    const hasBall = distToBall < 45 && this.isFacingBall();

    const opponentHasBall =
      this.opponent &&
      this.dist(this.opponent.body.position.x, this.opponent.body.position.y, bx, by) < 50;

    if (hasBall) {
      this.state = State.ATTACK;
    } else if (opponentHasBall || nearBall) {
      this.state = State.CHASE;
    } else if (this.state === State.ATTACK && distToBall > 100) {
      this.state = State.RECOVER;
    } else if (this.state === State.RECOVER && distToBall < 200) {
      this.state = this.ballIsInMyHalf() ? State.DEFEND : State.CHASE;
    } else if (this.state !== State.ATTACK && this.state !== State.RECOVER) {
      this.state = this.ballIsInMyHalf() ? State.DEFEND : State.CHASE;
    }
  }

  executeState() {
    switch (this.state) {
      case State.DEFEND:
        this.defend();
        break;
      case State.CHASE:
        this.chase();
        break;
      case State.ATTACK:
        this.attack();
        break;
      case State.RECOVER:
        this.recover();
        break;
    }
  }

  defend() {
    const px = this.player.body.position.x;
    const py = this.player.body.position.y;
    const bx = this.ball.body.position.x;
    const by = this.ball.body.position.y;

    const defendX = bx + (this.goalTarget.x - bx) * 0.3;
    const defendY = by * 0.5 + py * 0.5;

    this.moveToward(defendX, defendY);
  }

  chase() {
    const bx = this.ball.body.position.x;
    const by = this.ball.body.position.y;

    this.moveToward(bx, by);

    const dist = this.dist(
      this.player.body.position.x, this.player.body.position.y,
      bx, by
    );

    if (dist < 60 && this.jumpCooldown <= 0 && Math.random() < 0.1) {
      this.player.slide();
      this.jumpCooldown = 500;
    }
  }

  attack() {
    const gx = this.goalTarget.x;
    const gy = this.goalTarget.y;
    const py = this.player.body.position.y;
    const px = this.player.body.position.x;

    this.moveToward(gx, gy + (py - gy) * 0.3);

    const distToGoal = Math.abs(gx - px);

    if (distToGoal < this.cfg.shootDist && this.shootCooldown <= 0) {
      const pShot = Math.random();
      if (pShot < this.cfg.accuracy * 0.3 && Math.random() < 0.4) {
        const charge = 0.6 + Math.random() * 0.4;
        const aimAngle = this.goalTarget.x > 640 ? 0 : Math.PI;
        this.player.supershotChargeKick(charge, this.ball, aimAngle);
      } else {
        this.player.kick(this.ball);
      }
      this.shootCooldown = 600;
    }
  }

  recover() {
    const defendX = this.goalTarget.x + (this.goalTarget.x > 640 ? -200 : 200);
    const defendY = 360;
    this.moveToward(defendX, defendY);
  }

  moveToward(tx, ty) {
    const px = this.player.body.position.x;
    const py = this.player.body.position.y;
    const dx = tx - px;
    const dy = ty - py;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      this.player.updateInput(
        { left: false, right: false, up: false, down: false },
        null
      );
      return;
    }

    const normX = dx / dist;
    const normY = dy / dist;
    const speedFactor = this.cfg.speed;

    this.player.updateInput(
      {
        left: normX < -0.2,
        right: normX > 0.2,
        up: normY < -0.2,
        down: normY > 0.2,
      },
      null
    );
  }

  ballIsInMyHalf() {
    const bx = this.ball.body.position.x;
    const isLeftHalf = bx < 640;
    const defenderOnLeft = this.goalTarget.x < 640;
    return isLeftHalf === defenderOnLeft;
  }

  isFacingBall() {
    const px = this.player.body.position.x;
    const py = this.player.body.position.y;
    const bx = this.ball.body.position.x;
    const by = this.ball.body.position.y;
    const facingDir = this.player.direction;
    return (bx - px) * facingDir > 0;
  }

  dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
}
