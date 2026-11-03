import 'reflect-metadata';
import 'dotenv/config';

import { DataSource } from 'typeorm';

import { Task } from './tasks/entities/task.entity.js';
import { Projects } from './projects/entity/project.entity.js';
import {Users} from './users/entities/users.entity.js'

export default new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [Task, Projects, Users],

  migrations: ['src/migrations/*.ts'],

  synchronize: false,
});