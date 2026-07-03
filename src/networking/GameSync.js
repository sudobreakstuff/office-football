export class GameSync {
  constructor(roomManager, isHost = false) {
    this.rm = roomManager;
    this.isHost = isHost;
    this.syncInterval = null;
    this.syncRate = 50;
    this.lastState = null;
    this.remoteState = null;
    this.onRemoteState = null;
  }

  start() {
    if (!this.isHost) return;

    this.syncInterval = setInterval(() => {
      this.sendState();
    }, this.syncRate);
  }

  sendState(ballPos, ballVel, players, scores) {
    if (!this.isHost || !this.rm) return;

    const state = {
      ball: {
        x: ballPos?.x || 0,
        y: ballPos?.y || 0,
        vx: ballVel?.x || 0,
        vy: ballVel?.y || 0,
      },
      players: players?.map((p) => ({
        x: p?.x || 0,
        y: p?.y || 0,
        hx: p?.hx || 0,
        hy: p?.hy || 0,
        dir: p?.dir || 1,
        team: p?.team || 0,
      })) || [],
      scores,
      timestamp: Date.now(),
    };

    this.lastState = state;
    this.rm.broadcast('game_state', state);
  }

  receiveState(state) {
    if (this.isHost) return;
    this.remoteState = state;
    if (this.onRemoteState) {
      this.onRemoteState(state);
    }
  }

  sendInput(input) {
    this.rm.broadcast('player_input', {
      x: input.x || 0,
      y: input.y || 0,
      kick: input.kick || false,
      supershot: input.supershot || false,
      supershotCharge: input.supershotCharge || 0,
      jump: input.jump || false,
      slide: input.slide || false,
      dir: input.dir || 1,
      timestamp: Date.now(),
    });
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  destroy() {
    this.stop();
  }
}
