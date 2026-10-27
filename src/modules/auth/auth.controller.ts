// src/modules/auth/auth.controller.ts
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/index.js';
import { loginLimit, THROTTLE_TTL_MS } from '../../config/throttle.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

/** Public authentication endpoints. */
@ApiTags('auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Self-registers a new user with the TECHNICIAN role (409 if the email exists). */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  /** Exchanges credentials for a JWT access token; rate-limited (401 on invalid credentials). */
  @Post('login')
  @Throttle({ default: { limit: loginLimit, ttl: THROTTLE_TTL_MS } })
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}
