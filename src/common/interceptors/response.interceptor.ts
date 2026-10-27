import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

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
