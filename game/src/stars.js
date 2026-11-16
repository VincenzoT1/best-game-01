// Parallax Starfield & Space Backdrop
import { WIDTH, HEIGHT } from './config.js';

export function createStarfield() {
  const stars = [];
  const layers = [
    { count: 120, speed: 20, size: 1.0, alpha: 0.4 },
    { count: 70, speed: 55, size: 1.6, alpha: 0.7 },
    { count: 35, speed: 110, size: 2.4, alpha: 0.95 },
  ];

  for (const layer of layers) {
    for (let i = 0; i < layer.count; i++) {
      stars.push({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        speed: layer.speed,
        size: layer.size,
        alpha: layer.alpha,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  }

  function step(dt, warpSpeed = 1.0) {
    for (const s of stars) {
      s.y += s.speed * warpSpeed * dt;
      s.twinkle += dt * 3;
      if (s.y > HEIGHT) {
        s.y = 0;
        s.x = Math.random() * WIDTH;
      }
    }
  }

  function draw(ctx, warp = false) {
    for (const s of stars) {
      const alpha = s.alpha * (0.75 + Math.sin(s.twinkle) * 0.25);
      ctx.fillStyle = `rgba(220, 240, 255, ${alpha})`;
      if (warp) {
        ctx.strokeStyle = `rgba(0, 243, 255, ${alpha})`;
        ctx.lineWidth = s.size;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + s.speed * 0.25);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  return { step, draw };
}
