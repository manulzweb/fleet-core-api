// src/modules/auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { normalizeEmail } from '../../../common/utils/normalize-email.js';

/** Self-registration payload. The email is normalized; the password length is capped at 72 characters (bcrypt input limit). */
export class RegisterDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(120) name: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(254)
  @Transform(normalizeEmail)
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
