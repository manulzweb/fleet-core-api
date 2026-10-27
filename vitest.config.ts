// vitest.config.ts
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      include: ['src/**/*.ts'],
      // Declarative / wiring code with no logic of its own.
      exclude: [
        '**/*.spec.ts',
        '**/*.module.ts',
        '**/dto/**',
        '**/entities/**',
        'src/main.ts',
        'src/database/**',
      ],
      // Unit coverage only: controllers, DAOs, the JWT guard and config
      // validation are exercised by `npm run test:e2e` / `npm run test:int`
      // (separate configs), so they pull the unit-only global numbers down.
      thresholds: {
        // Global floor, measured on unit tests alone.
        statements: 65,
        lines: 65,
        branches: 65,
        functions: 45,
        // Business logic must be well covered.
        'src/modules/**/*.service.ts': {
          statements: 85,
          lines: 85,
          functions: 85,
          branches: 70,
        },
      },
    },
  },
});
