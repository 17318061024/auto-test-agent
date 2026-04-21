/**
 * 报告控制器
 */

import { Controller, Get, Param, NotFoundException } from '@nestjs/common'
import { ReportsService } from './reports.service.js'

@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  findAll() {
    return this.reportsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const report = this.reportsService.findOne(id)
    if (!report) {
      throw new NotFoundException('报告不存在')
    }
    return report
  }
}
