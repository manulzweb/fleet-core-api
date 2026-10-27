// src/common/utils/normalize-email.ts
/** class-transformer `@Transform` callback that trims and lowercases string emails. */
export const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;
