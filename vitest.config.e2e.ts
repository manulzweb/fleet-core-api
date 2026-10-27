// vitest.config.e2e.ts
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// End-to-end tests (supertest) against a real PostgreSQL; one DB per worker.

// End-to-end tests (supertest) against a real PostgreSQL; one DB per worker.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    setupFiles: ['test/setup-env.ts'],
    fileParallelism: true,
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
