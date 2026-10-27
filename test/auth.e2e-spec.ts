import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  asAdmin,
  asTech1,
  auth,
  closeApp,
  createApp,
  request,
} from './helpers.js';

describe('Auth & authorization (e2e)', () => {
  let app: INestApplication;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createApp();
  });
  afterAll(() => closeApp(app));

  it('registers a TECHNICIAN and ignores role injection', async () => {
    const res = await http().post('/api/v1/auth/register').send({
      name: 'Nuevo',
      email: 'nuevo@fleetcore.local',
      password: 'SecurePass123',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('TECHNICIAN');
    expect(res.body.data.passwordHash).toBeUndefined();

    const bad = await http().post('/api/v1/auth/register').send({
      name: 'X',
      email: 'x@fleetcore.local',
      password: 'SecurePass123',
      role: 'ADMIN',
    });
    expect(bad.status).toBe(400);
  });

  it('rejects duplicate email with 409', async () => {
    const res = await http().post('/api/v1/auth/register').send({
      name: 'Dup',
      email: 'tech1@fleetcore.local',
      password: 'SecurePass123',
    });
    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      success: false,
      statusCode: 409,
      path: '/api/v1/auth/register',
    });
  });

  it('login returns a JWT; invalid credentials return 401', async () => {
    const ok = await http()
      .post('/api/v1/auth/login')
      .send({ email: 'admin@fleetcore.local', password: 'Passw0rd!123' });
    expect(ok.status).toBe(200);
    expect(ok.body.data.tokenType).toBe('Bearer');
    const bad = await http()
      .post('/api/v1/auth/login')
      .send({ email: 'admin@fleetcore.local', password: 'wrong' });
    expect(bad.status).toBe(401);
    const unknown = await http()
      .post('/api/v1/auth/login')
      .send({ email: 'no@fleetcore.local', password: 'wrong' });
    expect(unknown.status).toBe(401);
    expect(unknown.body.message).toBe(bad.body.message);
  });

  it('rejects missing, invalid and expired JWTs with 401', async () => {
    expect((await http().get('/api/v1/users/me')).status).toBe(401);
    expect(
      (await http().get('/api/v1/users/me').set(auth('garbage'))).status,
    ).toBe(401);
    const expired = await app
      .get(JwtService)
      .signAsync({ sub: 'x', role: 'ADMIN' }, { expiresIn: -10 });
    expect(
      (await http().get('/api/v1/users/me').set(auth(expired))).status,
    ).toBe(401);
  });

  it('enforces roles with 403 and never exposes password hashes', async () => {
    const tech = await asTech1(app);
    expect((await http().get('/api/v1/users').set(auth(tech))).status).toBe(
      403,
    );
    const admin = await asAdmin(app);
    const list = await http().get('/api/v1/users').set(auth(admin));
    expect(list.status).toBe(200);
    expect(JSON.stringify(list.body)).not.toContain('passwordHash');
    const me = await http().get('/api/v1/users/me').set(auth(tech));
    expect(me.body.data.email).toBe('tech1@fleetcore.local');
  });

  it('API key endpoint: 401 without/invalid key, 404 unknown plate, 200 with key', async () => {
    const url = '/api/v1/integrations/vehicles/ABC123/maintenance-history';
    expect((await http().get(url)).status).toBe(401);
    expect((await http().get(url).set('x-api-key', 'nope')).status).toBe(401);
    expect(
      (
        await http()
          .get('/api/v1/integrations/vehicles/ZZZ999/maintenance-history')
          .set('x-api-key', 'test-key-2')
      ).status,
    ).toBe(404);
    const ok = await http().get(url).set('x-api-key', 'test-key-1');
    expect(ok.status).toBe(200);
    expect(ok.body.success).toBe(true);
    expect(ok.body.data.vehicle).toMatchObject({
      plate: 'ABC123',
      available: true,
    });
    expect(ok.body.data.maintenances).toHaveLength(1);
    expect(ok.body.data.maintenances[0]).toMatchObject({
      status: 'COMPLETED',
      mileage: 45000,
      cost: 350000,
      mechanic: { name: 'Carlos Pérez' },
      workshop: { name: 'Taller Norte' },
    });
  });
});
