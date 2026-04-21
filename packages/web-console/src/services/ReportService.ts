/**
 * @auto-test-agent/web-console
 *
 * 测试报告服务
 * 负责测试报告的生成、导出和管理
 *
 * 主要功能：
 * - 生成HTML报告
 * - 生成JSON报告
 * - 生成PDF报告
 * - 报告数据统计和分析
 */

// 定义任务执行结果类型（临时，直到shared包提供此类型）
interface TaskExecutionResult {
  taskId: string
  taskName: string
  status: string
  duration: number
  startTime: number
  endTime: number
  totalSteps: number
  totalRetries?: number
  clientInfo?: string
  browserInfo?: string
  performance?: {
    browserLaunchTime: number
    totalPageLoadTime: number
    totalActionTime: number
  }
  steps: any[]
}

/**
 * 测试报告接口
 */
export interface TestReport {
  reportId: string
  taskId: string
  taskName: string
  status: 'success' | 'failed' | 'partial'
  duration: number
  successRate: number
  totalRetries: number
  startTime: number
  endTime: number
  clientInfo: string
  browserInfo: string
  performance: {
    browserLaunchTime: number
    totalPageLoadTime: number
    totalActionTime: number
  }
  steps: ReportStep[]
  errors?: ReportError[]
  screenshots: string[]
}

/**
 * 报告步骤接口
 */
export interface ReportStep {
  stepId: string
  action: string
  description?: string
  status: 'success' | 'failed'
  duration: number
  retryCount?: number
  params?: any
  error?: string
  stack?: string
  screenshots?: Array<{
    label: string
    path: string
    timestamp: number
  }>
  logs?: Array<{
    timestamp: string
    level: string
    message: string
  }>
}

/**
 * 报告错误接口
 */
export interface ReportError {
  errorId: string
  type: string
  count: number
  message: string
  firstOccurrence: number
  solutions?: string[]
  affectedSteps: string[]
}

/**
 * 报告导出配置
 */
export interface ReportExportConfig {
  format: 'html' | 'json' | 'pdf'
  includeScreenshots: boolean
  includeLogs: boolean
  includePerformance: boolean
  template?: string
}

/**
 * 报告服务类
 */
export class ReportService {
  /**
   * 从任务执行结果生成测试报告
   */
  static generateReport(executionResult: TaskExecutionResult): TestReport {
    const steps = executionResult.steps.map(step => this.mapStepToReportStep(step))
    const errors = this.analyzeErrors(steps)
    const performance = this.calculatePerformance(executionResult)

    const successCount = steps.filter(s => s.status === 'success').length
    const successRate = executionResult.totalSteps > 0
      ? Math.round((successCount / executionResult.totalSteps) * 100)
      : 0

    return {
      reportId: `report_${executionResult.taskId}_${Date.now()}`,
      taskId: executionResult.taskId,
      taskName: executionResult.taskName,
      status: this.determineOverallStatus(successRate, executionResult.status),
      duration: executionResult.duration,
      successRate,
      totalRetries: executionResult.totalRetries || 0,
      startTime: executionResult.startTime,
      endTime: executionResult.endTime,
      clientInfo: executionResult.clientInfo || 'Unknown',
      browserInfo: executionResult.browserInfo || 'Unknown',
      performance,
      steps,
      errors: errors.length > 0 ? errors : undefined,
      screenshots: this.collectAllScreenshots(steps),
    }
  }

  /**
   * 映射步骤到报告步骤
   */
  private static mapStepToReportStep(step: any): ReportStep {
    return {
      stepId: step.stepId,
      action: step.action,
      description: step.description,
      status: step.status,
      duration: step.duration || 0,
      retryCount: step.retryCount,
      params: step.params,
      error: step.error,
      stack: step.stack,
      screenshots: step.screenshots?.map((s: any) => ({
        label: s.label || 'Screenshot',
        path: s.path,
        timestamp: s.timestamp || Date.now(),
      })),
      logs: step.logs?.map((log: any) => ({
        timestamp: log.timestamp || new Date().toISOString(),
        level: log.level || 'info',
        message: log.message,
      })),
    }
  }

  /**
   * 分析错误并分组
   */
  private static analyzeErrors(steps: ReportStep[]): ReportError[] {
    const errorMap = new Map<string, ReportError>()

    steps.forEach(step => {
      if (step.error) {
        const errorKey = step.error.split('\n')[0] // 使用错误消息的第一行作为键

        if (!errorMap.has(errorKey)) {
          errorMap.set(errorKey, {
            errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: this.classifyError(step.error),
            count: 0,
            message: step.error,
            firstOccurrence: step.duration,
            solutions: this.generateErrorSolutions(step.error),
            affectedSteps: [],
          })
        }

        const error = errorMap.get(errorKey)!
        error.count++
        error.affectedSteps.push(step.stepId)
      }
    })

    return Array.from(errorMap.values()).sort((a, b) => b.count - a.count)
  }

  /**
   * 错误分类
   */
  private static classifyError(error: string): string {
    const lowerError = error.toLowerCase()

    if (lowerError.includes('timeout') || lowerError.includes('not found')) {
      return 'ELEMENT_NOT_FOUND'
    } else if (lowerError.includes('network') || lowerError.includes('connection')) {
      return 'NETWORK_ERROR'
    } else if (lowerError.includes('permission') || lowerError.includes('auth')) {
      return 'PERMISSION_ERROR'
    } else if (lowerError.includes('javascript') || lowerError.includes('syntax')) {
      return 'JAVASCRIPT_ERROR'
    } else {
      return 'UNKNOWN_ERROR'
    }
  }

  /**
   * 生成错误解决方案
   */
  private static generateErrorSolutions(error: string): string[] {
    const lowerError = error.toLowerCase()

    if (lowerError.includes('timeout') || lowerError.includes('not found')) {
      return [
        '检查元素选择器是否正确',
        '增加等待时间，确保页面完全加载',
        '使用更稳定的定位策略（如data属性）',
        '检查元素是否在iframe中',
      ]
    } else if (lowerError.includes('network') || lowerError.includes('connection')) {
      return [
        '检查网络连接是否稳定',
        '验证目标URL是否可访问',
        '增加请求超时时间',
        '检查防火墙和代理设置',
      ]
    } else if (lowerError.includes('permission') || lowerError.includes('auth')) {
      return [
        '确保用户已正确登录',
        '检查页面权限设置',
        '验证用户权限是否足够',
        '检查会话是否过期',
      ]
    } else {
      return [
        '查看详细错误日志和堆栈跟踪',
        '尝试在开发者工具中重现问题',
        '联系技术支持获取帮助',
      ]
    }
  }

  /**
   * 计算性能数据
   */
  private static calculatePerformance(result: TaskExecutionResult): TestReport['performance'] {
    return {
      browserLaunchTime: result.performance?.browserLaunchTime || 0,
      totalPageLoadTime: result.performance?.totalPageLoadTime || 0,
      totalActionTime: result.performance?.totalActionTime || 0,
    }
  }

  /**
   * 确定整体状态
   */
  private static determineOverallStatus(successRate: number, taskStatus: string): 'success' | 'failed' | 'partial' {
    if (taskStatus === 'failed') return 'failed'
    if (successRate === 100) return 'success'
    if (successRate > 0) return 'partial'
    return 'failed'
  }

  /**
   * 收集所有截图路径
   */
  private static collectAllScreenshots(steps: ReportStep[]): string[] {
    const screenshots: string[] = []

    steps.forEach(step => {
      if (step.screenshots) {
        step.screenshots.forEach(screenshot => {
          screenshots.push(screenshot.path)
        })
      }
    })

    return screenshots
  }

  /**
   * 导出报告为JSON
   */
  static exportToJSON(report: TestReport, pretty: boolean = true): string {
    return JSON.stringify(report, null, pretty ? 2 : 0)
  }

  /**
   * 导出报告为HTML
   */
  static exportToHTML(report: TestReport): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>测试报告 - ${report.taskName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 30px;
        }
        .header {
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-weight: bold;
            color: white;
        }
        .status.success { background: #4caf50; }
        .status.failed { background: #f44336; }
        .status.partial { background: #ff9800; }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }
        .summary-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        .summary-value {
            font-size: 20px;
            font-weight: bold;
            color: #333;
        }
        .step {
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            margin-bottom: 10px;
            overflow: hidden;
        }
        .step.success { border-left: 4px solid #4caf50; }
        .step.failed { border-left: 4px solid #f44336; }
        .step-header {
            background: #f9f9f9;
            padding: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .error {
            background: #ffebee;
            color: #c62828;
            padding: 12px;
            border-radius: 4px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 测试报告</h1>
            <h2>${report.taskName}</h2>
            <p>任务ID: ${report.taskId}</p>
            <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
            <span class="status ${report.status}">${this.getStatusText(report.status)}</span>
        </div>

        <div class="summary">
            <div class="summary-card">
                <div class="summary-label">总耗时</div>
                <div class="summary-value">${this.formatDuration(report.duration)}</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">成功率</div>
                <div class="summary-value">${report.successRate}%</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">总步骤数</div>
                <div class="summary-value">${report.steps.length}</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">重试次数</div>
                <div class="summary-value">${report.totalRetries}</div>
            </div>
        </div>

        <h3>执行步骤</h3>
        ${report.steps.map((step, index) => `
            <div class="step ${step.status}">
                <div class="step-header">
                    <strong>${index + 1}. ${step.action}</strong>
                    <span>${step.duration}ms</span>
                </div>
                ${step.error ? `<div class="error">${step.error}</div>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`
  }

  /**
   * 导出报告为文本格式
   */
  static exportToText(report: TestReport): string {
    const lines: string[] = []

    lines.push('=' .repeat(60))
    lines.push('测试报告')
    lines.push('=' .repeat(60))
    lines.push(`任务名称: ${report.taskName}`)
    lines.push(`任务ID: ${report.taskId}`)
    lines.push(`执行状态: ${this.getStatusText(report.status)}`)
    lines.push(`总耗时: ${this.formatDuration(report.duration)}`)
    lines.push(`成功率: ${report.successRate}%`)
    lines.push(`开始时间: ${new Date(report.startTime).toLocaleString('zh-CN')}`)
    lines.push(`结束时间: ${new Date(report.endTime).toLocaleString('zh-CN')}`)
    lines.push('')

    lines.push('-'.repeat(60))
    lines.push('执行步骤')
    lines.push('-'.repeat(60))

    report.steps.forEach((step, index) => {
      lines.push(`${index + 1}. ${step.action}`)
      lines.push(`   状态: ${step.status}`)
      lines.push(`   耗时: ${step.duration}ms`)
      if (step.description) {
        lines.push(`   描述: ${step.description}`)
      }
      if (step.error) {
        lines.push(`   错误: ${step.error}`)
      }
      lines.push('')
    })

    if (report.errors && report.errors.length > 0) {
      lines.push('-'.repeat(60))
      lines.push('错误分析')
      lines.push('-'.repeat(60))
      report.errors.forEach(error => {
        lines.push(`类型: ${error.type}`)
        lines.push(`次数: ${error.count}`)
        lines.push(`消息: ${error.message}`)
        if (error.solutions) {
          lines.push('解决方案:')
          error.solutions.forEach(solution => {
            lines.push(`  - ${solution}`)
          })
        }
        lines.push('')
      })
    }

    return lines.join('\n')
  }

  /**
   * 下载报告文件
   */
  static downloadReport(report: TestReport, format: 'html' | 'json' | 'text' = 'html'): void {
    let content: string
    let mimeType: string
    let filename: string

    switch (format) {
      case 'json':
        content = this.exportToJSON(report)
        mimeType = 'application/json'
        filename = `${report.taskName}_report_${Date.now()}.json`
        break
      case 'text':
        content = this.exportToText(report)
        mimeType = 'text/plain'
        filename = `${report.taskName}_report_${Date.now()}.txt`
        break
      case 'html':
      default:
        content = this.exportToHTML(report)
        mimeType = 'text/html'
        filename = `${report.taskName}_report_${Date.now()}.html`
        break
    }

    // 创建下载链接
    if (typeof window !== 'undefined') {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  /**
   * 格式化持续时间
   */
  private static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    const minutes = Math.floor(ms / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(0)
    return `${minutes}m ${seconds}s`
  }

  /**
   * 获取状态文本
   */
  private static getStatusText(status: string): string {
    const texts: Record<string, string> = {
      success: '成功',
      failed: '失败',
      partial: '部分成功',
    }
    return texts[status] || '未知'
  }
}

export default ReportService
