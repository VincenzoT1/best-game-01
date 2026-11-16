// Game Entities: Player Ship, Enemies, Projectiles, Particles & Boss
import { WIDTH, HEIGHT, COLORS, WEAPON_TYPES } from './config.js';
import { sound } from './audio.js';

export function createPlayer() {
  return {
    x: WIDTH / 2,
    y: HEIGHT - 110,
    vx: 0,
    vy: 0,
    radius: 18,
    speed: 460,
    hull: 100,
    maxHull: 100,
    shield: 100,
    maxShield: 100,
    empBombs: 2,
    score: 0,
    weapon: WEAPON_TYPES.BLASTER,
    cooldownTimer: 0,
    invulnTimer: 0,
    tilt: 0,
  };
}

export function createParticles() {
  const list = [];

  function add(x, y, color, count = 12, speed = 180, life = 0.5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.7 + 0.3) * speed;
      list.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: Math.random() * 3 + 1.5,
        life,
        maxLife: life,
      });
    }
  }

  function step(dt) {
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) list.splice(i, 1);
    }
  }

  function draw(ctx) {
    for (const p of list) {
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  return { list, add, step, draw };
}

export function createFloatingText() {
  const list = [];

  function add(x, y, text, color = COLORS.amber) {
    list.push({ x, y, text, color, life: 0.8, maxLife: 0.8, vy: -50 });
  }

  function step(dt) {
    for (let i = list.length - 1; i >= 0; i--) {
      const t = list[i];
      t.y += t.vy * dt;
      t.life -= dt;
      if (t.life <= 0) list.splice(i, 1);
    }
  }

  function draw(ctx) {
    ctx.font = 'bold 15px ui-monospace, monospace';
    for (const t of list) {
      ctx.globalAlpha = t.life / t.maxLife;
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1.0;
  }

  return { list, add, step, draw };
}
