/**
 * 任务运行器
 * 核心任务执行逻辑
 */

import { EventEmitter } from 'events'
import { PerformanceMonitor } from './PerformanceMonitor.js'
import { ErrorRecovery } from './ErrorRecovery.js'
import { ScreenshotCapture } from './ScreenshotCapture.js'

// 本地类型定义（临时，等 shared 包正常工作后移除）
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped'

export interface TaskConfig {
  timeout?: number
  retries?: number
  headless?: boolean
}

export interface TaskStep {
  id: string
  action: string
  params?: Record<string, unknown>
  description?: string
}

export interface Task {
  id: string
  name: string
  description?: string
  script: string
  steps?: TaskStep[]
  config: TaskConfig
  status: TaskStatus
  createdAt: number
  updatedAt: number
}

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

export interface TaskRunnerOptions {
  config?: TaskConfig
  onProgress?: (progress: { current: number; total: number }) => void
  onStepComplete?: (result: StepResult) => void
  onError?: (error: Error) => void
}

export class TaskRunner extends EventEmitter {
  private performanceMonitor: PerformanceMonitor
  private errorRecovery: ErrorRecovery
  private screenshotCapture: ScreenshotCapture
  private config: Required<TaskConfig>

  constructor(options: TaskRunnerOptions = {}) {
    super()

    this.performanceMonitor = new PerformanceMonitor()
    this.errorRecovery = new ErrorRecovery()
    this.screenshotCapture = new ScreenshotCapture()

    this.config = {
      timeout: options.config?.timeout || 30000,
      retries: options.config?.retries || 3,
      headless: options.config?.headless ?? false,
    }

    // 绑定事件回调
    if (options.onProgress) {
      this.on('progress', options.onProgress)
    }
    if (options.onStepComplete) {
      this.on('stepComplete', options.onStepComplete)
    }
    if (options.onError) {
      this.on('error', options.onError)
    }
  }

  /**
   * 运行任务
   */
  async run(task: Task): Promise<TaskResult> {
    const startTime = Date.now()
    this.performanceMonitor.mark('task:start')

    console.log(`开始执行任务: ${task.name}`)

    try {
      // TODO: 实现实际的任务执行逻辑
      // 这里应该调用 @midscene/web 的 API

      const steps: StepResult[] = []

      // 模拟执行步骤
      if (task.steps) {
        for (let i = 0; i < task.steps.length; i++) {
          const step = task.steps[i]
          const stepResult = await this.executeStep(step, i + 1, task.steps.length)
          steps.push(stepResult)

          // 触发进度事件
          this.emit('progress', { current: i + 1, total: task.steps.length })
          this.emit('stepComplete', stepResult)
        }
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      this.performanceMonitor.mark('task:end')
      this.performanceMonitor.measure('totalDuration', 'task:start', 'task:end')

      const result: TaskResult = {
        taskId: task.id,
        status: 'completed',
        duration,
        steps,
        startedAt: startTime,
        completedAt: endTime,
      }

      console.log(`任务执行完成: ${task.name}, 耗时: ${duration}ms`)
      return result
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime

      const result: TaskResult = {
        taskId: task.id,
        status: 'failed',
        duration,
        steps: [],
        error: error instanceof Error ? error.message : String(error),
        startedAt: startTime,
        completedAt: endTime,
      }

      this.emit('error', error as Error)
      return result
    }
  }

  /**
   * 执行单个步骤
   */
  private async executeStep(
    step: { id: string; action: string; params?: Record<string, unknown> },
    index: number,
    total: number
  ): Promise<StepResult> {
    const startTime = performance.now()
    this.performanceMonitor.mark(`step:${step.id}:start`)

    console.log(`执行步骤 ${index}/${total}: ${step.action}`)

    try {
      // TODO: 实现实际的步骤执行逻辑
      // 这里应该调用 @midscene/web 的 API

      // 模拟执行时间
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

      const endTime = performance.now()
      const duration = endTime - startTime

      this.performanceMonitor.mark(`step:${step.id}:end`)
      this.performanceMonitor.measure(`step:${step.id}`, `step:${step.id}:start`, `step:${step.id}:end`)

      return {
        stepId: step.id,
        action: step.action,
        status: 'success',
        duration,
        timestamp: Date.now(),
      }
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime

      return {
        stepId: step.id,
        action: step.action,
        status: 'failed',
        duration,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      }
    }
  }

  /**
   * 取消任务
   */
  cancel(): void {
    console.log('任务已取消')
    this.emit('cancelled')
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport() {
    return this.performanceMonitor.getReport()
  }

  /**
   * 获取格式化的性能报告
   */
  getFormattedPerformanceReport(): string {
    return this.performanceMonitor.formatReport()
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.performanceMonitor.reset()
    this.screenshotCapture.clear()
    this.removeAllListeners()
  }
}
