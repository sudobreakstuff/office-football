import { MATCH_DURATION, GOAL_LIMIT } from '../config.js';

export class MatchManager {
  constructor(scene) {
    this.scene = scene;
    this.scores = { team0: 0, team1: 0 };
    this.timeRemaining = MATCH_DURATION;
    this.matchOver = false;
    this.matchStarted = false;
    this.matchPaused = false;
    this.winner = null;
    this.goalScored = false;
    this.goalCooldown = 0;
    this.matchTimer_event = null;
    this.goalCallbacks = [];
    this.endCallbacks = [];
  }

  start() {
    this.matchStarted = true;
    this.matchOver = false;
    this.scores = { team0: 0, team1: 0 };
    this.timeRemaining = MATCH_DURATION;
    this.winner = null;
    this.goalScored = false;
    this.goalCooldown = 0;

    this.matchTimer_event = this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.matchPaused && this.matchStarted && !this.matchOver) {
          this.timeRemaining--;
          if (this.timeRemaining <= 0) {
            this.endMatch();
          }
        }
      },
      loop: true,
    });
  }

  scoreGoal(team) {
    if (this.goalCooldown > 0 || this.matchOver) return;

    const teamKey = `team${team}`;
    this.scores[teamKey]++;
    this.goalScored = true;
    this.goalCooldown = 3000;

    this.goalCallbacks.forEach((cb) => cb(team, this.scores));

    if (this.scores[teamKey] >= GOAL_LIMIT) {
      this.endMatch();
    }

    this.scene.time.delayedCall(3000, () => {
      this.goalScored = false;
    });
  }

  endMatch() {
    if (this.matchOver) return;
    this.matchOver = true;

    if (this.matchTimer_event) {
      this.matchTimer_event.remove();
    }

    if (this.scores.team0 > this.scores.team1) {
      this.winner = 0;
    } else if (this.scores.team1 > this.scores.team0) {
      this.winner = 1;
    } else {
      this.winner = -1;
    }

    this.endCallbacks.forEach((cb) => cb(this.winner, this.scores));
  }

  onGoal(callback) {
    this.goalCallbacks.push(callback);
  }

  onEnd(callback) {
    this.endCallbacks.push(callback);
  }

  resetBall() {
    this.scene.ball.reset(
      this.scene.pitchCenterX,
      this.scene.pitchCenterY
    );
  }

  update(dt) {
    if (this.goalCooldown > 0) {
      this.goalCooldown -= dt;
    }
  }

  destroy() {
    if (this.matchTimer_event) this.matchTimer_event.remove();
    this.goalCallbacks = [];
    this.endCallbacks = [];
  }
}
