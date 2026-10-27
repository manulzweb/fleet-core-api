import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration.js';
import { validate } from './config/env.validation.js';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { IntegrationsModule } from './modules/integrations/integrations.module.js';
import { MaintenancesModule } from './modules/maintenances/maintenances.module.js';
import { MechanicsModule } from './modules/mechanics/mechanics.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { VehiclesModule } from './modules/vehicles/vehicles.module.js';
import { WorkshopsModule } from './modules/workshops/workshops.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host', 'localhost'),
        port: configService.get<number>('database.port', 5432),
        username: configService.get<string>('database.username', 'postgres'),
        password: configService.get<string>('database.password', 'postgres'),
        database: configService.get<string>('database.database', 'fleetcore'),
        synchronize: configService.get<boolean>('database.synchronize', false),
        logging: configService.get<boolean>('database.logging', false),
        ssl: configService.get<boolean>('database.ssl', false),
        autoLoadEntities: true,
      }),
    }),

    UsersModule,
    AuthModule,
    VehiclesModule,
    MechanicsModule,
    WorkshopsModule,
    MaintenancesModule,
    IntegrationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}