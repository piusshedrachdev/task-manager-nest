import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TasksModule } from './tasks/tasks.module.js';
import { DbService } from './db/db.service.js';
import  {ConfigModule} from '@nestjs/config'


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
    }),
    TasksModule
  ],
  controllers: [AppController],
  providers: [AppService, DbService],
})
export class AppModule {}
