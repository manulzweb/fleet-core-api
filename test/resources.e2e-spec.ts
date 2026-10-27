import { INestApplication } from '@nestjs/common';
import {
  asAdmin,
  asTech1,
  auth,
  closeApp,
  createApp,
  ids,
  request,
} from './helpers.js';

describe('Vehicles, mechanics, workshops (e2e)', () => {
  let app: INestApplication;
  let admin: string;
  let tech: string;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createApp();
    admin = await asAdmin(app);
    tech = await asTech1(app);
  });
  afterAll(() => closeApp(app));

  const vehicle = {
    plate: 'zzz-111',
    brand: 'Kia',
    model: 'Rio',
    year: 2024,
    currentMileage: 100,
  };

  it('only ADMIN creates vehicles; plate is normalized and unique (409)', async () => {
    expect(
      (await http().post('/api/v1/vehicles').set(auth(tech)).send(vehicle))
        .status,
    ).toBe(403);
    const created = await http()
      .post('/api/v1/vehicles')
      .set(auth(admin))
      .send(vehicle);
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({
      plate: 'ZZZ111',
      status: 'AVAILABLE',
    });
    const dup = await http()
      .post('/api/v1/vehicles')
      .set(auth(admin))
      .send({ ...vehicle, plate: 'ZZZ 111' });
    expect(dup.status).toBe(409);
  });

  it('validates year / mileage (400) and 404 for missing vehicles', async () => {
    const v = (o: object) =>
      http()
        .post('/api/v1/vehicles')
        .set(auth(admin))
        .send({ ...vehicle, plate: 'QQQ222', ...o });
    expect((await v({ currentMileage: -1 })).status).toBe(400);
    expect((await v({ year: 1800 })).status).toBe(400);
    expect(
      (
        await http()
          .get('/api/v1/vehicles/019a0000-0000-7000-8000-00000000ffff')
          .set(auth(tech))
      ).status,
    ).toBe(404);
    expect(
      (await http().get('/api/v1/vehicles/plate/NOPE999').set(auth(tech)))
        .status,
    ).toBe(404);
  });

  it('retrieves by id and by plate; lists with pagination', async () => {
    expect(
      (await http().get('/api/v1/vehicles/plate/abc-123').set(auth(tech))).body
        .data.id,
    ).toBe(ids.vehAvail1);
    const list = await http()
      .get('/api/v1/vehicles?page=1&limit=2')
      .set(auth(tech));
    expect(list.body.data.items).toHaveLength(2);
    expect(list.body.data.total).toBeGreaterThanOrEqual(4);
  });

  it('vehicle status: IN_MAINTENANCE is not client-settable; cannot deactivate with active maintenance', async () => {
    const patch = (id: string, status: string) =>
      http()
        .patch(`/api/v1/vehicles/${id}/status`)
        .set(auth(admin))
        .send({ status });
    expect((await patch(ids.vehAvail1, 'IN_MAINTENANCE')).status).toBe(400);
    expect((await patch(ids.vehInMaint, 'INACTIVE')).status).toBe(409);
    expect((await patch(ids.vehAvail2, 'INACTIVE')).body.data.status).toBe(
      'INACTIVE',
    );
    expect((await patch(ids.vehAvail2, 'AVAILABLE')).body.data.status).toBe(
      'AVAILABLE',
    );
  });

  it('mechanics: unique email (409), activation toggle, 404', async () => {
    const m = {
      name: 'Nuevo',
      email: 'Nuevo@Fleetcore.local',
      specialty: 'Tires',
    };
    const created = await http()
      .post('/api/v1/mechanics')
      .set(auth(admin))
      .send(m);
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({
      email: 'nuevo@fleetcore.local',
      isActive: true,
    });
    expect(
      (await http().post('/api/v1/mechanics').set(auth(admin)).send(m)).status,
    ).toBe(409);
    const off = await http()
      .patch(`/api/v1/mechanics/${created.body.data.id}/status`)
      .set(auth(admin))
      .send({ isActive: false });
    expect(off.body.data.isActive).toBe(false);
    expect(
      (await http().post('/api/v1/mechanics').set(auth(tech)).send(m)).status,
    ).toBe(403);
    expect(
      (
        await http()
          .get('/api/v1/mechanics/019a0000-0000-7000-8000-00000000ffff')
          .set(auth(tech))
      ).status,
    ).toBe(404);
  });

  it('workshops: technicians only see active ones; ADMIN can include inactive', async () => {
    const t = await http().get('/api/v1/workshops').set(auth(tech));
    expect(t.body.data.items.every((w: any) => w.isActive)).toBe(true);
    const a = await http()
      .get('/api/v1/workshops?includeInactive=true')
      .set(auth(admin));
    expect(a.body.data.items).toHaveLength(2);
    const created = await http()
      .post('/api/v1/workshops')
      .set(auth(admin))
      .send({ name: 'Taller Este', address: 'Calle 1' });
    expect(created.status).toBe(201);
    const off = await http()
      .patch(`/api/v1/workshops/${created.body.data.id}/status`)
      .set(auth(admin))
      .send({ isActive: false });
    expect(off.body.data.isActive).toBe(false);
  });
});
