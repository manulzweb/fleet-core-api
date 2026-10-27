// src/modules/maintenances/maintenance-transitions.ts
import { MaintenanceStatus as S } from '../../common/enums/index.js';

/**
 * Allowed status transitions (terminal states have none):
 * - SCHEDULED   -> IN_PROGRESS | CANCELLED
 * - IN_PROGRESS -> COMPLETED | CANCELLED
 * - COMPLETED   -> (final)
 * - CANCELLED   -> (final)
 */
const ALLOWED: Record<S, S[]> = {
  [S.SCHEDULED]: [S.IN_PROGRESS, S.CANCELLED],
  [S.IN_PROGRESS]: [S.COMPLETED, S.CANCELLED],
  [S.COMPLETED]: [],
  [S.CANCELLED]: [],
};

/** Whether a maintenance may move from status `from` to `to`. */
export const canTransition = (from: S, to: S) => ALLOWED[from].includes(to);
