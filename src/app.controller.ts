// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/index.js';
import { AppService } from './app.service.js';

/** Root controller exposing a public liveness endpoint. */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  /** Public root endpoint, usable as a liveness check. */
  getHello(): string {
    return this.appService.getHello();
  }
}
