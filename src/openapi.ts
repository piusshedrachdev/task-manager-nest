import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { createOpenApiDocument } from './common/swagger/swagger.config.js';

async function exportOpenApi() {
  const app = await NestFactory.create(AppModule, { logger: false });

  try {
    await app.init();

    const output = path.resolve(process.cwd(), 'docs', 'openapi.json');

    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(
      output,
      `${JSON.stringify(createOpenApiDocument(app), null, 2)}\n`,
      'utf8',
    );

    console.log(`OpenAPI document written to ${output}`);
  } finally {
    await app.close();
  }
}

await exportOpenApi();
