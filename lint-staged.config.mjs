export default {
  '**/*.ts': (files) => [
    'tsc --noEmit -p tsconfig.json',
    `vitest related --run --passWithNoTests ${files.join(' ')}`,
  ],
};
