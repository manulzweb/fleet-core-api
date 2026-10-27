import { INestApplication } from '@nestjs/common';
import { asAdmin, asTech1, asTech2, auth, closeApp, createApp, ids, request } from './helpers.js';

describe('Maintenance (e2e)', () => {
  let app: INestApplication;
  let admin: string;
  let tech1: string;
  let tech2: string;
  const http = () => request(app.getHttpServer());

  const body = (o: Record<string, unknown> = {}) => ({
    type: 'PREVENTIVE',
    description: 'Service',
    initialMileage: 12000,
    scheduledStartAt: '2026-11-01T09:00:00.000Z',
    scheduledEndAt: '2026-11-01T12:00:00.000Z',
    vehicleId: ids.vehAvail2,
    mechanicId: ids.mechActive1,
    workshopId: ids.workshopActive,
    ...o,
  });
  const create = (o?: Record<string, unknown>, token = admin) =>
    http().post('/api/v1/maintenances').set(auth(token)).send(body(o));
  const setStatus = (id: string, payload: object, token = admin) =>
    http().patch(`/api/v1/maintenances/${id}/status`).set(auth(token)).send(payload);
  const vehicleStatus = async (id: string) =>
    (await http().get(`/api/v1/vehicles/${id}`).set(auth(admin))).body.data;

  beforeAll(async () => {
    app = await createApp();
    admin = await asAdmin(app);
    tech1 = await asTech1(app);
    tech2 = await asTech2(app);
  });
  afterAll(() => closeApp(app));

  it('only ADMIN creates; new maintenance starts SCHEDULED', async () => {
    expect((await create({}, tech1)).status).toBe(403);
    const res = await create();
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('SCHEDULED');
  });

  it('rejects missing / inactive related resources and bad data', async () => {
    const missing = '019a0000-0000-7000-8000-00000000ffff';
    expect((await create({ vehicleId: missing })).status).toBe(404);
    expect((await create({ mechanicId: missing })).status).toBe(404);
    expect((await create({ workshopId: missing })).status).toBe(404);
    expect((await create({ vehicleId: ids.vehInactive, initialMileage: 150000 })).status).toBe(409);
    expect((await create({ mechanicId: ids.mechInactive, vehicleId: ids.vehAvail1, initialMileage: 45000 })).status).toBe(409);
    expect((await create({ workshopId: ids.workshopInactive, vehicleId: ids.vehAvail1, initialMileage: 45000 })).status).toBe(409);
    expect((await create({ vehicleId: ids.vehAvail1, initialMileage: 10 })).status).toBe(400);
    expect((await create({ vehicleId: ids.vehAvail1, initialMileage: 45000, scheduledEndAt: '2026-11-01T08:00:00.000Z' })).status).toBe(400);
  });

  it('409 when the vehicle already has active maintenance', async () => {
    const res = await create({ mechanicId: ids.mechActive2, scheduledStartAt: '2026-12-01T09:00:00.000Z', scheduledEndAt: '2026-12-01T10:00:00.000Z' });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already has active maintenance/);
  });

  it('409 on overlapping mechanic schedule; adjacent intervals are allowed', async () => {
    const overlap = await create({ vehicleId: ids.vehAvail1, initialMileage: 45000, scheduledStartAt: '2026-11-01T11:00:00.000Z', scheduledEndAt: '2026-11-01T13:00:00.000Z' });
    expect(overlap.status).toBe(409);
    const adjacent = await create({ vehicleId: ids.vehAvail1, initialMileage: 45000, scheduledStartAt: '2026-11-01T12:00:00.000Z', scheduledEndAt: '2026-11-01T14:00:00.000Z' });
    expect(adjacent.status).toBe(201);
  });

  it('full lifecycle: start sets IN_MAINTENANCE; completion requires data and restores AVAILABLE', async () => {
    const list = await http().get(`/api/v1/maintenances?vehicleId=${ids.vehAvail2}`).set(auth(admin));
    const id = list.body.data.items[0].id;

    expect((await setStatus(id, { status: 'COMPLETED' })).status).toBe(409); // SCHEDULED -> COMPLETED
    expect((await setStatus(id, { status: 'IN_PROGRESS' })).status).toBe(200);
    expect((await vehicleStatus(ids.vehAvail2)).status).toBe('IN_MAINTENANCE');

    expect((await setStatus(id, { status: 'COMPLETED' })).status).toBe(400);
    expect((await setStatus(id, { status: 'COMPLETED', workPerformed: 'x', finalCost: 10, completedAt: new Date().toISOString(), finalMileage: 5 })).status).toBe(400);
    const done = await setStatus(id, { status: 'COMPLETED', workPerformed: 'Oil change', finalCost: 120.5, completedAt: '2026-11-01T11:00:00.000Z', finalMileage: 12500 });
    expect(done.status).toBe(200);
    expect(done.body.data).toMatchObject({ status: 'COMPLETED', finalCost: 120.5, finalMileage: 12500 });
    expect(await vehicleStatus(ids.vehAvail2)).toMatchObject({ status: 'AVAILABLE', currentMileage: 12500 });

    expect((await setStatus(id, { status: 'IN_PROGRESS' })).status).toBe(409);
    expect((await setStatus(id, { status: 'CANCELLED' })).status).toBe(409);
    const history = await http().get(`/api/v1/vehicles/${ids.vehAvail2}/maintenances`).set(auth(tech1));
    expect(history.status).toBe(200);
    expect(history.body.data.items.map((m: any) => m.status)).toContain('COMPLETED');
  });

  it('cancelling a started maintenance releases the vehicle; cancelled cannot restart', async () => {
    const created = await create({ vehicleId: ids.vehAvail2, initialMileage: 12500, scheduledStartAt: '2026-12-10T09:00:00.000Z', scheduledEndAt: '2026-12-10T10:00:00.000Z' });
    const id = created.body.data.id;
    await setStatus(id, { status: 'IN_PROGRESS' });
    expect((await vehicleStatus(ids.vehAvail2)).status).toBe('IN_MAINTENANCE');
    expect((await setStatus(id, { status: 'CANCELLED' })).status).toBe(200);
    expect((await vehicleStatus(ids.vehAvail2)).status).toBe('AVAILABLE');
    expect((await setStatus(id, { status: 'IN_PROGRESS' })).status).toBe(409);
    expect((await setStatus(id, { status: 'COMPLETED', workPerformed: 'a', finalCost: 1, completedAt: new Date().toISOString(), finalMileage: 13000 })).status).toBe(409);
  });

  it('technicians only see and update their own assignments', async () => {
    // Seeded IN_PROGRESS maintenance belongs to mechanic 21 (tech2).
    expect((await http().get(`/api/v1/maintenances/${ids.mntInProgress}`).set(auth(tech1))).status).toBe(403);
    expect((await http().get(`/api/v1/maintenances/${ids.mntInProgress}`).set(auth(tech2))).status).toBe(200);
    const mine = await http().get('/api/v1/maintenances').set(auth(tech2));
    expect(mine.body.data.items.every((m: any) => m.mechanicId === ids.mechActive2)).toBe(true);
    expect((await setStatus(ids.mntInProgress, { status: 'CANCELLED' }, tech1)).status).toBe(403);
    const done = await setStatus(ids.mntInProgress, { status: 'COMPLETED', workPerformed: 'Brakes', finalCost: 500, completedAt: '2026-10-21T10:00:00.000Z', finalMileage: 80100 }, tech2);
    expect(done.status).toBe(200);
    expect((await vehicleStatus(ids.vehInMaint)).status).toBe('AVAILABLE');
  });

  it('deactivating a mechanic keeps its history', async () => {
    await http().patch(`/api/v1/mechanics/${ids.mechActive2}/status`).set(auth(admin)).send({ isActive: false });
    expect((await http().get(`/api/v1/maintenances/${ids.mntInProgress}`).set(auth(admin))).status).toBe(200);
  });
});

describe('Concurrency (e2e)', () => {
  let app: INestApplication;
  let admin: string;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createApp();
    admin = await asAdmin(app);
  });
  afterAll(() => closeApp(app));

  const payload = (o: Record<string, unknown>) => ({
    type: 'CORRECTIVE', description: 'Concurrent', initialMileage: 45000,
    scheduledStartAt: '2027-01-01T09:00:00.000Z', scheduledEndAt: '2027-01-01T11:00:00.000Z',
    workshopId: ids.workshopActive, ...o,
  });

  it('simultaneous requests for the same vehicle yield exactly one 201', async () => {
    const results = await Promise.all(
      Array.from({ length: 8 }, (_, i) =>
        http().post('/api/v1/maintenances').set(auth(admin)).send(payload({
          vehicleId: ids.vehAvail1,
          mechanicId: i % 2 ? ids.mechActive1 : ids.mechActive2,
          scheduledStartAt: `2027-01-0${i + 1}T09:00:00.000Z`,
          scheduledEndAt: `2027-01-0${i + 1}T11:00:00.000Z`,
        })),
      ),
    );
    const codes = results.map((r) => r.status);
    expect(codes.filter((c) => c === 201)).toHaveLength(1);
    expect(codes.filter((c) => c === 409)).toHaveLength(7);
  });

  it('simultaneous overlapping schedules for the same mechanic yield exactly one 201', async () => {
    const vehicles = [ids.vehAvail2];
    // Create extra vehicles to isolate the mechanic constraint.
    for (let i = 0; i < 5; i++) {
      const v = await http().post('/api/v1/vehicles').set(auth(admin)).send({ plate: `CON${i}00`, brand: 'B', model: 'M', year: 2024, currentMileage: 0 });
      vehicles.push(v.body.data.id);
    }
    const results = await Promise.all(
      vehicles.map((vehicleId) =>
        http().post('/api/v1/maintenances').set(auth(admin)).send(payload({
          vehicleId, initialMileage: 12000, mechanicId: ids.mechActive1,
          scheduledStartAt: '2027-02-01T09:00:00.000Z', scheduledEndAt: '2027-02-01T11:00:00.000Z',
        })),
      ),
    );
    const codes = results.map((r) => r.status);
    expect(codes.filter((c) => c === 201)).toHaveLength(1);
    expect(codes.filter((c) => c === 409)).toHaveLength(vehicles.length - 1);
  });
});
