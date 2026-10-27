// src/config/env.validation.ts

import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum Environment {
  Local = 'local',
  Development = 'development',
  Test = 'test',
  Staging = 'staging',
  Production = 'production',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1)
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsOptional()
  DB_HOST?: string = 'localhost';

  @IsNumber()
  @IsOptional()
  DB_PORT: number = 5432;

  @IsString()
  @IsOptional()
  DB_USERNAME?: string = 'postgres';

  @IsString()
  @IsOptional()
  DB_PASSWORD?: string = 'postgres';

  @IsString()
  @IsOptional()
  DB_NAME?: string = 'fleetcore';

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  DB_SSL: boolean = false;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  DB_LOGGING: boolean = false;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  DB_SYNCHRONIZE: boolean = false;

  @IsString()
  @MinLength(8)
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '1h';

  @IsString()
  @MinLength(1)
  API_KEYS: string;

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Error de validación de variables de entorno: ${errors.toString()}`,
    );
  }

  return validatedConfig;
}
