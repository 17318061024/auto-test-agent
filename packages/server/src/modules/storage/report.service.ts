/**
 * 报告存储服务
 */

import { Injectable } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'

export interface Report {
  id: string
  taskId: string
  clientId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result: any
  error?: string
  logs: string[]
  screenshots: string[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

@Injectable()
export class ReportService {
  private reports: Map<string, Report> = new Map()

  create(data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Report {
    const report: Report = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.reports.set(report.id, report)
    return report
  }

  findAll(): Report[] {
    return Array.from(this.reports.values())
  }

  findOne(id: string): Report | undefined {
    return this.reports.get(id)
  }

  findByTaskId(taskId: string): Report[] {
    return this.findAll().filter(report => report.taskId === taskId)
  }

  update(id: string, data: Partial<Report>): Report | undefined {
    const report = this.reports.get(id)
    if (!report) return undefined

    const updatedReport = {
      ...report,
      ...data,
      id: report.id,
      updatedAt: new Date().toISOString(),
    }
    this.reports.set(id, updatedReport)
    return updatedReport
  }

  delete(id: string): boolean {
    return this.reports.delete(id)
  }
}
