/**
 * 任务模块
 */

import { Module } from '@nestjs/common'
import { TasksController } from './tasks.controller.js'
import { TasksService } from './tasks.service.js'
import { TaskService } from '../storage/task.service.js'
import { ReportService } from '../storage/report.service.js'
import { SocketGateway } from '../websocket/socket.gateway.js'

@Module({
  controllers: [TasksController],
  providers: [TasksService, TaskService, ReportService, SocketGateway],
  exports: [TasksService],
})
export class TasksModule {}
