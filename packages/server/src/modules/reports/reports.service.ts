/**
 * 报告服务
 */

import { Injectable, NotFoundException } from '@nestjs/common'
import { ReportService } from '../storage/report.service.js'

@Injectable()
export class ReportsService {
  constructor(private readonly reportService: ReportService) {}

  findAll() {
    return this.reportService.findAll()
  }

  findOne(id: string) {
    const report = this.reportService.findOne(id)
    if (!report) {
      throw new NotFoundException('报告不存在')
    }
    return report
  }

  findByTaskId(taskId: string) {
    return this.reportService.findByTaskId(taskId)
  }
}
