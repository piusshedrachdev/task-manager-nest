import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { STATUS_CODES } from 'node:http';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

import {
  ErrorCode,
  AppException,
  type ErrorDetail,
} from '../errors/app.exception.js';
import type { ErrorResponseBody } from '../errors/error-response.interface.js';

interface NormalizedError {
  status: number;
  code: string;
  message: string;
  details?: ErrorDetail[];
}

const DEFAULT_ERROR_CODES: Record<number, string> = {
  400: ErrorCode.BAD_REQUEST,
  401: ErrorCode.UNAUTHORIZED,
  403: ErrorCode.FORBIDDEN,
  404: ErrorCode.NOT_FOUND,
  409: ErrorCode.DUPLICATE_RESOURCE,
  422: ErrorCode.BUSINESS_RULE_VIOLATION,
  500: ErrorCode.INTERNAL_SERVER_ERROR,
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const error = this.normalize(exception);
    const path = request.originalUrl ?? request.url;

    const body: ErrorResponseBody = {
      success: false,
      statusCode: error.status,
      error: STATUS_CODES[String(error.status)] ?? 'Error',
      code: error.code,
      message: error.message,
      ...(error.details?.length ? { details: error.details } : {}),
      path,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    this.log(exception, error, request.method, path);

    response.status(error.status).json(body);
  }

  private normalize(exception: unknown): NormalizedError {
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return { status, code: this.defaultCode(status), message: payload };
      }

      if (payload && typeof payload === 'object') {
        const record = payload as Record<string, unknown>;
        const rawMessage = record.message;
        const isMessageArray = Array.isArray(rawMessage);

        const details: ErrorDetail[] | undefined = isMessageArray
          ? rawMessage.map((message) => ({ message: String(message) }))
          : undefined;

        const message = isMessageArray
          ? 'Validation failed'
          : typeof rawMessage === 'string'
            ? rawMessage
            : exception.message;

        const code =
          typeof record.code === 'string'
            ? record.code
            : isMessageArray
              ? ErrorCode.VALIDATION_ERROR
              : this.defaultCode(status);

        return { status, code, message, details };
      }

      return {
        status,
        code: this.defaultCode(status),
        message: exception.message,
      };
    }

    if (exception instanceof QueryFailedError) {
      return this.fromQueryFailedError(exception);
    }

    return {
      status: 500,
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
    };
  }

  private fromQueryFailedError(exception: QueryFailedError): NormalizedError {
    const driverError = exception.driverError as
      | { code?: string; detail?: string }
      | undefined;

    switch (driverError?.code) {
      case '23505':
        return {
          status: 409,
          code: ErrorCode.DUPLICATE_RESOURCE,
          message: 'A resource with the same unique value already exists',
        };
      case '23503':
        return {
          status: 409,
          code: ErrorCode.FOREIGN_KEY_VIOLATION,
          message: 'The operation references a resource that does not exist',
        };
      case '23502':
        return {
          status: 400,
          code: ErrorCode.INVALID_INPUT,
          message: 'A required field is missing',
        };
      case '22P02':
        return {
          status: 400,
          code: ErrorCode.INVALID_INPUT,
          message: 'One or more values have an invalid format',
        };
      case '23514':
        return {
          status: 400,
          code: ErrorCode.INVALID_INPUT,
          message: 'A value violates a database constraint',
        };
      default:
        return {
          status: 500,
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'A database error occurred',
        };
    }
  }

  private defaultCode(status: number): string {
    return DEFAULT_ERROR_CODES[status] ?? `HTTP_${status}`;
  }

  private log(
    exception: unknown,
    error: NormalizedError,
    method: string,
    path: string,
  ): void {
    const context = `${method} ${path} -> ${error.status} ${error.code}`;

    if (error.status >= 500) {
      this.logger.error(
        context,
        exception instanceof Error ? exception.stack : undefined,
      );
      return;
    }

    this.logger.warn(`${context}: ${error.message}`);
  }
}
