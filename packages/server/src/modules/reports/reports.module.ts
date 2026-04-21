/**
 * 报告模块
 */

import { Module } from '@nestjs/common'
import { ReportsController } from './reports.controller.js'
import { ReportsService } from './reports.service.js'
import { ReportService } from '../storage/report.service.js'

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ReportService],
  exports: [ReportsService],
})
export class ReportsModule {}
