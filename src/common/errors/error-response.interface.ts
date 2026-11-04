import type { ErrorDetail } from './app.exception.js';

export interface ErrorResponseBody {
  success: false;
  statusCode: number;
  error: string;
  code: string;
  message: string;
  details?: ErrorDetail[];
  path: string;
  method: string;
  timestamp: string;
}
