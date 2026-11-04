import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorDetail {
  field?: string;
  message: string;
}

export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  FOREIGN_KEY_VIOLATION: 'FOREIGN_KEY_VIOLATION',
  INVALID_INPUT: 'INVALID_INPUT',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

export class AppException extends HttpException {
  readonly code: ErrorCodeValue;
  readonly details?: ErrorDetail[];

  constructor(
    message: string,
    status: HttpStatus,
    code: ErrorCodeValue,
    details?: ErrorDetail[],
  ) {
    super(
      {
        message,
        code,
        ...(details?.length ? { details } : {}),
      },
      status,
    );

    this.code = code;
    this.details = details;
  }
}

export class ValidationException extends AppException {
  constructor(message = 'Validation failed', details?: ErrorDetail[]) {
    super(message, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, details);
  }
}

export class ResourceNotFoundException extends AppException {
  constructor(resource: string, id?: string | number) {
    super(
      id === undefined ? `${resource} not found` : `${resource} with id "${id}" not found`,
      HttpStatus.NOT_FOUND,
      ErrorCode.NOT_FOUND,
    );
  }
}

export class DuplicateResourceException extends AppException {
  constructor(message = 'A resource with the same unique value already exists') {
    super(message, HttpStatus.CONFLICT, ErrorCode.DUPLICATE_RESOURCE);
  }
}

export class InvalidCredentialsException extends AppException {
  constructor(message = 'Invalid email or password') {
    super(message, HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
  }
}

export class ForbiddenOperationException extends AppException {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
  }
}

export class BusinessRuleException extends AppException {
  constructor(message: string, details?: ErrorDetail[]) {
    super(
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      ErrorCode.BUSINESS_RULE_VIOLATION,
      details,
    );
  }
}
