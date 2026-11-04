import { ApiBadRequestResponse, ApiConflictResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { ErrorResponseDto } from '../dto/error-response.dto.js';

export function ApiValidationError(
  description = 'Request body or route parameter failed validation',
) {
  return ApiBadRequestResponse({ type: ErrorResponseDto, description });
}

export function ApiUnauthorizedError(
  description = 'Missing, invalid or expired bearer token',
) {
  return ApiUnauthorizedResponse({ type: ErrorResponseDto, description });
}

export function ApiForbiddenError(
  description = 'The authenticated user is not allowed to perform this action',
) {
  return ApiForbiddenResponse({ type: ErrorResponseDto, description });
}

export function ApiNotFoundError(description = 'The requested resource was not found') {
  return ApiNotFoundResponse({ type: ErrorResponseDto, description });
}

export function ApiConflictError(description = 'The resource already exists') {
  return ApiConflictResponse({ type: ErrorResponseDto, description });
}
