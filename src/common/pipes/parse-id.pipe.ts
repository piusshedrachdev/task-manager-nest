import { Injectable, PipeTransform } from '@nestjs/common';

import { ValidationException } from '../errors/app.exception.js';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    if (!/^[1-9]\d*$/.test(value)) {
      throw new ValidationException('Validation failed', [
        { field: 'id', message: 'id must be a positive integer' },
      ]);
    }

    const id = Number(value);

    if (!Number.isSafeInteger(id)) {
      throw new ValidationException('Validation failed', [
        { field: 'id', message: 'id must be a safe positive integer' },
      ]);
    }

    return id;
  }
}
