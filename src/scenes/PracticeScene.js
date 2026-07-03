import { GAME_WIDTH, PITCH_WIDTH, PITCH_HEIGHT } from '../config.js';
import { GameScene } from './GameScene.js';
import { AIBot } from '../systems/AIBot.js';
import { defaultCharacter } from '../data/characterParts.js';

export class PracticeScene extends GameScene {
  constructor() {
    super('PracticeScene');
  }

  init(data) {
    this.difficulty = data?.difficulty || 'medium';
    super.init({
      mode: 'practice',
      p1Character: data?.p1Character || { ...defaultCharacter, playerName: 'You', playerNumber: 9 },
      p2Character: { ...defaultCharacter, playerName: 'CPU', playerNumber: 1, shirtColor: 0x666688, hairColor: 'grey' },
    });
  }

  create() {
    super.create();

    const goalTarget = { x: PITCH_WIDTH - 100, y: PITCH_HEIGHT / 2 };
    this.aiBot = new AIBot(this.player2, this.ball, this.player1, goalTarget, this.difficulty);

    this.difficultyText = this.add.text(GAME_WIDTH / 2, 675, '', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    this.difficultyText.setText(`Difficulty: ${this.difficulty.toUpperCase()} | You vs CPU`);

    this.add.text(GAME_WIDTH / 2, 695, 'ESC to return to menu', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#666666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => {
        this.shutdown();
        this.scene.start('MenuScene');
      });
    }
  }

  handleInput2(dt) {
    if (this.aiBot) {
      this.aiBot.update(dt);
    }
  }

  shutdown() {
    super.shutdown();
  }
}
