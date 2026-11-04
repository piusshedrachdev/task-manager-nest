import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
} from '@nestjs/swagger';

export function createOpenApiConfig() {
  return new DocumentBuilder()
    .setTitle('Task Manager API')
    .setDescription(
      'Users, projects and tasks API. Authenticate with `POST /users/login`, then send the returned token as `Authorization: Bearer <token>`. Every error uses the documented standard error envelope.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
}

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  return SwaggerModule.createDocument(app, createOpenApiConfig());
}

export function isSwaggerEnabled(configService: ConfigService): boolean {
  const explicit = configService.get<string>('SWAGGER_ENABLED');

  if (explicit !== undefined) {
    return explicit === 'true';
  }

  return configService.get<string>('NODE_ENV') !== 'production';
}

export function setupSwagger(
  app: INestApplication,
  configService: ConfigService,
): void {
  if (!isSwaggerEnabled(configService)) {
    return;
  }

  SwaggerModule.setup('api', app, createOpenApiDocument(app), {
    swaggerOptions: { persistAuthorization: true },
  });
}
