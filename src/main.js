import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { PracticeScene } from './scenes/PracticeScene.js';
import { LobbyScene } from './scenes/LobbyScene.js';
import { TournamentScene } from './scenes/TournamentScene.js';
import { CustomizeScene } from './scenes/CustomizeScene.js';
import { StatsScene } from './scenes/StatsScene.js';
import { SetupSupabaseScene } from './scenes/SetupSupabaseScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 0.8 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    MenuScene,
    GameScene,
    PracticeScene,
    LobbyScene,
    TournamentScene,
    CustomizeScene,
    StatsScene,
    SetupSupabaseScene,
    SpectateScene,
  ],
};

new Phaser.Game(config);
