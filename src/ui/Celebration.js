export class Celebration {
  constructor(scene) {
    this.scene = scene;
    this.celebrationGraphics = [];
  }

  play(player, type, x, y) {
    switch (type) {
      case 'arms_up':
        this.armsUp(player, x, y);
        break;
      case 'fist_pump':
        this.fistPump(player, x, y);
        break;
      case 'slide':
        this.kneeSlide(player, x, y);
        break;
      case 'spin':
        this.spin(player, x, y);
        break;
      case 'dance':
        this.dance(player, x, y);
        break;
      case 'dab':
        this.dab(player, x, y);
        break;
      default:
        this.armsUp(player, x, y);
    }
  }

  armsUp(player, x, y) {
    const g = this.scene.add.graphics();
    this.celebrationGraphics.push(g);

    let t = 0;
    const timer = this.scene.time.addEvent({
      delay: 16,
      repeat: 60,
      callback: () => {
        g.clear();
        t++;

        g.fillStyle(0xffdd00, 0.6 - t * 0.01);
        const offset = Math.sin(t * 0.1) * 5;
        g.fillCircle(x, y - 40 - offset, 15);

        g.fillStyle(0xffffff, 0.5 - t * 0.008);
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + t * 0.05;
          const px = x + Math.cos(angle) * 25;
          const py = y - 40 + Math.sin(angle) * 15;
          g.fillCircle(px, py, 4);
        }

        if (t >= 60) {
          g.destroy();
          this.celebrationGraphics = this.celebrationGraphics.filter((gr) => gr !== g);
        }
      },
    });
  }

  fistPump(player, x, y) {
    const g = this.scene.add.graphics();
    this.celebrationGraphics.push(g);

    let t = 0;
    const timer = this.scene.time.addEvent({
      delay: 16,
      repeat: 45,
      callback: () => {
        g.clear();
        t++;

        g.fillStyle(0x44dd44, 0.7 - t * 0.015);
        const bounce = Math.abs(Math.sin(t * 0.15)) * 20;
        g.fillRect(x - 5, y - 50 - bounce, 10, 30);

        for (let i = 0; i < 3; i++) {
          g.fillStyle(0x44dd44, 0.3 - t * 0.006);
          const s = (t * 0.1 + i) % 3;
          g.fillCircle(x, y - 40, 8 + s * 4);
        }

        if (t >= 45) {
          g.destroy();
          this.celebrationGraphics = this.celebrationGraphics.filter((gr) => gr !== g);
        }
      },
    });
  }

  kneeSlide(player, x, y) {
    const g = this.scene.add.graphics();
    this.celebrationGraphics.push(g);

    let t = 0;
    const particles = [];
    const timer = this.scene.time.addEvent({
      delay: 16,
      repeat: 60,
      callback: () => {
        g.clear();
        t++;

        const slideX = x + (t / 60) * 80;
        g.fillStyle(0xaa9977, 0.4);
        g.fillRect(slideX - 20, y + 5, 40, 6);

        if (t % 4 === 0) {
          particles.push({ x: slideX, y: y + 8, life: 15, vy: 1 });
        }

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.y += p.vy;
          p.life--;
          g.fillStyle(0xccbb99, p.life / 15);
          g.fillCircle(p.x + Math.random() * 4, p.y, 3);
          if (p.life <= 0) particles.splice(i, 1);
        }

        if (t >= 60) {
          g.destroy();
          this.celebrationGraphics = this.celebrationGraphics.filter((gr) => gr !== g);
        }
      },
    });
  }

  spin(player, x, y) {
    const g = this.scene.add.graphics();
    this.celebrationGraphics.push(g);

    let t = 0;
    const timer = this.scene.time.addEvent({
      delay: 16,
      repeat: 50,
      callback: () => {
        g.clear();
        t++;

        const angle = t * 0.15;
        const radius = 20;
        g.lineStyle(3, 0xff8800, 0.6 - t * 0.012);
        for (let i = 0; i < 3; i++) {
          const a = angle + (i * Math.PI * 2) / 3;
          g.strokeCircle(x + Math.cos(a) * radius, y - 30 + Math.sin(a) * radius, 10 - t * 0.15);
        }

        if (t >= 50) {
          g.destroy();
          this.celebrationGraphics = this.celebrationGraphics.filter((gr) => gr !== g);
        }
      },
    });
  }

  dance(player, x, y) {
    const g = this.scene.add.graphics();
    this.celebrationGraphics.push(g);

    let t = 0;
    const timer = this.scene.time.addEvent({
      delay: 16,
      repeat: 90,
      callback: () => {
        g.clear();
        t++;

        g.fillStyle(0xff4488, 0.5 - t * 0.005);
        const wave = Math.sin(t * 0.3) * 10;
        g.fillRect(x - 15 + wave, y - 30, 30, 6);

        g.fillStyle(0x44ff88, 0.5 - t * 0.005);
        g.fillRect(x + 15 - wave, y - 25, 30, 6);

        for (let i = 0; i < 4; i++) {
          g.fillStyle(0xffdd00, 0.3 - t * 0.003);
          g.fillCircle(x + Math.sin(t * 0.2 + i) * 15, y - 20, 4);
        }

        if (t >= 90) {
          g.destroy();
          this.celebrationGraphics = this.celebrationGraphics.filter((gr) => gr !== g);
        }
      },
    });
  }

  dab(player, x, y) {
    const g = this.scene.add.graphics();
    this.celebrationGraphics.push(g);

    let t = 0;
    const timer = this.scene.time.addEvent({
      delay: 16,
      repeat: 40,
      callback: () => {
        g.clear();
        t++;

        g.fillStyle(0xffaa00, 0.7 - t * 0.018);
        g.fillRect(x - 20, y - 50, 40, 6);
        g.fillRect(x + 15, y - 50, 6, 30);

        if (t <= 10) {
          g.fillStyle(0xffffff, 0.3);
          g.fillCircle(x, y - 60, 10 + t);
        }

        if (t >= 40) {
          g.destroy();
          this.celebrationGraphics = this.celebrationGraphics.filter((gr) => gr !== g);
        }
      },
    });
  }

  clear() {
    this.celebrationGraphics.forEach((g) => g.destroy());
    this.celebrationGraphics = [];
  }
}
