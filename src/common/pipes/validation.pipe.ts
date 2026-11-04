import { ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

import { ErrorDetail, ValidationException } from '../errors/app.exception.js';

export function flattenValidationErrors(
  errors: ValidationError[],
  parent = '',
): ErrorDetail[] {
  return errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;

    const own: ErrorDetail[] = error.constraints
      ? Object.values(error.constraints).map((message) => ({ field, message }))
      : [];

    const children: ErrorDetail[] = error.children?.length
      ? flattenValidationErrors(error.children, field)
      : [];

    return [...own, ...children];
  });
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: false },
    stopAtFirstError: false,
    exceptionFactory: (errors) =>
      new ValidationException('Validation failed', flattenValidationErrors(errors)),
  });
}
