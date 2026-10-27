/** Throttle settings, resolved per request so tests can override them via env. */
export const THROTTLE_TTL_MS = 60_000;

const fromEnv = (name: string, fallback: number) => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const globalLimit = () => fromEnv('THROTTLE_LIMIT', 100);
export const loginLimit = () => fromEnv('THROTTLE_LOGIN_LIMIT', 5);
