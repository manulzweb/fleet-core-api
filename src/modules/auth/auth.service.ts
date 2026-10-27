import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RoleCode } from '../../common/enums/index.js';
import { UserMapper } from '../users/mapper/user.mapper.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.users.create(
      { name: dto.name, email: dto.email, passwordHash },
      RoleCode.TECHNICIAN,
    );
    const { id, name, email, role } = UserMapper.toResponse(user);
    return { id, name, email, role };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    const ok =
      !!user && user.isActive && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      role: user.role.code,
    });
    return { accessToken, tokenType: 'Bearer' as const };
  }
}
