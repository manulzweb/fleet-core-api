import dataSource from './data-source.js';

await dataSource.initialize();
const ran = await dataSource.runMigrations();
console.log(`Migrations applied: ${ran.length}`);
await dataSource.destroy();
