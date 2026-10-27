import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

/** Shared HTTP configuration used by main.ts and the e2e tests. */
export function configureApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}

/** Security middleware: helmet and CORS restricted by CORS_ORIGINS. */
export function configureSecurity(
  app: INestApplication,
  env: NodeJS.ProcessEnv = process.env,
) {
  // Swagger UI relies on inline scripts/styles, so CSP is relaxed outside production only.
  const production = env.NODE_ENV === 'production';
  app.use(helmet(production ? {} : { contentSecurityPolicy: false }));

  const origins = (env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (origins.length) app.enableCors({ origin: origins });
  else if (!production) app.enableCors();
}

/** Mounts Swagger UI at /api/docs; skipped in production. */
export function setupSwagger(
  app: INestApplication,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.NODE_ENV === 'production') return false;
  const config = new DocumentBuilder()
    .setTitle('FleetCore API')
    .setDescription(
      'REST API para gestionar vehículos, mecánicos, talleres y mantenimientos.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, config),
    {
      customSiteTitle: 'FleetCore API Docs',
    },
  );
  return true;
}
