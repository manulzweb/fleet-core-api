// src/modules/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';
import { normalizeEmail } from '../../../common/utils/normalize-email.js';

/** Login credentials. The email is normalized before validation. */
export class LoginDto {
  @ApiProperty()
  @IsEmail()
  @Transform(normalizeEmail)
  email: string;

  @ApiProperty() @IsString() password: string;
}
