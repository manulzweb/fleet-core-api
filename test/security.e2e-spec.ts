import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import {
  configureApp,
  configureSecurity,
  setupSwagger,
} from '../src/app.setup.js';
import dataSource from '../src/database/data-source.js';
import {
  asAdmin,
  asTech1,
  auth,
  closeApp,
  createApp,
  ids,
  PASSWORD,
  request,
  resetDb,
} from './helpers.js';

describe('Auth & HTTP hardening (e2e)', () => {
  let app: INestApplication;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createApp();
  });
  afterAll(() => closeApp(app));
  // tests below mutate seed users
  afterEach(() => resetDb(dataSource));

  it('rejects a still-valid token once the user is deactivated', async () => {
    const token = await asTech1(app);
    const adminToken = await asAdmin(app);
    await http().get('/api/v1/users/me').set(auth(token)).expect(200);

    await http()
      .patch(`/api/v1/users/${ids.tech1}/status`)
      .set(auth(adminToken))
      .send({ isActive: false })
      .expect(200);

    const res = await http().get('/api/v1/users/me').set(auth(token));
    expect(res.status).toBe(401);
  });

  it('applies a role demotion immediately (role read from DB)', async () => {
    const adminToken = await asAdmin(app);
    await http().get('/api/v1/users').set(auth(adminToken)).expect(200);

    await http()
      .patch(`/api/v1/users/${ids.admin}`)
      .set(auth(adminToken))
      .send({ role: 'TECHNICIAN' })
      .expect(200);

    const res = await http().get('/api/v1/users').set(auth(adminToken));
    expect(res.status).toBe(403);
  });

  it('answers 429 once the login limit is exceeded', async () => {
    const previous = process.env.THROTTLE_LOGIN_LIMIT;
    process.env.THROTTLE_LOGIN_LIMIT = '3';
    try {
      // limit is resolved per request; the throttler storage is shared, so use
      // a fresh app to start with an empty counter
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      const limited = moduleRef.createNestApplication();
      configureApp(limited);
      await limited.init();
      try {
        const attempt = () =>
          request(limited.getHttpServer())
            .post('/api/v1/auth/login')
            .send({ email: 'admin@fleetcore.local', password: PASSWORD });
        for (let i = 0; i < 3; i++) expect((await attempt()).status).toBe(200);
        expect((await attempt()).status).toBe(429);
      } finally {
        await limited.close();
      }
    } finally {
      process.env.THROTTLE_LOGIN_LIMIT = previous;
    }
  });

  describe('Swagger exposure', () => {
    const build = async (env: NodeJS.ProcessEnv) => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      const a = moduleRef.createNestApplication();
      configureSecurity(a, env);
      configureApp(a);
      setupSwagger(a, env);
      await a.init();
      return a;
    };

    it('does not serve /api/docs in production', async () => {
      const prod = await build({ NODE_ENV: 'production' });
      try {
        const res = await request(prod.getHttpServer()).get('/api/docs');
        expect(res.status).toBe(404);
        expect(res.headers['x-content-type-options']).toBe('nosniff');
      } finally {
        await prod.close();
      }
    });

    it('serves /api/docs outside production', async () => {
      const dev = await build({ NODE_ENV: 'development' });
      try {
        const res = await request(dev.getHttpServer()).get('/api/docs');
        expect(res.status).toBe(200);
      } finally {
        await dev.close();
      }
    });
  });
});
