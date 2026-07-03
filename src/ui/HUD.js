import { MATCH_DURATION, SUPERSHOT } from '../config.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(100);

    this.buildTimer();
    this.buildScore();
    this.buildSupershotBar();
    this.buildGoalText();
  }

  buildTimer() {
    this.timerText = this.scene.add.text(640, 15, '2:00', {
      fontSize: '36px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.timerText.setOrigin(0.5, 0);
    this.timerText.setScrollFactor(0);
    this.timerText.setDepth(100);
  }

  buildScore() {
    this.scoreText = this.scene.add.text(640, 58, '0 - 0', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffdd44',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.scoreText.setOrigin(0.5, 0);
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(100);
  }

  buildSupershotBar() {
    this.ssBarBg = this.scene.add.rectangle(200, 690, 200, 16, 0x333333);
    this.ssBarBg.setScrollFactor(0);
    this.ssBarBg.setDepth(100);
    this.ssBarBg.setStrokeStyle(1, 0x666666);

    this.ssBarFill = this.scene.add.rectangle(101, 690, 198, 14, 0xff4422);
    this.ssBarFill.setOrigin(0, 0.5);
    this.ssBarFill.setScrollFactor(0);
    this.ssBarFill.setDepth(100);

    this.ssBarLabel = this.scene.add.text(200, 674, 'SUPERSHOT', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff4422',
    });
    this.ssBarLabel.setOrigin(0.5);
    this.ssBarLabel.setScrollFactor(0);
    this.ssBarLabel.setDepth(100);

    this.ssBarP2Bg = this.scene.add.rectangle(1080, 690, 200, 16, 0x333333);
    this.ssBarP2Bg.setScrollFactor(0);
    this.ssBarP2Bg.setDepth(100);
    this.ssBarP2Bg.setStrokeStyle(1, 0x666666);

    this.ssBarP2Fill = this.scene.add.rectangle(981, 690, 198, 14, 0xff4422);
    this.ssBarP2Fill.setOrigin(0, 0.5);
    this.ssBarP2Fill.setScrollFactor(0);
    this.ssBarP2Fill.setDepth(100);

    this.ssBarP2Label = this.scene.add.text(1080, 674, 'SUPERSHOT', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff4422',
    });
    this.ssBarP2Label.setOrigin(0.5);
    this.ssBarP2Label.setScrollFactor(0);
    this.ssBarP2Label.setDepth(100);
  }

  buildGoalText() {
    this.goalText = this.scene.add.text(640, 200, 'GOAL!', {
      fontSize: '64px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffdd00',
      stroke: '#000000',
      strokeThickness: 6,
    });
    this.goalText.setOrigin(0.5);
    this.goalText.setScrollFactor(0);
    this.goalText.setDepth(100);
    this.goalText.setAlpha(0);
  }

  update(timeRemaining, scores, p1Ready, p2Ready) {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    this.timerText.setText(`${mins}:${secs.toString().padStart(2, '0')}`);

    if (timeRemaining <= 10) {
      this.timerText.setColor('#ff4444');
    } else if (timeRemaining <= 30) {
      this.timerText.setColor('#ffaa22');
    } else {
      this.timerText.setColor('#ffffff');
    }

    this.scoreText.setText(`${scores.team0} - ${scores.team1}`);

    const p1Cooldown = p1Ready ? 1 : Math.min(1, 1 - (p1Ready ? 0 : 0.5));
    this.ssBarFill.width = 198 * p1Cooldown;
    this.ssBarFill.fillColor = p1Ready ? 0xff4422 : 0x664444;

    const p2Cooldown = p2Ready ? 1 : 0.5;
    this.ssBarP2Fill.width = 198 * p2Cooldown;
    this.ssBarP2Fill.fillColor = p2Ready ? 0xff4422 : 0x664444;
  }

  showGoal(team) {
    const colors = [0xff4444, 0x4488ff];
    this.goalText.setColor(`#${colors[team]?.toString(16).padStart(6, '0') || 'ffdd00'}`);
    this.goalText.setAlpha(1);
    this.goalText.setScale(1.3);

    this.scene.tweens.add({
      targets: this.goalText,
      alpha: 0,
      scale: 0.8,
      duration: 2500,
      ease: 'Power2',
    });
  }

  showMatchEnd(winner) {
    const text = this.scene.add.text(640, 300, 'MATCH OVER!', {
      fontSize: '48px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5,
    });
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(100);

    const subText = winner === -1
      ? "It's a draw!"
      : `Player ${winner + 1} wins!`;

    const sub = this.scene.add.text(640, 360, subText, {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffdd44',
      stroke: '#000000',
      strokeThickness: 3,
    });
    sub.setOrigin(0.5);
    sub.setScrollFactor(0);
    sub.setDepth(100);

    this.scene.time.delayedCall(4000, () => {
      text.destroy();
      sub.destroy();
    });
  }

  destroy() {
    this.container.destroy();
    this.timerText?.destroy();
    this.scoreText?.destroy();
    this.ssBarBg?.destroy();
    this.ssBarFill?.destroy();
    this.ssBarLabel?.destroy();
    this.ssBarP2Bg?.destroy();
    this.ssBarP2Fill?.destroy();
    this.ssBarP2Label?.destroy();
    this.goalText?.destroy();
  }
}
