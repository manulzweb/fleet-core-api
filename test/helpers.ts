import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Client } from 'pg';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import dataSource from '../src/database/data-source.js';
import { seed } from '../src/database/seed.js';

export const PASSWORD = 'Passw0rd!123';
export const ids = {
  admin: '019a0000-0000-7000-8000-000000000010',
  tech1: '019a0000-0000-7000-8000-000000000011',
  mechActive1: '019a0000-0000-7000-8000-000000000020', // linked to tech1
  mechActive2: '019a0000-0000-7000-8000-000000000021', // linked to tech2
  mechInactive: '019a0000-0000-7000-8000-000000000022',
  workshopActive: '019a0000-0000-7000-8000-000000000030',
  workshopInactive: '019a0000-0000-7000-8000-000000000031',
  vehAvail1: '019a0000-0000-7000-8000-000000000040', // ABC123
  vehAvail2: '019a0000-0000-7000-8000-000000000041', // DEF456
  vehInMaint: '019a0000-0000-7000-8000-000000000042', // GHI789
  vehInactive: '019a0000-0000-7000-8000-000000000043', // JKL012
  mntInProgress: '019a0000-0000-7000-8000-000000000050', // mech 21 (tech2)
};

async function ensureDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });
  await client.connect();
  const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [process.env.DB_NAME]);
  if (!rowCount) await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
  await client.end();
}

export async function createApp(): Promise<INestApplication> {
  await ensureDatabase();
  if (!dataSource.isInitialized) await dataSource.initialize();
  await dataSource.runMigrations();
  await resetDb(dataSource);
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
  return app;
}

export async function resetDb(ds: DataSource) {
  await ds.query('TRUNCATE maintenances, mechanics, workshops, vehicles, users, roles CASCADE');
  await seed(ds);
}

export async function closeApp(app: INestApplication) {
  await app.close();
  if (dataSource.isInitialized) await dataSource.destroy();
}

export async function login(app: INestApplication, email: string, password = PASSWORD) {
  const res = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password });
  return res.body.data?.accessToken as string;
}

export const asAdmin = (app: INestApplication) => login(app, 'admin@fleetcore.local');
export const asTech1 = (app: INestApplication) => login(app, 'tech1@fleetcore.local');
export const asTech2 = (app: INestApplication) => login(app, 'tech2@fleetcore.local');
export const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
export { request };
