/**
 * 报告存储 (内存存储，生产环境请使用真实数据库)
 */

// 本地类型定义（临时）
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped'

export interface StepResult {
  stepId: string
  action: string
  status: StepStatus
  duration: number
  screenshot?: string
  error?: string
  timestamp: number
}

export interface TaskResult {
  taskId: string
  status: TaskStatus
  duration: number
  steps: StepResult[]
  error?: string
  startedAt: number
  completedAt?: number
}

export interface Report extends TaskResult {
  id: string
  createdAt: number
}

export class ReportStore {
  private reports: Map<string, Report> = new Map()

  constructor() {
    // 内存存储
  }

  /**
   * 创建报告
   */
  create(result: TaskResult): string {
    const id = this.generateId()
    const now = Date.now()

    const report: Report = {
      ...result,
      id,
      createdAt: now,
    }

    this.reports.set(id, report)
    return id
  }

  /**
   * 获取报告
   */
  get(id: string): Report | undefined {
    return this.reports.get(id)
  }

  /**
   * 根据任务ID获取报告
   */
  getByTaskId(taskId: string): Report[] {
    return Array.from(this.reports.values())
      .filter((report) => report.taskId === taskId)
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * 获取所有报告
   */
  getAll(): Report[] {
    return Array.from(this.reports.values()).sort((a, b) => b.createdAt - a.createdAt)
  }

  private generateId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  close(): void {
    this.reports.clear()
  }
}
