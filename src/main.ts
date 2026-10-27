import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  configureApp(app);

  const swaggerConfig = new DocumentBuilder()
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
    SwaggerModule.createDocument(app, swaggerConfig),
    {
      customSiteTitle: 'FleetCore API Docs',
    },
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
