// src/common/utils/db-errors.ts
import { ConflictException } from '@nestjs/common';

/**
 * Translates PostgreSQL unique (23505) and exclusion (23P01) violations into
 * 409 responses, using the message mapped to the violated constraint name.
 * Any other error is rethrown unchanged.
 * @param messages Constraint name to conflict message.
 * @throws ConflictException on unique/exclusion violations.
 */
export function rethrowDbConflict(err: any, messages: Record<string, string>) {
  const code = err?.code ?? err?.driverError?.code;
  const constraint = err?.constraint ?? err?.driverError?.constraint;
  if (code === '23505' || code === '23P01') {
    throw new ConflictException(
      messages[constraint] ?? 'The operation conflicts with existing data',
    );
  }
  throw err;
}
