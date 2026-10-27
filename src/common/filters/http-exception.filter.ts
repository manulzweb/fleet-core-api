// src/common/filters/http-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

/**
 * Catches every exception and replies with the standard error envelope
 * (`success: false`, status, message, path, timestamp). Non-HTTP errors are
 * logged and reported as a generic 500 without leaking details.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message =
        typeof body === 'string' ? body : ((body as any).message ?? message);
    } else {
      this.logger.error(
        exception instanceof Error ? exception.message : String(exception),
      );
    }

    res.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: req.originalUrl ?? req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
