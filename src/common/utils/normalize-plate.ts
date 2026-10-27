// src/common/utils/normalize-plate.ts
/** Strips whitespace and hyphens from a license plate and uppercases it. */
export const normalizePlate = (p: string) =>
  p.replace(/[\s-]/g, '').toUpperCase();
