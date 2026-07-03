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

try {
  new Phaser.Game(config);
} catch (err) {
  const el = document.getElementById('game-container');
  if (el) {
    el.innerHTML = `<div style="color:#ff4444;font-family:Arial,sans-serif;padding:40px;text-align:center;">
      <h2>Game failed to start</h2>
      <p style="font-family:monospace;font-size:12px;">${err.message}</p>
      <pre style="color:#888;font-size:10px;">${err.stack}</pre>
    </div>`;
  }
  console.error('Phaser init error:', err);
}

