import Phaser from 'phaser';

export class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false, rightDown: false, middleDown: false, worldX: 0, worldY: 0 };
    this.useMouse = false;
    this.mouseInputVec = null;
    this.cameraScrollX = 0;

    if (scene.input.keyboard) {
      this.keys.W = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keys.A = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keys.S = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keys.D = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keys.UP = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      this.keys.DOWN = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
      this.keys.LEFT = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      this.keys.RIGHT = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
      this.keys.X = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
      this.keys.L = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
      this.keys.Z = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
      this.keys.K = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
      this.keys.SHIFT = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.keys.SPACE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    scene.input.on('pointermove', (pointer) => {
      this.mouse.x = pointer.x;
      this.mouse.y = pointer.y;
      this.useMouse = true;
    });

    scene.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) this.mouse.down = true;
      if (pointer.rightButtonDown()) this.mouse.rightDown = true;
      if (pointer.middleButtonDown()) this.mouse.middleDown = true;
      this.useMouse = true;
    });

    scene.input.on('pointerup', (pointer) => {
      if (!pointer.leftButtonDown()) this.mouse.down = false;
      if (!pointer.rightButtonDown()) this.mouse.rightDown = false;
      if (!pointer.middleButtonDown()) this.mouse.middleDown = false;
    });
  }

  update(cameraScrollX) {
    this.cameraScrollX = cameraScrollX;
    this.mouse.worldX = this.mouse.x + cameraScrollX;
    this.mouse.worldY = this.mouse.y;

    const anyKey =
      this.keys.A?.isDown || this.keys.D?.isDown ||
      this.keys.W?.isDown || this.keys.S?.isDown ||
      this.keys.LEFT?.isDown || this.keys.RIGHT?.isDown ||
      this.keys.UP?.isDown || this.keys.DOWN?.isDown;

    if (anyKey) this.useMouse = false;
  }

  getPlayerInput(playerWorldX, playerWorldY) {
    if (this.useMouse) {
      const dx = this.mouse.worldX - playerWorldX;
      const dy = this.mouse.worldY - playerWorldY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const deadZone = 30;

      if (dist > deadZone) {
        return {
          x: dx / dist,
          y: dy / dist,
          isMouse: true,
        };
      }
      return { x: 0, y: 0, isMouse: true };
    }

    return {
      x: this.getAxisX(),
      y: this.getAxisY(),
      isMouse: false,
    };
  }

  getAxisX() {
    let val = 0;
    if (this.keys.A?.isDown || this.keys.LEFT?.isDown) val -= 1;
    if (this.keys.D?.isDown || this.keys.RIGHT?.isDown) val += 1;
    return val;
  }

  getAxisY() {
    let val = 0;
    if (this.keys.W?.isDown || this.keys.UP?.isDown) val -= 1;
    if (this.keys.S?.isDown || this.keys.DOWN?.isDown) val += 1;
    return val;
  }

  isKickPressed() {
    return this.keys.X?.isDown || this.keys.L?.isDown || this.mouse.down;
  }

  isSupershotPressed() {
    return this.keys.Z?.isDown || this.keys.K?.isDown || this.mouse.rightDown;
  }

  isJumpPressed() {
    return Phaser.Input.Keyboard.JustDown(this.keys.W) ||
           Phaser.Input.Keyboard.JustDown(this.keys.UP) ||
           Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
  }

  isSlidePressed() {
    return Phaser.Input.Keyboard.JustDown(this.keys.SHIFT) ||
           (this.mouse.middleDown && !this._prevMiddle) ||
           false;
  }

  getAimDirection(playerWorldX, playerWorldY) {
    if (this.useMouse) {
      return Math.atan2(
        this.mouse.worldY - playerWorldY,
        this.mouse.worldX - playerWorldX
      );
    }
    if (this.getAxisX() !== 0 || this.getAxisY() !== 0) {
      return Math.atan2(this.getAxisY(), this.getAxisX());
    }
    return 0;
  }

  destroy() {
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerdown');
    this.scene.input.off('pointerup');
  }
}
