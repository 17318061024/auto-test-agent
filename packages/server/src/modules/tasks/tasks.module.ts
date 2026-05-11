/**
 * 任务模块
 */

import { Module } from '@nestjs/common'
import { TasksController } from './tasks.controller.js'
import { TasksService } from './tasks.service.js'
import { WebsocketModule } from '../websocket/websocket.module.js'

@Module({
  imports: [WebsocketModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
