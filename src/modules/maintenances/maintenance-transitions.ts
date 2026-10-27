import { MaintenanceStatus as S } from '../../common/enums/index.js';

const ALLOWED: Record<S, S[]> = {
  [S.SCHEDULED]: [S.IN_PROGRESS, S.CANCELLED],
  [S.IN_PROGRESS]: [S.COMPLETED, S.CANCELLED],
  [S.COMPLETED]: [],
  [S.CANCELLED]: [],
};

export const canTransition = (from: S, to: S) => ALLOWED[from].includes(to);
