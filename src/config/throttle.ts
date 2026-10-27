// src/config/throttle.ts
/** Throttle window in milliseconds. */
export const THROTTLE_TTL_MS = 60_000;

/** Reads a positive number from the environment, else returns the fallback. */
const fromEnv = (name: string, fallback: number) => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** Max requests per window per client; resolved per request so tests can override via env. */
export const globalLimit = () => fromEnv('THROTTLE_LIMIT', 100);
/** Max login attempts per window (`THROTTLE_LOGIN_LIMIT`, default 5). */
export const loginLimit = () => fromEnv('THROTTLE_LOGIN_LIMIT', 5);
