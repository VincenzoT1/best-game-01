// NEON HORIZON: VOID ASSAULT - Core Simulation & Loop Engine
import { WIDTH, HEIGHT, FIXED_STEP, WEAPON_TYPES } from './config.js';
import { createWorld } from './world.js';
import { createInput } from './input.js';
import { createRenderer } from './render.js';
import { createStarfield } from './stars.js';
import { sound } from './audio.js';

const canvas = document.getElementById('game');
canvas.width = WIDTH;
canvas.height = HEIGHT;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const world = createWorld();
const input = createInput(canvas);
const renderer = createRenderer(canvas);
const starfield = createStarfield();

let screenState = 'title'; // 'title' | 'play' | 'victory' | 'gameover'
let accumulator = 0;
let lastTime = performance.now();

canvas.addEventListener('click', () => {
  if (shot) return;
  sound.init();
  if (screenState === 'title' || screenState === 'victory' || screenState === 'gameover') {
    screenState = 'play';
    world.startWave(1);
  }
});

// Engine telemetry & state synchronization
const TICK_RATE = 60;
const SUB_STEPS = 1;

function step(dt) {
  starfield.step(dt, screenState === 'title' ? 0.5 : 1.2);
  if (screenState === 'play') {
    world.step(dt, input);
    if (world.gameOver) screenState = 'gameover';
    else if (world.victory) screenState = 'victory';
  }
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  accumulator += dt;
  while (accumulator >= FIXED_STEP) {
    step(FIXED_STEP);
    accumulator -= FIXED_STEP;
  }

  renderer.draw(world, screenState);
}

// Deterministic Screenshot Staging
function runShot(name) {
  sound.init();
  if (name === 'start') {
    screenState = 'title';
    starfield.step(1.0, 1.0);
    renderer.draw(world, screenState);
    window.__shotReady = true;
  } else if (name === 'play') {
    screenState = 'play';
    world.startWave(5); // Spawn Dreadnought Boss
    world.player.weapon = WEAPON_TYPES.SCATTER;
    world.player.shield = 85;
    world.player.hull = 95;

    // Simulate 40 steps for active firefight
    for (let i = 0; i < 40; i++) {
      world.step(FIXED_STEP, { firing: true, right: true });
    }
    renderer.draw(world, screenState);
    window.__shotReady = true;
  } else if (name === 'end') {
    screenState = 'victory';
    world.startWave(5);
    renderer.draw(world, screenState);
    window.__shotReady = true;
  }
}

if (shot) {
  runShot(shot);
} else {
  requestAnimationFrame(frame);
}
