import { ConflictException } from '@nestjs/common';

/** Translates PostgreSQL constraint violations into descriptive 409 responses. */
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
