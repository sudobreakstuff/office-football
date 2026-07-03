export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const PITCH_WIDTH = 3000;
export const PITCH_HEIGHT = 720;

export const GOAL_WIDTH = 30;
export const GOAL_HEIGHT = 200;
export const GOAL_Y = (PITCH_HEIGHT - GOAL_HEIGHT) / 2;

const stored = (() => { try { return JSON.parse(localStorage.getItem('off-football-supabase') || '{}'); } catch { return {}; } })();

export const SUPABASE_URL = stored.url || '';
export const SUPABASE_ANON_KEY = stored.key || '';

export function setSupabaseCredentials(url, key) {
  localStorage.setItem('off-football-supabase', JSON.stringify({ url, key }));
  return true;
}

export function hasSupabaseCredentials() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== '');
}

export const MATCH_DURATION = 120;
export const GOAL_LIMIT = 5;

export const PLAYER_CONFIG = {
  maxSpeed: 350,
  acceleration: 1800,
  friction: 600,
  jumpForce: -550,
  headRadius: 28,
  bodyWidth: 34,
  bodyHeight: 44,
  legLength: 22,
};

export const BALL_CONFIG = {
  radius: 14,
  maxSpeed: 700,
  friction: 0.995,
  bounce: 0.65,
};

export const SUPERSHOT = {
  chargeTime: 800,
  maxSpeed: 1200,
  cooldown: 5000,
  curveAmount: 300,
};

export const POWERUP_TYPES = ['speed', 'supershot', 'freeze'];
export const POWERUP_INTERVAL = 15000;
export const POWERUP_DURATION = 8000;
