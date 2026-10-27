// src/database/data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { Role } from '../modules/users/entities/role.entity.js';
import { UserEntity } from '../modules/users/entities/user.entity.js';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity.js';
import { Mechanic } from '../modules/mechanics/entities/mechanic.entity.js';
import { Workshop } from '../modules/workshops/entities/workshop.entity.js';
import { Maintenance } from '../modules/maintenances/entities/maintenance.entity.js';
import { InitialSchema1760000000000 } from './migrations/1760000000000-InitialSchema.js';

/** Entities registered with the TypeORM CLI data source. */
export const entities = [
  Role,
  UserEntity,
  Vehicle,
  Mechanic,
  Workshop,
  Maintenance,
];
/** Migrations registered with the data source, in execution order. */
export const migrations = [InitialSchema1760000000000];

/** Builds Postgres connection options from env vars (read at call time). */
export const dataSourceOptions = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'fleetcore',
  ssl: process.env.DB_SSL === 'true',
  entities,
  migrations,
});

/** Shared data source used by migrations, the seed and integration tests. */
export default new DataSource(dataSourceOptions());
