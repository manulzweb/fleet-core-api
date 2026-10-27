// src/modules/maintenances/maintenance-transitions.spec.ts
import { MaintenanceStatus as S } from '../../common/enums/index.js';
import { canTransition } from './maintenance-transitions.js';

describe('maintenance transitions', () => {
  it.each([
    [S.SCHEDULED, S.IN_PROGRESS],
    [S.SCHEDULED, S.CANCELLED],
    [S.IN_PROGRESS, S.COMPLETED],
    [S.IN_PROGRESS, S.CANCELLED],
  ])('allows %s -> %s', (a, b) => expect(canTransition(a, b)).toBe(true));

  it.each([
    [S.SCHEDULED, S.COMPLETED],
    [S.SCHEDULED, S.SCHEDULED],
    [S.IN_PROGRESS, S.SCHEDULED],
    [S.COMPLETED, S.IN_PROGRESS],
    [S.COMPLETED, S.CANCELLED],
    [S.CANCELLED, S.IN_PROGRESS],
    [S.CANCELLED, S.COMPLETED],
  ])('rejects %s -> %s', (a, b) => expect(canTransition(a, b)).toBe(false));
});
