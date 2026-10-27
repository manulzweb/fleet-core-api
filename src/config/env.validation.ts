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

  @Transform(({ obj, key }) => obj[key] === true || obj[key] === 'true')
  @IsBoolean()
  @IsOptional()
  DB_SSL: boolean = false;

  @Transform(({ obj, key }) => obj[key] === true || obj[key] === 'true')
  @IsBoolean()
  @IsOptional()
  DB_LOGGING: boolean = false;

  @Transform(({ obj, key }) => obj[key] === true || obj[key] === 'true')
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

  if (validatedConfig.NODE_ENV === Environment.Production) {
    const problems = validateProductionSecrets(validatedConfig);
    if (problems.length > 0) {
      throw new Error(
        `Error de validación de variables de entorno: ${problems.join('; ')}`,
      );
    }
  }

  return validatedConfig;
}

const EXAMPLE_API_KEYS = ['demo-key-partner-1', 'demo-key-partner-2'];

function validateProductionSecrets(config: EnvironmentVariables): string[] {
  const problems: string[] = [];
  const secret = config.JWT_SECRET;

  if (secret.toLowerCase().includes('cambia')) {
    problems.push(
      'JWT_SECRET usa un valor de ejemplo no permitido en producción',
    );
  }
  if (secret.length < 32) {
    problems.push('JWT_SECRET debe tener al menos 32 caracteres en producción');
  }

  const keys = config.API_KEYS.split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
  if (keys.some((k) => k.startsWith('demo-') || EXAMPLE_API_KEYS.includes(k))) {
    problems.push(
      'API_KEYS contiene claves de ejemplo no permitidas en producción',
    );
  }

  return problems;
}
