import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  MaintenanceStatus,
  MaintenanceType,
  VehicleStatus,
} from '../src/common/enums/index.js';
import { MaintenanceDao } from '../src/modules/maintenances/dao/maintenance.dao.js';
import { VehicleDao } from '../src/modules/vehicles/dao/vehicle.dao.js';
import { closeApp, createApp, ids, resetDb } from './helpers.js';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const at = (iso: string) => new Date(iso);

describe('DAOs (integration)', () => {
  let app: INestApplication;
  let ds: DataSource;
  let vehicles: VehicleDao;
  let maintenances: MaintenanceDao;

  beforeAll(async () => {
    app = await createApp();
    ds = app.get(DataSource);
    vehicles = app.get(VehicleDao);
    maintenances = app.get(MaintenanceDao);
  });
  afterAll(async () => closeApp(app));
  beforeEach(async () => resetDb(ds));

  describe('VehicleDao.findPaginated', () => {
    it('orders by plate ascending and reports the total', async () => {
      const [rows, total] = await vehicles.findPaginated(1, 10);
      expect(total).toBe(4);
      expect(rows.map((v) => v.plate)).toEqual([
        'ABC123',
        'DEF456',
        'GHI789',
        'JKL012',
      ]);
    });

    it('paginates with page/limit while keeping the full total', async () => {
      const [p2, total] = await vehicles.findPaginated(2, 3);
      expect(total).toBe(4);
      expect(p2.map((v) => v.plate)).toEqual(['JKL012']);
      const [p1] = await vehicles.findPaginated(1, 3);
      expect(p1).toHaveLength(3);
    });

    it.each([
      [VehicleStatus.AVAILABLE, ['ABC123', 'DEF456']],
      [VehicleStatus.IN_MAINTENANCE, ['GHI789']],
      [VehicleStatus.INACTIVE, ['JKL012']],
    ])('filters by status %s', async (status, plates) => {
      const [rows, total] = await vehicles.findPaginated(1, 10, status);
      expect(rows.map((v) => v.plate)).toEqual(plates);
      expect(total).toBe(plates.length);
    });

    it('returns an empty page beyond the last one', async () => {
      const [rows, total] = await vehicles.findPaginated(5, 10);
      expect(rows).toEqual([]);
      expect(total).toBe(4);
    });
  });

  describe('MaintenanceDao.mechanicHasOverlap', () => {
    // Seed: Ana (mechActive2) has an IN_PROGRESS maintenance
    // 2026-09-20T08:00Z -> 2026-09-21T08:00Z.
    const overlap = (
      mechanicId: string,
      start: string,
      end: string,
    ): Promise<boolean> =>
      ds.transaction((em) =>
        maintenances.mechanicHasOverlap(mechanicId, at(start), at(end), em),
      );

    const insert = (status: MaintenanceStatus) =>
      ds.transaction((em) =>
        maintenances.create(
          {
            type: MaintenanceType.PREVENTIVE,
            description: 'extra',
            initialMileage: 12000,
            scheduledStartAt: at('2026-10-01T08:00:00Z'),
            scheduledEndAt: at('2026-10-02T08:00:00Z'),
            vehicleId: ids.vehAvail2,
            mechanicId: ids.mechActive1,
            workshopId: ids.workshopActive,
            status,
          },
          em,
        ),
      );

    it('is true when the window intersects an active maintenance', async () => {
      const m = ids.mechActive2;
      expect(
        await overlap(m, '2026-09-20T20:00:00Z', '2026-09-21T20:00:00Z'),
      ).toBe(true);
      // contained, and containing
      expect(
        await overlap(m, '2026-09-20T10:00:00Z', '2026-09-20T12:00:00Z'),
      ).toBe(true);
      expect(
        await overlap(m, '2026-09-19T00:00:00Z', '2026-09-23T00:00:00Z'),
      ).toBe(true);
    });

    it('is false for adjacent windows', async () => {
      const m = ids.mechActive2;
      expect(
        await overlap(m, '2026-09-21T08:00:00Z', '2026-09-21T10:00:00Z'),
      ).toBe(false);
      expect(
        await overlap(m, '2026-09-20T06:00:00Z', '2026-09-20T08:00:00Z'),
      ).toBe(false);
    });

    it('is false for other mechanics', async () => {
      expect(
        await overlap(
          ids.mechActive1,
          '2026-09-20T08:00:00Z',
          '2026-09-21T08:00:00Z',
        ),
      ).toBe(false);
    });

    it('ignores COMPLETED and CANCELLED maintenances', async () => {
      // Seed has a COMPLETED one for Carlos: 2026-09-14 08:00 -> 09-15 08:00.
      expect(
        await overlap(
          ids.mechActive1,
          '2026-09-14T08:00:00Z',
          '2026-09-15T08:00:00Z',
        ),
      ).toBe(false);

      await insert(MaintenanceStatus.CANCELLED);
      expect(
        await overlap(
          ids.mechActive1,
          '2026-10-01T09:00:00Z',
          '2026-10-01T10:00:00Z',
        ),
      ).toBe(false);
    });

    it('counts SCHEDULED maintenances', async () => {
      await insert(MaintenanceStatus.SCHEDULED);
      expect(
        await overlap(
          ids.mechActive1,
          '2026-10-01T09:00:00Z',
          '2026-10-01T10:00:00Z',
        ),
      ).toBe(true);
    });
  });

  describe('row locks (findByIdForUpdate)', () => {
    it('returns null for unknown ids', async () => {
      const missing = '019a0000-0000-7000-8000-0000000000ff';
      await ds.transaction(async (em) => {
        expect(await vehicles.findByIdForUpdate(missing, em)).toBeNull();
        expect(await maintenances.findByIdForUpdate(missing, em)).toBeNull();
      });
    });

    it('MaintenanceDao.findByIdForUpdate loads relations', async () => {
      await ds.transaction(async (em) => {
        const m = await maintenances.findByIdForUpdate(ids.mntInProgress, em);
        expect(m?.vehicle?.id).toBe(ids.vehInMaint);
        expect(m?.mechanic?.id).toBe(ids.mechActive2);
        expect(m?.workshop?.id).toBe(ids.workshopActive);
      });
    });

    async function withTwoTx(
      fn: (a: { manager: any; query: any }, b: any) => Promise<void>,
    ) {
      const qr1 = ds.createQueryRunner();
      const qr2 = ds.createQueryRunner();
      await qr1.connect();
      await qr2.connect();
      await qr1.startTransaction();
      await qr2.startTransaction();
      try {
        await fn(qr1, qr2);
      } finally {
        if (qr1.isTransactionActive) await qr1.rollbackTransaction();
        if (qr2.isTransactionActive) await qr2.rollbackTransaction();
        await qr1.release();
        await qr2.release();
      }
    }

    it('VehicleDao.findByIdForUpdate blocks a concurrent lock until commit', async () => {
      await withTwoTx(async (qr1: any, qr2: any) => {
        const v1 = await vehicles.findByIdForUpdate(ids.vehAvail1, qr1.manager);
        expect(v1?.plate).toBe('ABC123');

        // A short lock_timeout makes the second locker fail instead of wait.
        await qr2.query("SET LOCAL lock_timeout = '200ms'");
        await expect(
          vehicles.findByIdForUpdate(ids.vehAvail1, qr2.manager),
        ).rejects.toMatchObject({ code: '55P03' });
        await qr2.rollbackTransaction();
        await qr2.startTransaction();

        // The second locker now waits until the first commits, then sees
        // the committed change.
        let settled = false;
        const second = vehicles
          .findByIdForUpdate(ids.vehAvail1, qr2.manager)
          .then((v) => {
            settled = true;
            return v;
          });
        await sleep(300);
        expect(settled).toBe(false);

        v1!.currentMileage = 99999;
        await vehicles.update(v1!, qr1.manager);
        await qr1.commitTransaction();

        const v2 = await second;
        expect(v2?.currentMileage).toBe(99999);
        await qr2.commitTransaction();
      });
    });

    it('MaintenanceDao.findByIdForUpdate serializes concurrent status changes', async () => {
      await withTwoTx(async (qr1: any, qr2: any) => {
        const m1 = await maintenances.findByIdForUpdate(
          ids.mntInProgress,
          qr1.manager,
        );
        expect(m1?.status).toBe(MaintenanceStatus.IN_PROGRESS);

        await qr2.query("SET LOCAL lock_timeout = '200ms'");
        await expect(
          maintenances.findByIdForUpdate(ids.mntInProgress, qr2.manager),
        ).rejects.toMatchObject({ code: '55P03' });
        await qr2.rollbackTransaction();
        await qr2.startTransaction();

        let settled = false;
        const second = maintenances
          .findByIdForUpdate(ids.mntInProgress, qr2.manager)
          .then((m) => {
            settled = true;
            return m;
          });
        await sleep(300);
        expect(settled).toBe(false);

        await qr1.query(
          "UPDATE maintenances SET status = 'CANCELLED' WHERE id = $1",
          [ids.mntInProgress],
        );
        await qr1.commitTransaction();

        const m2 = await second;
        expect(m2?.status).toBe(MaintenanceStatus.CANCELLED);
        await qr2.commitTransaction();
      });
    });
  });
});
