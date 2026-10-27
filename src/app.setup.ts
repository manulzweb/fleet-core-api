import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';

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
