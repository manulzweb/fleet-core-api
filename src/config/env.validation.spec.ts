// src/config/env.validation.spec.ts
import 'reflect-metadata';
import { validate } from './env.validation.js';

const strongSecret = 'a-very-strong-secret-of-at-least-32-chars!!';
const base = { JWT_SECRET: 'dev-secret-123', API_KEYS: 'demo-key-partner-1' };
const prod = {
  NODE_ENV: 'production',
  JWT_SECRET: strongSecret,
  API_KEYS: 'k-7f3a9c1e22b84d,k-91bb04d7c5e1aa',
};

describe('env validation', () => {
  it('accepts a valid dev config with defaults', () => {
    const cfg = validate(base);
    expect(cfg.PORT).toBe(3000);
    expect(cfg.NODE_ENV).toBe('development');
  });

  it('accepts a valid production config', () => {
    expect(validate(prod).JWT_SECRET).toBe(strongSecret);
  });

  it('rejects the default secret in production', () => {
    expect(() =>
      validate({ ...prod, JWT_SECRET: 'cambia-este-secreto' }),
    ).toThrow(/JWT_SECRET/);
  });

  it('rejects a secret containing "cambia" even if long', () => {
    expect(() =>
      validate({ ...prod, JWT_SECRET: 'cambia-' + 'x'.repeat(40) }),
    ).toThrow(/JWT_SECRET/);
  });

  it('rejects a short secret in production', () => {
    expect(() => validate({ ...prod, JWT_SECRET: 'short-secret-12' })).toThrow(
      /32/,
    );
  });

  it('rejects demo API keys in production', () => {
    expect(() =>
      validate({ ...prod, API_KEYS: 'good-key,demo-key-partner-2' }),
    ).toThrow(/API_KEYS/);
    expect(() => validate({ ...prod, API_KEYS: 'demo-anything' })).toThrow(
      /API_KEYS/,
    );
  });

  it('does not leak secret values in error messages', () => {
    expect.assertions(1);
    try {
      validate({ ...prod, JWT_SECRET: 'cambia-este-secreto' });
    } catch (e) {
      expect((e as Error).message).not.toContain('cambia-este-secreto');
    }
  });

  it.each(['development', 'test', 'staging'])(
    'accepts example secrets when NODE_ENV=%s',
    (env) => {
      expect(() =>
        validate({
          NODE_ENV: env,
          JWT_SECRET: 'cambia-este-secreto',
          API_KEYS: 'demo-key-partner-1,demo-key-partner-2',
        }),
      ).not.toThrow();
    },
  );

  it('transforms DB_SYNCHRONIZE to boolean', () => {
    expect(validate({ ...base, DB_SYNCHRONIZE: 'false' }).DB_SYNCHRONIZE).toBe(
      false,
    );
    expect(validate({ ...base, DB_SYNCHRONIZE: 'true' }).DB_SYNCHRONIZE).toBe(
      true,
    );
  });
});
