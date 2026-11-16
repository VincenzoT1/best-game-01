// High-Fidelity 2D Neon Canvas Renderer & HUD
import { WIDTH, HEIGHT, COLORS } from './config.js';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function drawPlayer(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.tilt);

    // Engine thruster glow
    const thrusterLen = Math.random() * 12 + 18;
    ctx.fillStyle = COLORS.cyan;
    ctx.beginPath();
    ctx.moveTo(-7, 16);
    ctx.lineTo(7, 16);
    ctx.lineTo(0, 16 + thrusterLen);
    ctx.closePath();
    ctx.fill();

    // Shield bubble if invulnerable or high shield
    if (p.shield > 20) {
      ctx.strokeStyle = `rgba(0, 243, 255, ${p.shield / p.maxShield * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Ship Hull
    ctx.fillStyle = COLORS.white;
    ctx.strokeStyle = COLORS.cyan;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(16, 14);
    ctx.lineTo(6, 10);
    ctx.lineTo(0, 14);
    ctx.lineTo(-6, 10);
    ctx.lineTo(-16, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit
    ctx.fillStyle = COLORS.magenta;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(4, 2);
    ctx.lineTo(-4, 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawEnemies(enemies) {
    for (const e of enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);

      if (e.type === 'scout') {
        // Delta Scout
        ctx.fillStyle = COLORS.magenta;
        ctx.strokeStyle = COLORS.white;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 14);
        ctx.lineTo(14, -12);
        ctx.lineTo(0, -6);
        ctx.lineTo(-14, -12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (e.type === 'cruiser') {
        // Heavy Cruiser
        ctx.fillStyle = COLORS.darkSurface;
        ctx.strokeStyle = COLORS.amber;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 24);
        ctx.lineTo(24, 0);
        ctx.lineTo(18, -20);
        ctx.lineTo(-18, -20);
        ctx.lineTo(-24, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Core light
        ctx.fillStyle = COLORS.amber;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'boss') {
        // Void Dreadnought
        ctx.fillStyle = '#16101f';
        ctx.strokeStyle = COLORS.bossRed;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, 60);
        ctx.lineTo(65, 10);
        ctx.lineTo(55, -45);
        ctx.lineTo(0, -30);
        ctx.lineTo(-55, -45);
        ctx.lineTo(-65, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Pulsing boss core
        const pulse = Math.sin(Date.now() * 0.008) * 4 + 14;
        ctx.fillStyle = COLORS.bossRed;
        ctx.beginPath();
        ctx.arc(0, 5, pulse, 0, Math.PI * 2);
        ctx.fill();

        // Boss Health Bar
        ctx.restore();
        const barW = 320;
        const barH = 12;
        const barX = WIDTH / 2 - barW / 2;
        const barY = 40;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
        ctx.fillStyle = COLORS.bossRed;
        ctx.fillRect(barX, barY, (e.hp / e.maxHp) * barW, barH);
        ctx.strokeStyle = COLORS.white;
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);

        ctx.font = 'bold 12px ui-monospace, monospace';
        ctx.fillStyle = COLORS.white;
        ctx.textAlign = 'center';
        ctx.fillText('VOID DREADNOUGHT FLAGSHIP', WIDTH / 2, barY - 6);
        ctx.textAlign = 'left';
        continue;
      }

      ctx.restore();
    }
  }

  function drawBullets(bullets, enemyBullets) {
    // Player bullets
    for (const b of bullets) {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Enemy bullets
    for (const eb of enemyBullets) {
      ctx.fillStyle = eb.color;
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPowerups(powerups) {
    for (const p of powerups) {
      ctx.fillStyle = p.type === 'shield' ? COLORS.cyan : COLORS.amber;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLORS.white;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function drawHUD(w) {
    // Health & Shield Bars
    const barX = 32;
    const barY = HEIGHT - 45;
    const barW = 160;
    const barH = 10;

    // Shield Bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY - 16, barW, barH);
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect(barX, barY - 16, (w.player.shield / w.player.maxShield) * barW, barH);

    // Hull Bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = COLORS.green;
    ctx.fillRect(barX, barY, (w.player.hull / w.player.maxHull) * barW, barH);

    ctx.font = '11px ui-monospace, monospace';
    ctx.fillStyle = COLORS.cyan;
    ctx.fillText(`SHIELD: ${Math.round(w.player.shield)}%`, barX, barY - 20);
    ctx.fillStyle = COLORS.green;
    ctx.fillText(`HULL: ${Math.round(w.player.hull)}%`, barX, barY + 22);

    // EMP Bombs
    ctx.fillStyle = COLORS.amber;
    ctx.fillText(`EMP BOMBS: ${w.player.empBombs} [SPACE]`, barX + barW + 28, barY);

    // Score & Multiplier
    ctx.textAlign = 'right';
    ctx.font = 'bold 24px ui-monospace, monospace';
    ctx.fillStyle = COLORS.white;
    ctx.fillText(w.score.toLocaleString(), WIDTH - 32, 45);

    ctx.font = '14px ui-monospace, monospace';
    ctx.fillStyle = COLORS.amber;
    ctx.fillText(`COMBO x${w.multiplier}`, WIDTH - 32, 68);

    // Wave indicator
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px ui-monospace, monospace';
    ctx.fillStyle = COLORS.cyan;
    ctx.fillText(`SECTOR WAVE ${w.wave}`, WIDTH / 2, 35);
    ctx.textAlign = 'left';
  }

  function drawTitleScreen() {
    ctx.fillStyle = 'rgba(8, 10, 16, 0.85)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.textAlign = 'center';
    ctx.font = '900 48px system-ui, sans-serif';
    ctx.fillStyle = COLORS.cyan;
    ctx.fillText('NEON HORIZON', WIDTH / 2, HEIGHT / 2 - 80);

    ctx.font = '700 20px ui-monospace, monospace';
    ctx.fillStyle = COLORS.magenta;
    ctx.fillText('VOID ASSAULT', WIDTH / 2, HEIGHT / 2 - 40);

    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = COLORS.muted;
    ctx.fillText('WASD / Arrows to Vector • Click / Hold to Fire • Space for EMP Blast', WIDTH / 2, HEIGHT / 2 + 30);

    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 18px ui-monospace, monospace';
    ctx.fillText('CLICK TO LAUNCH INTERCEPTOR', WIDTH / 2, HEIGHT / 2 + 90);
    ctx.textAlign = 'left';
  }

  function drawVictoryScreen(score) {
    ctx.fillStyle = 'rgba(8, 10, 16, 0.85)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.textAlign = 'center';
    ctx.font = '900 42px system-ui, sans-serif';
    ctx.fillStyle = COLORS.cyan;
    ctx.fillText('MISSION COMPLETE', WIDTH / 2, HEIGHT / 2 - 60);

    ctx.font = '20px ui-monospace, monospace';
    ctx.fillStyle = COLORS.amber;
    ctx.fillText(`FINAL SCORE: ${score.toLocaleString()}`, WIDTH / 2, HEIGHT / 2);

    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = COLORS.white;
    ctx.fillText('All Sector Threats Cleared. Click to Re-engage.', WIDTH / 2, HEIGHT / 2 + 50);
    ctx.textAlign = 'left';
  }

  function drawGameOverScreen(score) {
    ctx.fillStyle = 'rgba(8, 10, 16, 0.85)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.textAlign = 'center';
    ctx.font = '900 42px system-ui, sans-serif';
    ctx.fillStyle = COLORS.magenta;
    ctx.fillText('HULL DESTROYED', WIDTH / 2, HEIGHT / 2 - 60);

    ctx.font = '20px ui-monospace, monospace';
    ctx.fillStyle = COLORS.white;
    ctx.fillText(`FINAL SCORE: ${score.toLocaleString()}`, WIDTH / 2, HEIGHT / 2);

    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = COLORS.cyan;
    ctx.fillText('Click to Re-deploy Interceptor', WIDTH / 2, HEIGHT / 2 + 50);
    ctx.textAlign = 'left';
  }

  return {
    draw(world, screenState) {
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      if (screenState === 'title') {
        drawTitleScreen();
        return;
      }

      drawPlayer(world.player);
      drawEnemies(world.enemies);
      drawBullets(world.bullets, world.enemyBullets);
      drawPowerups(world.powerups);
      world.particles.draw(ctx);
      world.floatTexts.draw(ctx);
      drawHUD(world);

      if (screenState === 'victory') drawVictoryScreen(world.score);
      else if (screenState === 'gameover') drawGameOverScreen(world.score);
    },
  };
}
