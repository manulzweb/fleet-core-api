// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp, configureSecurity, setupSwagger } from './app.setup.js';

/** Creates the Nest application, applies security and HTTP setup, and starts listening. */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureSecurity(app);
  configureApp(app);
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
