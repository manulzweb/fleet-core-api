// src/database/run-migrations.ts
// Standalone script: applies pending migrations, then exits.
import dataSource from './data-source.js';

await dataSource.initialize();
const ran = await dataSource.runMigrations();
console.log(`Migrations applied: ${ran.length}`);
await dataSource.destroy();
