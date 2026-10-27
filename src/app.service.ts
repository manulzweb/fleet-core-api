// src/app.service.ts
import { Injectable } from '@nestjs/common';

/** Provides the root endpoint's greeting. */
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
