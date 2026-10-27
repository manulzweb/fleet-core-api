// src/common/common.spec.ts
import {
  ArgumentsHost,
  BadRequestException,
  CallHandler,
  ExecutionContext,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { MaintenanceMapper } from '../modules/maintenances/mapper/maintenance.mapper.js';
import { AllExceptionsFilter } from './filters/http-exception.filter.js';
import { ResponseInterceptor } from './interceptors/response.interceptor.js';
import { normalizeEmail } from './utils/normalize-email.js';

describe('AllExceptionsFilter', () => {
  const run = (exception: unknown) => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({ originalUrl: '/api/v1/x' }),
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost;
    new AllExceptionsFilter().catch(exception, host);
    return { status, body: json.mock.calls[0][0] };
  };

  it('keeps the status and message of HttpExceptions', () => {
    const { status, body } = run(new NotFoundException('nope'));
    expect(status).toHaveBeenCalledWith(404);
    expect(body).toMatchObject({
      success: false,
      statusCode: 404,
      message: 'nope',
      path: '/api/v1/x',
    });
  });

  it('keeps validation message arrays', () => {
    const { body } = run(new BadRequestException(['a must be b', 'c']));
    expect(body.message).toEqual(['a must be b', 'c']);
  });

  it('hides unknown errors behind a generic 500', () => {
    const { status, body } = run(new Error('db password leaked'));
    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body.message).toBe('Internal server error');
    expect(run('string error').body.statusCode).toBe(500);
  });
});

describe('ResponseInterceptor', () => {
  const run = (statusCode: number, data: unknown) => {
    const ctx = {
      switchToHttp: () => ({ getResponse: () => ({ statusCode }) }),
    } as unknown as ExecutionContext;
    const next = { handle: () => of(data) } as CallHandler;
    return lastValueFrom(new ResponseInterceptor().intercept(ctx, next));
  };

  it('wraps payloads in the success envelope', async () => {
    expect(await run(200, { a: 1 })).toMatchObject({
      success: true,
      statusCode: 200,
      data: { a: 1 },
    });
  });

  it('uses null for empty payloads', async () => {
    expect(await run(201, undefined)).toMatchObject({ data: null });
  });

  it('sends no body for 204', async () => {
    expect(await run(204, { a: 1 })).toBeUndefined();
  });
});

describe('normalizeEmail', () => {
  it('trims and lowercases strings, passes other values through', () => {
    expect(normalizeEmail({ value: '  Foo@Bar.COM ' })).toBe('foo@bar.com');
    expect(normalizeEmail({ value: 5 })).toBe(5);
  });
});

describe('MaintenanceMapper.toHistoryItem', () => {
  it('exposes the integration shape', () => {
    const item = MaintenanceMapper.toHistoryItem({
      id: 'm',
      type: 'PREVENTIVE',
      status: 'COMPLETED',
      description: 'd',
      finalMileage: 10,
      finalCost: 5,
      completedAt: new Date('2030-01-01T00:00:00Z'),
      mechanic: { id: 'me', name: 'Ana' },
      workshop: { id: 'w', name: 'Taller' },
    } as any);
    expect(item).toEqual({
      id: 'm',
      type: 'PREVENTIVE',
      status: 'COMPLETED',
      description: 'd',
      mileage: 10,
      cost: 5,
      finishedAt: new Date('2030-01-01T00:00:00Z'),
      mechanic: { id: 'me', name: 'Ana' },
      workshop: { id: 'w', name: 'Taller' },
    });
  });
});
