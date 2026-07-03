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
import { SpectateScene } from './scenes/SpectateScene.js';

console.log('[OfficeFootball] Initializing Phaser...');

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

console.log('[OfficeFootball] Config:', JSON.stringify({ type: config.type, width: config.width, height: config.height, physics: config.physics.default }));

const game = new Phaser.Game(config);
console.log('[OfficeFootball] Game instance created:', !!game);

window.__OF_GAME = game;

game.events.on('ready', () => {
  console.log('[OfficeFootball] Game ready event fired');
});
