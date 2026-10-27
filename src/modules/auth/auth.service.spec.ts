// src/modules/auth/auth.service.spec.ts
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RoleCode } from '../../common/enums/index.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const jwt = { signAsync: async (p: any) => `token-for-${p.sub}` } as any;
  const user = async (active = true) => ({
    id: 'u1',
    name: 'U',
    email: 'u@x.com',
    isActive: active,
    passwordHash: await bcrypt.hash('GoodPass123', 4),
    role: { code: 'TECHNICIAN' },
  });

  it('logs in with valid credentials', async () => {
    const svc = new AuthService(
      { findByEmail: async () => user() } as any,
      jwt,
    );
    expect(
      await svc.login({ email: 'u@x.com', password: 'GoodPass123' }),
    ).toEqual({ accessToken: 'token-for-u1', tokenType: 'Bearer' });
  });

  it.each([
    ['wrong password', async () => user(), 'bad'],
    ['unknown user', async () => null, 'GoodPass123'],
    ['inactive user', async () => user(false), 'GoodPass123'],
  ])('rejects %s with 401', async (_n, find, password) => {
    const svc = new AuthService({ findByEmail: find } as any, jwt);
    await expect(
      svc.login({ email: 'u@x.com', password }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('registers as TECHNICIAN with a bcrypt hash', async () => {
    let captured: any;
    const users = {
      create: async (d: any, role: RoleCode) => {
        captured = { d, role };
        return {
          id: 'u2',
          name: d.name,
          email: d.email,
          isActive: true,
          role: { code: role },
        };
      },
    };
    const res = await new AuthService(users as any, jwt).register({
      name: 'N',
      email: 'n@x.com',
      password: 'GoodPass123',
    });
    expect(captured.role).toBe(RoleCode.TECHNICIAN);
    expect(captured.d.passwordHash).not.toBe('GoodPass123');
    expect(await bcrypt.compare('GoodPass123', captured.d.passwordHash)).toBe(
      true,
    );
    expect(res).toEqual({
      id: 'u2',
      name: 'N',
      email: 'n@x.com',
      role: 'TECHNICIAN',
    });
  });
});
