import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TasksModule } from './tasks/tasks.module.js';
import  {ConfigModule} from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProjectsModule } from './projects/projects.module.js';
import { UsersModule } from './users/users.module.js';


console.log({
  passwordType: typeof process.env.DB_PASSWORD,
  passwordExists: process.env.DB_PASSWORD !== undefined,
});


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
    }),
    
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE ?? 'tasks_db',

      autoLoadEntities: true,

      synchronize: false,
    }),

    
    TasksModule,

    
    ProjectsModule,

    
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
