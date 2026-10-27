process.env.NODE_ENV = 'test';
process.env.DB_HOST ??= 'localhost';
process.env.DB_PORT ??= '5440';
process.env.DB_USERNAME ??= 'postgres';
process.env.DB_PASSWORD ??= 'postgres';
// One database per vitest worker so test files can run in parallel without
// truncating each other's data. Databases are created on demand by
// ensureDatabase() in test/helpers.ts, so CI only needs DB_HOST/DB_PORT/
// DB_USERNAME/DB_PASSWORD (and optionally DB_NAME_TEST as the base name); the
// DB user must be allowed to CREATE DATABASE.
const workerId =
  process.env.VITEST_POOL_ID ?? process.env.VITEST_WORKER_ID ?? '0';
process.env.DB_NAME = `${process.env.DB_NAME_TEST ?? 'fleetcore_test'}_${workerId}`;
process.env.JWT_SECRET = 'test-secret-1234';
process.env.JWT_EXPIRES_IN = '1h';
process.env.API_KEYS = 'test-key-1,test-key-2';
