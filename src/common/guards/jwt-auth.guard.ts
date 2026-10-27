import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../modules/users/users.service.js';
import { IS_PUBLIC_KEY } from '../decorators/index.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    const [type, token] = (req.headers.authorization ?? '').split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Missing or invalid authentication token',
      );
    }
    try {
      const payload = await this.jwt.verifyAsync(token);
      const user = await this.users.getEntity(payload.sub);
      if (!user.isActive) throw new Error('inactive');
      req.user = { id: user.id, role: user.role.code };
    } catch {
      throw new UnauthorizedException(
        'Missing or invalid authentication token',
      );
    }
    return true;
  }
}
