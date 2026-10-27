import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp, configureSecurity, setupSwagger } from './app.setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureSecurity(app);
  configureApp(app);
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
