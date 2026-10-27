import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { normalizeEmail } from '../../../common/utils/normalize-email.js';

export class CreateMechanicDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(120) name: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(254)
  @Transform(normalizeEmail)
  email: string;

  @ApiProperty() @IsString() @MinLength(1) @MaxLength(100) specialty: string;

  @ApiPropertyOptional({
    description: 'Technician user that operates as this mechanic',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
