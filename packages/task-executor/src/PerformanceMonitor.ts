/**
 * @auto-test-agent/task-executor
 *
 * 性能监控器 (Performance Monitor)
 * 使用 performance.now() 对关键环节进行详细测速，提供性能分析和瓶颈识别
 *
 * 主要功能：
 * - 浏览器启动耗时监控
 * - 页面加载耗时监控
 * - AI操作耗时监控
 * - 视觉渲染耗时监控
 * - 执行追踪和瓶颈识别
 * - 自动优化建议
 */

import { config } from '@auto-test-agent/shared'

/**
 * 性能指标类型
 */
export enum MetricType {
  /** 浏览器启动 */
  BROWSER_LAUNCH = 'browserLaunch',
  /** 页面加载 */
  PAGE_LOAD = 'pageLoad',
  /** AI推理 */
  AI_INFERENCE = 'aiInference',
  /** 视觉渲染 */
  VISUAL_RENDER = 'visualRender',
  /** 元素查找 */
  ELEMENT_LOOKUP = 'elementLookup',
  /** 网络请求 */
  NETWORK_REQUEST = 'networkRequest',
  /** DOM操作 */
  DOM_OPERATION = 'domOperation',
  /** 截图操作 */
  SCREENSHOT = 'screenshot',
}

/**
 * 性能标记点接口
 */
export interface PerformanceMark {
  /** 标记名称 */
  name: string
  /** 时间戳 */
  timestamp: number
  /** 标记描述 */
  description?: string
}

/**
 * 性能测量结果接口
 */
export interface PerformanceMeasure {
  /** 测量名称 */
  name: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 持续时间（毫秒） */
  duration: number
  /** 测量类型 */
  type?: MetricType
}

/**
 * 步骤执行追踪接口
 */
export interface StepTrace {
  /** 步骤ID */
  stepId: string
  /** 步骤名称 */
  stepName: string
  /** 执行状态 */
  status: 'success' | 'failed' | 'retrying'
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 持续时间 */
  duration: number
  /** 重试次数 */
  retryCount: number
  /** 错误信息 */
  error?: string
  /** 详细性能数据 */
  performance?: {
    /** 页面加载时间 */
    pageLoadTime?: number
    /** 网络空闲时间 */
    networkIdleTime?: number
    /** 元素查找时间 */
    elementLookupTime?: number
    /** AI操作时间 */
    aiInferenceTime?: number
  }
}

/**
 * 性能瓶颈分析结果接口
 */
export interface BottleneckAnalysis {
  /** 瓶颈名称 */
  name: string
  /** 持续时间 */
  duration: number
  /** 占总耗时百分比 */
  percentage: number
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high' | 'critical'
  /** 优化建议 */
  suggestions: string[]
}

/**
 * 性能报告接口
 */
export interface PerformanceReport {
  /** 总耗时 */
  totalDuration: number
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 详细指标分解 */
  breakdown: Record<string, number>
  /** 步骤执行追踪 */
  stepTraces: StepTrace[]
  /** 性能瓶颈分析 */
  bottlenecks: BottleneckAnalysis[]
  /** 优化建议 */
  recommendations: string[]
}

/**
 * 性能监控器类
 * 提供详细的性能监控和分析功能
 */
export class PerformanceMonitor {
  /** 性能标记点 */
  private marks: Map<string, PerformanceMark> = new Map()
  /** 性能测量结果 */
  private measures: Map<string, PerformanceMeasure> = new Map()
  /** 步骤执行追踪 */
  private stepTraces: StepTrace[] = []
  /** 任务开始时间 */
  private taskStartTime: number = 0
  /** 任务结束时间 */
  private taskEndTime: number = 0
  /** 是否启用监控 */
  private enabled: boolean

  constructor() {
    this.enabled = config.getTaskExecutorConfig().performanceMonitoring
  }

  /**
   * 标记某个时间点
   * @param name 标记名称
   * @param description 标记描述
   */
  mark(name: string, description?: string): void {
    if (!this.enabled) return

    const mark: PerformanceMark = {
      name,
      timestamp: performance.now(),
      description,
    }

    this.marks.set(name, mark)
    console.log(`📍 性能标记: ${name} (${description || ''})`)
  }

  /**
   * 计算两个标记之间的时间差
   * @param name 测量名称
   * @param startMark 开始标记
   * @param endMark 结束标记（可选，默认为当前时间）
   * @param type 测量类型（可选）
   * @returns 持续时间（毫秒）
   */
  measure(name: string, startMark: string, endMark?: string, type?: MetricType): number {
    if (!this.enabled) return 0

    const start = this.marks.get(startMark)
    if (!start) {
      console.warn(`⚠️ 开始标记 "${startMark}" 未找到`)
      return 0
    }

    const endTimestamp = endMark ? this.marks.get(endMark)?.timestamp : performance.now()
    if (endTimestamp === undefined) {
      console.warn(`⚠️ 结束标记 "${endMark}" 未找到`)
      return 0
    }

    const duration = endTimestamp - start.timestamp

    const measure: PerformanceMeasure = {
      name,
      startTime: start.timestamp,
      endTime: endTimestamp,
      duration,
      type,
    }

    this.measures.set(name, measure)
    console.log(`⏱️  性能测量: ${name} = ${this.formatDuration(duration)}`)

    return duration
  }

  /**
   * 记录指标（直接设置数值）
   * @param name 指标名称
   * @param value 指标值
   */
  setMetric(name: string, value: number): void {
    if (!this.enabled) return

    this.measures.set(name, {
      name,
      startTime: 0,
      endTime: 0,
      duration: value,
    })
  }

  /**
   * 获取指标
   * @param name 指标名称
   * @returns 指标值
   */
  getMetric(name: string): number {
    const measure = this.measures.get(name)
    return measure ? measure.duration : 0
  }

  /**
   * 获取所有指标
   * @returns 所有指标的键值对
   */
  getAllMetrics(): Record<string, number> {
    const metrics: Record<string, number> = {}
    this.measures.forEach((measure, name) => {
      metrics[name] = measure.duration
    })
    return metrics
  }

  /**
   * 开始任务监控
   */
  startTask(): void {
    if (!this.enabled) return

    this.taskStartTime = performance.now()
    this.mark('task:start', '任务开始')
    console.log('🚀 开始性能监控')
  }

  /**
   * 结束任务监控
   */
  endTask(): void {
    if (!this.enabled) return

    this.taskEndTime = performance.now()
    this.mark('task:end', '任务结束')
    this.measure('totalDuration', 'task:start', 'task:end')
    console.log('🏁 结束性能监控')
  }

  /**
   * 追踪步骤执行
   * @param stepId 步骤ID
   * @param stepName 步骤名称
   * @param status 执行状态
   * @param retryCount 重试次数
   * @param performance 详细性能数据
   */
  traceStep(
    stepId: string,
    stepName: string,
    status: 'success' | 'failed' | 'retrying',
    retryCount: number = 0,
    performance?: StepTrace['performance']
  ): void {
    if (!this.enabled) return

    const startMark = `step:${stepId}:start`
    const endMark = `step:${stepId}:end`

    const start = this.marks.get(startMark)
    const end = this.marks.get(endMark)

    if (start && end) {
      const trace: StepTrace = {
        stepId,
        stepName,
        status,
        startTime: start.timestamp,
        endTime: end.timestamp,
        duration: end.timestamp - start.timestamp,
        retryCount,
        performance,
      }

      this.stepTraces.push(trace)
      console.log(`📊 步骤追踪: ${stepName} - ${this.formatDuration(trace.duration)}`)
    }
  }

  /**
   * 分析性能瓶颈
   * @param threshold 瓶颈阈值（毫秒），默认使用配置值
   * @returns 瓶颈分析结果
   */
  analyzeBottlenecks(threshold?: number): BottleneckAnalysis[] {
    if (!this.enabled) return []

    const bottleneckThreshold = threshold || config.getTaskExecutorConfig().performanceThreshold
    const bottlenecks: BottleneckAnalysis[] = []

    // 分析测量结果中的瓶颈
    this.measures.forEach((measure) => {
      if (measure.duration > bottleneckThreshold) {
        const totalDuration = this.taskEndTime - this.taskStartTime
        const percentage = (measure.duration / totalDuration) * 100

        bottlenecks.push({
          name: measure.name,
          duration: measure.duration,
          percentage,
          severity: this.getBottleneckSeverity(measure.duration, bottleneckThreshold),
          suggestions: this.getOptimizationSuggestions(measure.name, measure.duration),
        })
      }
    })

    // 分析步骤追踪中的瓶颈
    this.stepTraces.forEach((trace) => {
      if (trace.duration > bottleneckThreshold) {
        const totalDuration = this.taskEndTime - this.taskStartTime
        const percentage = (trace.duration / totalDuration) * 100

        bottlenecks.push({
          name: `步骤: ${trace.stepName}`,
          duration: trace.duration,
          percentage,
          severity: this.getBottleneckSeverity(trace.duration, bottleneckThreshold),
          suggestions: this.getStepOptimizationSuggestions(trace),
        })
      }
    })

    // 按持续时间降序排序
    return bottlenecks.sort((a, b) => b.duration - a.duration)
  }

  /**
   * 生成完整的性能报告
   * @returns 性能报告
   */
  getReport(): PerformanceReport {
    if (!this.enabled) {
      return {
        totalDuration: 0,
        startTime: 0,
        endTime: 0,
        breakdown: {},
        stepTraces: [],
        bottlenecks: [],
        recommendations: [],
      }
    }

    const totalDuration = this.taskEndTime - this.taskStartTime
    const breakdown = this.getAllMetrics()
    const bottlenecks = this.analyzeBottlenecks()
    const recommendations = this.generateRecommendations(bottlenecks)

    return {
      totalDuration,
      startTime: this.taskStartTime,
      endTime: this.taskEndTime,
      breakdown,
      stepTraces: [...this.stepTraces],
      bottlenecks,
      recommendations,
    }
  }

  /**
   * 格式化性能报告为可读文本
   * @returns 格式化的报告文本
   */
  formatReport(): string {
    const report = this.getReport()
    const lines: string[] = []

    lines.push('╔════════════════════════════════════════════════════════════╗')
    lines.push('║                    性 能 监 控 报 告                        ║')
    lines.push('╚════════════════════════════════════════════════════════════╝')
    lines.push('')
    lines.push(`📊 总耗时: ${this.formatDuration(report.totalDuration)}`)
    lines.push(`🕐 开始时间: ${new Date(report.startTime).toLocaleTimeString()}`)
    lines.push(`🕐 结束时间: ${new Date(report.endTime).toLocaleTimeString()}`)
    lines.push('')

    // 详细指标
    lines.push('📈 详细指标:')
    for (const [name, duration] of Object.entries(report.breakdown)) {
      if (duration > 0) {
        const percentage = ((duration / report.totalDuration) * 100).toFixed(1)
        lines.push(`  • ${name}: ${this.formatDuration(duration)} (${percentage}%)`)
      }
    }
    lines.push('')

    // 步骤追踪
    if (report.stepTraces.length > 0) {
      lines.push('📝 步骤执行追踪:')
      report.stepTraces.forEach((trace, index) => {
        const statusIcon = trace.status === 'success' ? '✅' : trace.status === 'failed' ? '❌' : '🔄'
        const retryInfo = trace.retryCount > 0 ? ` (重试 ${trace.retryCount} 次)` : ''
        lines.push(
          `  ${index + 1}. ${statusIcon} ${trace.stepName}${retryInfo}: ${this.formatDuration(trace.duration)}`
        )

        if (trace.performance) {
          const perfDetails: string[] = []
          if (trace.performance.pageLoadTime) {
            perfDetails.push(`页面加载: ${this.formatDuration(trace.performance.pageLoadTime)}`)
          }
          if (trace.performance.networkIdleTime) {
            perfDetails.push(`网络空闲: ${this.formatDuration(trace.performance.networkIdleTime)}`)
          }
          if (trace.performance.elementLookupTime) {
            perfDetails.push(`元素查找: ${this.formatDuration(trace.performance.elementLookupTime)}`)
          }
          if (perfDetails.length > 0) {
            lines.push(`     └─ ${perfDetails.join(', ')}`)
          }
        }
      })
      lines.push('')
    }

    // 性能瓶颈
    if (report.bottlenecks.length > 0) {
      lines.push('⚠️  性能瓶颈分析:')
      report.bottlenecks.forEach((bottleneck, index) => {
        const severityIcon = this.getSeverityIcon(bottleneck.severity)
        lines.push(
          `  ${index + 1}. ${severityIcon} ${bottleneck.name}: ${this.formatDuration(bottleneck.duration)} (${bottleneck.percentage.toFixed(1)}%)`
        )

        if (bottleneck.suggestions.length > 0) {
          bottleneck.suggestions.forEach((suggestion) => {
            lines.push(`     💡 ${suggestion}`)
          })
        }
      })
      lines.push('')
    }

    // 优化建议
    if (report.recommendations.length > 0) {
      lines.push('💬 优化建议:')
      report.recommendations.forEach((recommendation, index) => {
        lines.push(`  ${index + 1}. ${recommendation}`)
      })
    }

    return lines.join('\n')
  }

  /**
   * 重置所有监控数据
   */
  reset(): void {
    this.marks.clear()
    this.measures.clear()
    this.stepTraces = []
    this.taskStartTime = 0
    this.taskEndTime = 0
    console.log('🔄 性能监控数据已重置')
  }

  /**
   * 获取瓶颈严重程度
   * @param duration 持续时间
   * @param threshold 阈值
   * @returns 严重程度
   */
  private getBottleneckSeverity(duration: number, threshold: number): BottleneckAnalysis['severity'] {
    if (duration > threshold * 3) return 'critical'
    if (duration > threshold * 2) return 'high'
    if (duration > threshold * 1.5) return 'medium'
    return 'low'
  }

  /**
   * 获取严重程度图标
   * @param severity 严重程度
   * @returns 图标
   */
  private getSeverityIcon(severity: BottleneckAnalysis['severity']): string {
    switch (severity) {
      case 'critical':
        return '🔴'
      case 'high':
        return '🟠'
      case 'medium':
        return '🟡'
      case 'low':
        return '🟢'
    }
  }

  /**
   * 获取优化建议
   * @param name 指标名称
   * @param duration 持续时间
   * @returns 优化建议列表
   */
  private getOptimizationSuggestions(name: string, duration: number): string[] {
    const suggestions: string[] = []

    switch (name) {
      case MetricType.PAGE_LOAD:
        suggestions.push('检查网络连接速度')
        suggestions.push('优化页面资源加载')
        suggestions.push('考虑使用CDN加速')
        break

      case MetricType.AI_INFERENCE:
        suggestions.push('检查AI模型性能')
        suggestions.push('优化提示词质量')
        suggestions.push('考虑使用更快的硬件')
        break

      case MetricType.ELEMENT_LOOKUP:
        suggestions.push('优化元素选择器')
        suggestions.push('增加等待时间')
        suggestions.push('使用更稳定的定位策略')
        break

      default:
        suggestions.push('分析具体执行逻辑')
        suggestions.push('检查是否有不必要的等待')
        suggestions.push('考虑并行执行独立操作')
    }

    return suggestions
  }

  /**
   * 获取步骤优化建议
   * @param trace 步骤追踪信息
   * @returns 优化建议列表
   */
  private getStepOptimizationSuggestions(trace: StepTrace): string[] {
    const suggestions: string[] = []

    if (trace.retryCount > 0) {
      suggestions.push(`步骤已重试 ${trace.retryCount} 次，建议检查失败原因`)
    }

    if (trace.performance?.pageLoadTime && trace.performance.pageLoadTime > 5000) {
      suggestions.push('页面加载时间较长，建议检查网络或页面优化')
    }

    if (trace.performance?.elementLookupTime && trace.performance.elementLookupTime > 3000) {
      suggestions.push('元素查找时间较长，建议优化选择器策略')
    }

    if (trace.status === 'failed') {
      suggestions.push('步骤执行失败，建议检查错误日志并修复问题')
    }

    return suggestions
  }

  /**
   * 生成优化建议
   * @param bottlenecks 瓶颈分析结果
   * @returns 优化建议列表
   */
  private generateRecommendations(bottlenecks: BottleneckAnalysis[]): string[] {
    const recommendations: string[] = []

    if (bottlenecks.length === 0) {
      recommendations.push('当前性能表现良好，继续保持！')
      return recommendations
    }

    // 统计关键瓶颈
    const criticalCount = bottlenecks.filter(b => b.severity === 'critical').length
    const highCount = bottlenecks.filter(b => b.severity === 'high').length

    if (criticalCount > 0) {
      recommendations.push(`发现 ${criticalCount} 个严重性能瓶颈，建议优先处理`)
    }

    if (highCount > 0) {
      recommendations.push(`发现 ${highCount} 个高级性能瓶颈，建议尽快优化`)
    }

    // 分析最常见的瓶颈类型
    const pageLoadBottlenecks = bottlenecks.filter(b => b.name.includes('页面') || b.name.includes('加载'))
    const aiBottlenecks = bottlenecks.filter(b => b.name.includes('AI') || b.name.includes('推理'))

    if (pageLoadBottlenecks.length >= 2) {
      recommendations.push('多个页面加载环节存在瓶颈，建议检查网络环境或页面性能')
    }

    if (aiBottlenecks.length >= 2) {
      recommendations.push('多个AI操作存在瓶颈，建议优化AI模型或提示词')
    }

    return recommendations
  }

  /**
   * 格式化时间长度
   * @param ms 毫秒数
   * @returns 格式化的时间字符串
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`
    } else {
      const minutes = Math.floor(ms / 60000)
      const seconds = ((ms % 60000) / 1000).toFixed(0)
      return `${minutes}m ${seconds}s`
    }
  }

  /**
   * 启用或禁用性能监控
   * @param enabled 是否启用
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    console.log(`${enabled ? '✅' : '❌'} 性能监控已${enabled ? '启用' : '禁用'}`)
  }

  /**
   * 检查是否启用
   * @returns 是否启用
   */
  isEnabled(): boolean {
    return this.enabled
  }
}
