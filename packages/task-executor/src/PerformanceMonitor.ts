/**
 * 性能监控器
 * 记录任务执行过程中的各项性能指标
 */

export interface PerformanceMetrics {
  browserLaunch: number
  pageLoad: number
  aiInference: number
  visualRender: number
  [key: string]: number
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    browserLaunch: 0,
    pageLoad: 0,
    aiInference: 0,
    visualRender: 0,
  }

  private marks: Map<string, number> = new Map()

  /**
   * 标记某个时间点
   */
  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * 计算两个标记之间的时间差
   */
  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark)
    if (!start) {
      throw new Error(`Mark "${startMark}" not found`)
    }

    const end = endMark ? this.marks.get(endMark) : performance.now()
    if (!end) {
      throw new Error(`Mark "${endMark}" not found`)
    }

    const duration = end - start
    this.metrics[name] = duration

    return duration
  }

  /**
   * 记录指标
   */
  setMetric(name: string, value: number): void {
    this.metrics[name] = value
  }

  /**
   * 获取指标
   */
  getMetric(name: string): number {
    return this.metrics[name] || 0
  }

  /**
   * 获取所有指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 生成性能报告
   */
  getReport(): {
    totalDuration: number
    breakdown: PerformanceMetrics
    bottlenecks: Array<{ name: string; duration: number; percentage: number }>
  } {
    const totalDuration = Object.values(this.metrics).reduce((sum, val) => sum + val, 0)

    // 找出性能瓶颈（超过阈值的步骤）
    const threshold = 10000 // 10秒
    const bottlenecks = Object.entries(this.metrics)
      .filter(([, duration]) => duration > threshold)
      .map(([name, duration]) => ({
        name,
        duration,
        percentage: (duration / totalDuration) * 100,
      }))
      .sort((a, b) => b.duration - a.duration)

    return {
      totalDuration,
      breakdown: this.metrics,
      bottlenecks,
    }
  }

  /**
   * 重置所有指标
   */
  reset(): void {
    this.metrics = {
      browserLaunch: 0,
      pageLoad: 0,
      aiInference: 0,
      visualRender: 0,
    }
    this.marks.clear()
  }

  /**
   * 格式化性能报告为可读文本
   */
  formatReport(): string {
    const report = this.getReport()
    const lines: string[] = []

    lines.push('=== 性能报告 ===')
    lines.push(`总耗时: ${this.formatDuration(report.totalDuration)}`)
    lines.push('')
    lines.push('详细指标:')

    for (const [name, duration] of Object.entries(report.breakdown)) {
      if (duration > 0) {
        const percentage = ((duration / report.totalDuration) * 100).toFixed(1)
        lines.push(`  ${name}: ${this.formatDuration(duration)} (${percentage}%)`)
      }
    }

    if (report.bottlenecks.length > 0) {
      lines.push('')
      lines.push('性能瓶颈 (超过10秒):')
      for (const bottleneck of report.bottlenecks) {
        lines.push(
          `  ⚠️  ${bottleneck.name}: ${this.formatDuration(bottleneck.duration)} (${bottleneck.percentage.toFixed(1)}%)`
        )
      }
    }

    return lines.join('\n')
  }

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
}
