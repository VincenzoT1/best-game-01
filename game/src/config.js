// Configuration, dimensions & constants for NEON HORIZON
export const WIDTH = 1280;
export const HEIGHT = 720;
export const FIXED_STEP = 1 / 60;

export const COLORS = {
  bg: '#080a10',
  cyan: '#00f3ff',
  magenta: '#ff0055',
  amber: '#ffb700',
  green: '#00ff88',
  white: '#f0f4fc',
  muted: '#5e6c84',
  darkSurface: '#101420',
  bossRed: '#ff2244',
  shieldBlue: '#0099ff',
};

export const WEAPON_TYPES = {
  BLASTER: { name: 'Dual Plasma', cooldown: 0.12, damage: 24, speed: 850, spread: 0.04 },
  SCATTER: { name: 'Void Scatter', cooldown: 0.28, damage: 18, speed: 750, count: 5, spread: 0.25 },
  RAILGUN: { name: 'Hyper Railgun', cooldown: 0.65, damage: 120, speed: 1400, spread: 0 },
};
