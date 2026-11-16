// World State & Wave Progression Engine
import { WIDTH, HEIGHT, COLORS, WEAPON_TYPES } from './config.js';
import { createPlayer, createParticles, createFloatingText } from './entities.js';
import { sound } from './audio.js';

export function createWorld() {
  const player = createPlayer();
  const particles = createParticles();
  const floatTexts = createFloatingText();

  const bullets = [];
  const enemyBullets = [];
  const enemies = [];
  const powerups = [];

  let wave = 1;
  let waveTimer = 0;
  let waveActive = true;
  let bossSpawned = false;
  let score = 0;
  let multiplier = 1;
  let comboTimer = 0;
  let gameOver = false;
  let victory = false;

  function spawnEnemy(type, x, y) {
    if (type === 'scout') {
      enemies.push({
        type: 'scout',
        x,
        y,
        vx: (Math.random() * 2 - 1) * 90,
        vy: 65,
        radius: 16,
        hp: 35,
        maxHp: 35,
        fireTimer: Math.random() * 1.5 + 0.8,
        scoreVal: 150,
      });
    } else if (type === 'cruiser') {
      enemies.push({
        type: 'cruiser',
        x,
        y,
        vx: (Math.random() * 2 - 1) * 45,
        vy: 40,
        radius: 28,
        hp: 140,
        maxHp: 140,
        fireTimer: Math.random() * 2.0 + 1.0,
        scoreVal: 400,
      });
    } else if (type === 'boss') {
      enemies.push({
        type: 'boss',
        x: WIDTH / 2,
        y: -100,
        targetY: 140,
        vx: 80,
        vy: 40,
        radius: 65,
        hp: 1200,
        maxHp: 1200,
        phase: 1,
        fireTimer: 1.0,
        specialTimer: 4.0,
        scoreVal: 5000,
      });
    }
  }

  function startWave(num) {
    wave = num;
    waveTimer = 0;
    waveActive = true;

    if (wave >= 5 && !bossSpawned) {
      bossSpawned = true;
      spawnEnemy('boss', WIDTH / 2, -100);
      floatTexts.add(WIDTH / 2 - 140, 260, 'WARNING: VOID DREADNOUGHT ARRIVING', COLORS.bossRed);
    } else {
      const scoutCount = 4 + wave * 2;
      for (let i = 0; i < scoutCount; i++) {
        setTimeout(() => {
          if (!gameOver && !victory) {
            spawnEnemy('scout', Math.random() * (WIDTH - 160) + 80, -30 - i * 40);
          }
        }, i * 400);
      }
      if (wave >= 2) {
        const cruiserCount = wave - 1;
        for (let j = 0; j < cruiserCount; j++) {
          setTimeout(() => {
            if (!gameOver && !victory) {
              spawnEnemy('cruiser', Math.random() * (WIDTH - 200) + 100, -60 - j * 80);
            }
          }, j * 1200 + 1000);
        }
      }
    }
  }

  function firePlayer() {
    if (player.cooldownTimer > 0 || gameOver || victory) return;
    player.cooldownTimer = player.weapon.cooldown;
    sound.playLaser();

    if (player.weapon === WEAPON_TYPES.BLASTER) {
      bullets.push({ x: player.x - 14, y: player.y - 10, vy: -WEAPON_TYPES.BLASTER.speed, dmg: WEAPON_TYPES.BLASTER.damage, color: COLORS.cyan, radius: 4 });
      bullets.push({ x: player.x + 14, y: player.y - 10, vy: -WEAPON_TYPES.BLASTER.speed, dmg: WEAPON_TYPES.BLASTER.damage, color: COLORS.cyan, radius: 4 });
    } else if (player.weapon === WEAPON_TYPES.SCATTER) {
      for (let i = -2; i <= 2; i++) {
        const angle = -Math.PI / 2 + i * 0.12;
        bullets.push({
          x: player.x,
          y: player.y - 10,
          vx: Math.cos(angle) * WEAPON_TYPES.SCATTER.speed,
          vy: Math.sin(angle) * WEAPON_TYPES.SCATTER.speed,
          dmg: WEAPON_TYPES.SCATTER.damage,
          color: COLORS.magenta,
          radius: 4,
        });
      }
    } else if (player.weapon === WEAPON_TYPES.RAILGUN) {
      bullets.push({ x: player.x, y: player.y - 20, vy: -WEAPON_TYPES.RAILGUN.speed, dmg: WEAPON_TYPES.RAILGUN.damage, color: COLORS.amber, radius: 6, isRail: true });
    }
  }

  function triggerEmp() {
    if (player.empBombs <= 0 || gameOver || victory) return;
    player.empBombs -= 1;
    sound.playEmp();
    particles.add(player.x, player.y, COLORS.cyan, 80, 400, 0.8);

    // Wipe enemy bullets
    enemyBullets.length = 0;

    // Damage all on screen
    for (const e of enemies) {
      e.hp -= 150;
      particles.add(e.x, e.y, COLORS.amber, 20, 160, 0.5);
    }
    floatTexts.add(player.x - 60, player.y - 40, 'EMP DETONATED', COLORS.cyan);
  }

  function damagePlayer(dmg) {
    if (player.invulnTimer > 0 || gameOver || victory) return;
    player.invulnTimer = 0.8;
    particles.add(player.x, player.y, COLORS.magenta, 24, 200, 0.5);

    if (player.shield > 0) {
      player.shield = Math.max(0, player.shield - dmg);
    } else {
      player.hull = Math.max(0, player.hull - dmg);
      if (player.hull <= 0) {
        gameOver = true;
        sound.playExplosion(true);
        particles.add(player.x, player.y, COLORS.amber, 60, 320, 1.0);
      }
    }
  }

  function step(dt, inputState) {
    // Player controls
    const moveX = (inputState.right ? 1 : 0) - (inputState.left ? 1 : 0);
    const moveY = (inputState.down ? 1 : 0) - (inputState.up ? 1 : 0);

    player.vx = moveX * player.speed;
    player.vy = moveY * player.speed;
    player.x = Math.max(24, Math.min(WIDTH - 24, player.x + player.vx * dt));
    player.y = Math.max(40, Math.min(HEIGHT - 40, player.y + player.vy * dt));
    player.tilt = THREE_Math_lerp(player.tilt, moveX * 0.35, dt * 10);

    // Cooldowns
    if (player.cooldownTimer > 0) player.cooldownTimer -= dt;
    if (player.invulnTimer > 0) player.invulnTimer -= dt;

    // Shield passive regeneration
    if (player.shield < player.maxShield && player.hull > 0) {
      player.shield = Math.min(player.maxShield, player.shield + dt * 6);
    }

    // Firing
    if (inputState.firing) firePlayer();
    if (inputState.emp) {
      triggerEmp();
      inputState.emp = false;
    }

    // Update Player Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += (b.vx || 0) * dt;
      b.y += b.vy * dt;

      if (b.y < -30 || b.x < -30 || b.x > WIDTH + 30) {
        bullets.splice(i, 1);
        continue;
      }

      // Check collision against enemies
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        const dist = Math.hypot(b.x - e.x, b.y - e.y);
        if (dist < e.radius + b.radius) {
          e.hp -= b.dmg;
          particles.add(b.x, b.y, b.color, 8, 90, 0.3);
          if (!b.isRail) bullets.splice(i, 1);

          if (e.hp <= 0) {
            // Destroyed
            sound.playExplosion(e.type === 'boss');
            particles.add(e.x, e.y, e.type === 'boss' ? COLORS.bossRed : COLORS.amber, e.type === 'boss' ? 120 : 35, 250, 0.7);
            score += e.scoreVal * multiplier;
            floatTexts.add(e.x, e.y, `+${e.scoreVal * multiplier}`, COLORS.amber);

            // Combo multiplier increment
            multiplier = Math.min(8, multiplier + 1);
            comboTimer = 3.5;

            // Chance to drop powerup
            if (Math.random() < 0.25) {
              powerups.push({ x: e.x, y: e.y, vy: 70, type: Math.random() < 0.5 ? 'shield' : 'weapon' });
            }

            enemies.splice(j, 1);

            if (e.type === 'boss') {
              victory = true;
              floatTexts.add(WIDTH / 2 - 120, HEIGHT / 2, 'MISSION COMPLETE: SECTOR SECURED', COLORS.cyan);
            }
          }
          break;
        }
      }
    }

    // Update Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.type === 'boss') {
        if (e.y < e.targetY) e.y += e.vy * dt;
        else {
          e.x += e.vx * dt;
          if (e.x > WIDTH - 180 || e.x < 180) e.vx = -e.vx;
        }

        e.fireTimer -= dt;
        if (e.fireTimer <= 0) {
          e.fireTimer = 0.65;
          // Spray 3 lasers
          for (let k = -1; k <= 1; k++) {
            enemyBullets.push({ x: e.x + k * 40, y: e.y + 40, vx: k * 60, vy: 260, color: COLORS.bossRed, radius: 5 });
          }
        }
      } else {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (e.x < 40 || e.x > WIDTH - 40) e.vx = -e.vx;

        e.fireTimer -= dt;
        if (e.fireTimer <= 0 && e.y > 20) {
          e.fireTimer = e.type === 'scout' ? 1.6 : 1.2;
          enemyBullets.push({ x: e.x, y: e.y + 15, vx: 0, vy: 240, color: COLORS.magenta, radius: 4 });
        }

        if (e.y > HEIGHT + 40) enemies.splice(i, 1);
      }
    }

    // Update Enemy Bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const eb = enemyBullets[i];
      eb.x += eb.vx * dt;
      eb.y += eb.vy * dt;
      if (eb.y > HEIGHT + 20) {
        enemyBullets.splice(i, 1);
        continue;
      }

      // Check collision with player
      const pdist = Math.hypot(eb.x - player.x, eb.y - player.y);
      if (pdist < eb.radius + player.radius) {
        damagePlayer(18);
        enemyBullets.splice(i, 1);
      }
    }

    // Update Powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.y += p.vy * dt;
      if (Math.hypot(p.x - player.x, p.y - player.y) < player.radius + 16) {
        sound.playPowerup();
        if (p.type === 'shield') {
          player.shield = Math.min(player.maxShield, player.shield + 50);
          floatTexts.add(player.x, player.y - 20, '+SHIELD', COLORS.cyan);
        } else {
          player.weapon = player.weapon === WEAPON_TYPES.BLASTER ? WEAPON_TYPES.SCATTER : WEAPON_TYPES.RAILGUN;
          floatTexts.add(player.x, player.y - 20, `WEAPON UPGRADED: ${player.weapon.name}`, COLORS.amber);
        }
        powerups.splice(i, 1);
      } else if (p.y > HEIGHT + 20) {
        powerups.splice(i, 1);
      }
    }

    // Combo timer
    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0) multiplier = 1;
    }

    // Next wave check
    if (enemies.length === 0 && !bossSpawned && !gameOver && !victory) {
      waveTimer += dt;
      if (waveTimer > 2.0) {
        startWave(wave + 1);
      }
    }

    particles.step(dt);
    floatTexts.step(dt);
  }

  function THREE_Math_lerp(a, b, t) {
    return a + (b - a) * Math.min(1, Math.max(0, t));
  }

  return {
    player,
    particles,
    floatTexts,
    bullets,
    enemyBullets,
    enemies,
    powerups,
    get wave() { return wave; },
    get score() { return score; },
    get multiplier() { return multiplier; },
    get gameOver() { return gameOver; },
    get victory() { return victory; },
    startWave,
    step,
  };
}
