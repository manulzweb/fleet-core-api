import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleCode } from '../enums/index.js';
import { ApiKeyGuard } from './api-key.guard.js';
import { RolesGuard } from './roles.guard.js';

const ctx = (req: object, meta: { roles?: RoleCode[] } = {}) => {
  const reflector = { getAllAndOverride: (k: string) => (k === 'roles' ? meta.roles : undefined) } as unknown as Reflector;
  const context = {
    getHandler: () => null,
    getClass: () => null,
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
  return { reflector, context };
};

describe('RolesGuard', () => {
  it('allows when no roles are required', () => {
    const { reflector, context } = ctx({ user: { role: RoleCode.TECHNICIAN } });
    expect(new RolesGuard(reflector).canActivate(context)).toBe(true);
  });
  it('allows a matching role and forbids others', () => {
    const ok = ctx({ user: { role: RoleCode.ADMIN } }, { roles: [RoleCode.ADMIN] });
    expect(new RolesGuard(ok.reflector).canActivate(ok.context)).toBe(true);
    const no = ctx({ user: { role: RoleCode.TECHNICIAN } }, { roles: [RoleCode.ADMIN] });
    expect(() => new RolesGuard(no.reflector).canActivate(no.context)).toThrow(ForbiddenException);
  });
});

describe('ApiKeyGuard', () => {
  const guard = new ApiKeyGuard({ get: () => 'k1, k2' } as any);
  const run = (key?: string) => guard.canActivate(ctx({ headers: key ? { 'x-api-key': key } : {} }).context);
  it('accepts any configured key', () => {
    expect(run('k1')).toBe(true);
    expect(run('k2')).toBe(true);
  });
  it('rejects missing or invalid keys', () => {
    expect(() => run()).toThrow(UnauthorizedException);
    expect(() => run('k3')).toThrow(UnauthorizedException);
    expect(() => run('k')).toThrow(UnauthorizedException);
  });
});
