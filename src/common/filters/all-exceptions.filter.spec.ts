import {
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import { AllExceptionsFilter } from './all-exceptions.filter.js';
import {
  ErrorCode,
  ResourceNotFoundException,
} from '../errors/app.exception.js';

interface HttpHarness {
  host: ArgumentsHost;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
}

function createHost(): HttpHarness {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });

  const host = {
    switchToHttp: () => ({
      getRequest: () => ({
        method: 'GET',
        url: '/tasks/99',
        originalUrl: '/tasks/99',
      }),
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses the standard envelope for application exceptions', () => {
    const { host, status, json } = createHost();

    filter.catch(new ResourceNotFoundException('Task', 99), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        code: ErrorCode.NOT_FOUND,
        message: 'Task with id "99" not found',
        path: '/tasks/99',
        method: 'GET',
      }),
    );
    expect(json.mock.calls[0][0].timestamp).toEqual(expect.any(String));
  });

  it('maps validation message arrays to structured details', () => {
    const { host, status, json } = createHost();

    filter.catch(
      new BadRequestException(['email must be an email']),
      host,
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: [{ message: 'email must be an email' }],
      }),
    );
  });

  it('maps a unique database violation to a 409 response', () => {
    const { host, status, json } = createHost();
    const driverError = Object.assign(new Error('duplicate key'), {
      code: '23505',
    });
    const exception = new QueryFailedError('INSERT INTO users', [], driverError);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 409,
        code: ErrorCode.DUPLICATE_RESOURCE,
      }),
    );
  });

  it('does not leak internal details for unknown errors', () => {
    const { host, status, json } = createHost();

    filter.catch(new Error('connection string leaked'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
      }),
    );
  });
});
