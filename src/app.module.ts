import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TasksModule } from './tasks/tasks.module.js';
import { DbModule } from './db/db.module.js';
import  {ConfigModule} from '@nestjs/config'


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
    }),
    TasksModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
