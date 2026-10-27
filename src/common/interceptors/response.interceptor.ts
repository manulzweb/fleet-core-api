// src/common/interceptors/response.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * Wraps successful responses in the standard envelope
 * (`success: true`, status, `data`, timestamp). 204 responses are left empty.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) =>
        res.statusCode === 204
          ? undefined
          : {
              success: true,
              statusCode: res.statusCode,
              data: data ?? null,
              timestamp: new Date().toISOString(),
            },
      ),
    );
  }
}
