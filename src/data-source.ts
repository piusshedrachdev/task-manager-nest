import 'reflect-metadata';
import 'dotenv/config';

import { DataSource } from 'typeorm';

import { Task } from './tasks/entities/task.entity.js';
import { Projects } from './projects/entity/project.entity.js';
import { Users } from './users/entities/users.entity.js';
import { validateEnv } from './config/env.validation.js';

const env = validateEnv(process.env);

export default new DataSource({
  type: 'postgres',

  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,

  entities: [Task, Projects, Users],

  migrations: ['src/migrations/*.ts'],

  synchronize: false,
});