import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorDetailDto {
  @ApiPropertyOptional({
    example: 'email',
    description: 'Field that failed validation, when the error is field-level',
  })
  field?: string;

  @ApiProperty({ example: 'email must be an email' })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Not Found' })
  error: string;

  @ApiProperty({
    example: 'NOT_FOUND',
    description: 'Stable machine-readable error code',
  })
  code: string;

  @ApiProperty({ example: 'Task with id "99" not found' })
  message: string;

  @ApiPropertyOptional({
    type: [ErrorDetailDto],
    description: 'Field-level errors, present only for validation failures',
  })
  details?: ErrorDetailDto[];

  @ApiProperty({ example: '/tasks/99' })
  path: string;

  @ApiProperty({ example: 'GET' })
  method: string;

  @ApiProperty({ example: '2026-11-04T10:00:00.000Z' })
  timestamp: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Account created successfully.' })
  message: string;
}

export class DeleteResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: true })
  deleted: boolean;
}
