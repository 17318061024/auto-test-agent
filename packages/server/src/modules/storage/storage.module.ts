/**
 * 存储模块 - 提供数据存储服务
 */

import { Module, Global } from '@nestjs/common'
import { TaskService } from './task.service.js'
import { ClientService } from './client.service.js'
import { ReportService } from './report.service.js'

@Global()
@Module({
  providers: [TaskService, ClientService, ReportService],
  exports: [TaskService, ClientService, ReportService],
})
export class StorageModule {}
