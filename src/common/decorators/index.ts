// src/common/decorators/index.ts
import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { RoleCode } from '../enums/index.js';

/** Metadata key set by {@link Public}. */
export const IS_PUBLIC_KEY = 'isPublic';
/** Metadata key set by {@link Roles}. */
export const ROLES_KEY = 'roles';

/** Marks a route or controller as public, skipping JWT and role checks. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
/** Restricts a route or controller to the given roles (enforced by RolesGuard). */
export const Roles = (...roles: RoleCode[]) => SetMetadata(ROLES_KEY, roles);

/** Authenticated principal attached to the request by JwtAuthGuard. */
export interface AuthUser {
  id: string;
  role: RoleCode;
}

/**
 * Param decorator that injects the authenticated user, or a single field of it
 * (e.g. `@User('id')`).
 */
export const User = createParamDecorator(
  (field: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user as AuthUser;
    return field ? user?.[field] : user;
  },
);
/** Alias of {@link User}. */
export const CurrentUser = User;
