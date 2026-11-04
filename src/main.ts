import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

import { setupSwagger } from './common/swagger/swagger.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  setupSwagger(app, configService);

  await app.listen(Number(configService.get<string>('PORT') ?? 3000));
}
await bootstrap();
