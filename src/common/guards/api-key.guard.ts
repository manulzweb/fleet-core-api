// src/common/guards/api-key.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';

/**
 * Authenticates machine clients via the `x-api-key` header, compared in
 * constant time against the comma-separated `API_KEYS` setting.
 * @throws UnauthorizedException when the key is missing or not recognised.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly keys: Buffer[];

  constructor(config: ConfigService) {
    this.keys = (config.get<string>('API_KEYS') ?? '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
      .map((k) => Buffer.from(k));
  }

  canActivate(context: ExecutionContext): boolean {
    const provided = context.switchToHttp().getRequest().headers['x-api-key'];
    if (typeof provided !== 'string' || !provided) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
    const candidate = Buffer.from(provided);
    const ok = this.keys.some(
      (k) => k.length === candidate.length && timingSafeEqual(k, candidate),
    );
    if (!ok) throw new UnauthorizedException('Invalid or missing API key');
    return true;
  }
}
