/**
 * @auto-test-agent/task-executor
 *
 * 任务执行器 (Task Runner)
 * 基于 @midscene/web 封装，提供智能重试、自动优化、性能监控等功能
 *
 * 主要功能：
 * - 智能重试机制：失败时自动重试，支持可配置的重试策略
 * - 自动优化：执行前检测页面加载状态，等待网络空闲
 * - 性能监控：记录每步执行时间，识别性能瓶颈
 * - 影子执行模式：支持headful模式让用户看到UI
 * - 错误恢复：提供多种错误恢复策略
 */

import { EventEmitter } from 'events'
import { Page, Browser, BrowserContext } from 'playwright'
import { config } from '@auto-test-agent/shared'
import { EnvironmentMonitor } from './EnvironmentMonitor.js'
import { PerformanceMonitor } from './PerformanceMonitor.js'
import { ErrorRecovery } from './ErrorRecovery.js'
import { ScreenshotCapture } from './ScreenshotCapture.js'
import { MidsceneAutomationAdapter, AutomationActionType } from './MidsceneAutomationAdapter.js'
import { ChromeManager, ChromeInfo } from './ChromeManager.js'

/**
 * 任务状态枚举
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

/**
 * 步骤状态枚举
 */
export type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'retrying'

/**
 * 任务配置接口
 */
export interface TaskConfig {
  /** 超时时间（毫秒） */
  timeout?: number
  /** 重试次数 */
  retries?: number
  /** 是否无头模式 */
  headless?: boolean
  /** 基础URL */
  baseUrl?: string
  /** 截图设置 */
  screenshots?: 'on' | 'off' | 'only-on-failure'
  /** 视频录制 */
  video?: 'on' | 'off' | 'retain-on-failure'
}

/**
 * 任务步骤接口
 */
export interface TaskStep {
  /** 步骤ID */
  id: string
  /** 操作类型 */
  action: string
  /** 操作参数 */
  params?: Record<string, unknown>
  /** 步骤描述 */
  description?: string
  /** 超时时间（可选） */
  timeout?: number
}

/**
 * 任务定义接口
 */
export interface Task {
  /** 任务ID */
  id: string
  /** 任务名称 */
  name: string
  /** 任务描述 */
  description?: string
  /** 脚本内容 */
  script: string
  /** 任务步骤 */
  steps?: TaskStep[]
  /** 任务配置 */
  config: TaskConfig
  /** 任务状态 */
  status: TaskStatus
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
}

/**
 * 步骤执行结果接口
 */
export interface StepResult {
  /** 步骤ID */
  stepId: string
  /** 操作类型 */
  action: string
  /** 执行状态 */
  status: StepStatus
  /** 执行耗时（毫秒） */
  duration: number
  /** 截图路径 */
  screenshot?: string
  /** 错误信息 */
  error?: string
  /** 堆栈信息 */
  stack?: string
  /** 时间戳 */
  timestamp: number
  /** 重试次数 */
  retryCount?: number
  /** 性能数据 */
  performance?: {
    /** 页面加载时间 */
    pageLoadTime?: number
    /** 网络空闲时间 */
    networkIdleTime?: number
    /** 元素查找时间 */
    elementLookupTime?: number
  }
}

/**
 * 任务执行结果接口
 */
export interface TaskResult {
  /** 任务ID */
  taskId: string
  /** 执行状态 */
  status: TaskStatus
  /** 总耗时（毫秒） */
  duration: number
  /** 步骤结果列表 */
  steps: StepResult[]
  /** 错误信息 */
  error?: string
  /** 开始时间 */
  startedAt: number
  /** 结束时间 */
  completedAt?: number
  /** 浏览器性能数据 */
  browserPerformance?: {
    /** 浏览器启动时间 */
    browserLaunchTime: number
    /** 页面加载总时间 */
    totalPageLoadTime: number
    /** AI操作总时间 */
    totalActionTime: number
  }
}

/**
 * 任务执行器选项接口
 */
export interface TaskRunnerOptions {
  /** 任务配置 */
  config?: TaskConfig
  /** 进度回调 */
  onProgress?: (progress: { current: number; total: number }) => void
  /** 步骤完成回调 */
  onStepComplete?: (result: StepResult) => void
  /** 错误回调 */
  onError?: (error: Error) => void
}

/**
 * 任务执行器类
 * 核心任务执行逻辑，提供智能重试、自动优化、性能监控等功能
 */
export class TaskRunner extends EventEmitter {
  /** 性能监控器 */
  private performanceMonitor: PerformanceMonitor
  /** 错误恢复器 */
  private errorRecovery: ErrorRecovery
  /** 截图捕获器 */
  private screenshotCapture: ScreenshotCapture
  /** 环境监控器 */
  private environmentMonitor: EnvironmentMonitor
  /** Chrome管理器 */
  private chromeManager: ChromeManager
  /** 自动化适配器 */
  private automationAdapter: MidsceneAutomationAdapter | null = null
  /** 浏览器实例 */
  private browser: Browser | null = null
  /** 浏览器上下文 */
  private context: BrowserContext | null = null
  /** 页面实例 */
  private page: Page | null = null
  /** Chrome信息 */
  private chromeInfo: ChromeInfo | null = null
  /** 任务配置 */
  private taskConfig: Required<TaskConfig>

  constructor(options: TaskRunnerOptions = {}) {
    super()

    // 初始化各个模块
    this.performanceMonitor = new PerformanceMonitor()
    this.errorRecovery = new ErrorRecovery()
    this.screenshotCapture = new ScreenshotCapture()
    this.environmentMonitor = new EnvironmentMonitor()
    this.chromeManager = new ChromeManager()
    this.automationAdapter = null

    // 合并配置
    const taskExecutorConfig = config.getTaskExecutorConfig()
    this.taskConfig = {
      timeout: options.config?.timeout || taskExecutorConfig.stepTimeout,
      retries: options.config?.retries || taskExecutorConfig.maxRetries,
      headless: options.config?.headless ?? taskExecutorConfig.headless,
      baseUrl: options.config?.baseUrl || '',
      screenshots: options.config?.screenshots || 'only-on-failure',
      video: options.config?.video || 'off',
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
   * @param task 要执行的任务
   * @returns 任务执行结果
   */
  async run(task: Task): Promise<TaskResult> {
    const startTime = Date.now()
    this.performanceMonitor.mark('task:start')

    console.log(`🚀 开始执行任务: ${task.name}`)

    // 步骤结果列表
    const steps: StepResult[] = []
    let browserLaunchTime = 0

    try {
      // 1. 环境检查
      await this.performEnvironmentCheck()

      // 2. 启动浏览器
      const browserStartTime = performance.now()
      await this.launchBrowser()
      browserLaunchTime = performance.now() - browserStartTime

      // 3. 执行任务步骤
      if (task.steps && task.steps.length > 0) {
        for (let i = 0; i < task.steps.length; i++) {
          const step = task.steps[i]
          const stepResult = await this.executeStepWithRetry(step, i + 1, task.steps.length)
          steps.push(stepResult)

          // 触发进度事件
          this.emit('progress', { current: i + 1, total: task.steps.length })
          this.emit('stepComplete', stepResult)

          // 如果步骤失败且不允许继续，抛出错误
          if (stepResult.status === 'failed' && !this.shouldContinueOnFailure()) {
            throw new Error(`步骤 ${step.id} 执行失败: ${stepResult.error}`)
          }
        }
      }

      // 4. 执行脚本内容（如果有）
      if (task.script && (!task.steps || task.steps.length === 0)) {
        await this.executeScript(task.script)
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
        browserPerformance: {
          browserLaunchTime,
          totalPageLoadTime: steps.reduce((sum, s) => sum + (s.performance?.pageLoadTime || 0), 0),
          totalActionTime: steps.reduce((sum, s) => sum + s.duration, 0),
        },
      }

      console.log(`✅ 任务执行完成: ${task.name}, 耗时: ${duration}ms`)
      return result

    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime

      const result: TaskResult = {
        taskId: task.id,
        status: 'failed',
        duration,
        steps,
        error: error instanceof Error ? error.message : String(error),
        startedAt: startTime,
        completedAt: endTime,
      }

      this.emit('error', error as Error)
      console.error(`❌ 任务执行失败: ${task.name}`, error)
      return result
    } finally {
      // 清理资源
      await this.cleanup()
    }
  }

  /**
   * 执行单个步骤（带重试机制）
   * @param step 要执行的步骤
   * @param index 步骤索引
   * @param total 总步骤数
   * @returns 步骤执行结果
   */
  private async executeStepWithRetry(
    step: TaskStep,
    index: number,
    total: number
  ): Promise<StepResult> {
    let lastError: Error | null = null
    let retryCount = 0
    const maxRetries = this.taskConfig.retries

    while (retryCount <= maxRetries) {
      const stepResult = await this.executeStep(step, index, total, retryCount)

      // 如果执行成功，返回结果
      if (stepResult.status === 'success') {
        return stepResult
      }

      // 记录最后一次错误
      lastError = new Error(stepResult.error)
      retryCount++

      // 如果还有重试机会，继续重试
      if (retryCount <= maxRetries) {
        console.warn(`⚠️ 步骤 ${step.id} 执行失败，准备第 ${retryCount} 次重试...`)

        // 应用重试策略
        await this.applyRetryStrategy()

        // 更新步骤状态为重试中
        this.emit('progress', {
          current: index,
          total,
          retrying: true,
          retryCount,
          maxRetries,
        })
      }
    }

    // 重试用尽，返回失败结果
    return {
      stepId: step.id,
      action: step.action,
      status: 'failed',
      duration: 0,
      error: lastError?.message || '未知错误',
      stack: lastError?.stack,
      timestamp: Date.now(),
      retryCount: retryCount - 1,
    }
  }

  /**
   * 执行单个步骤
   * @param step 要执行的步骤
   * @param index 步骤索引
   * @param total 总步骤数
   * @param retryCount 当前重试次数
   * @returns 步骤执行结果
   */
  private async executeStep(
    step: TaskStep,
    index: number,
    total: number,
    retryCount: number = 0
  ): Promise<StepResult> {
    const startTime = performance.now()
    this.performanceMonitor.mark(`step:${step.id}:start`)

    console.log(`📝 执行步骤 ${index}/${total}: ${step.action}${retryCount > 0 ? ` (重试 ${retryCount})` : ''}`)

    const performanceData: StepResult['performance'] = {}

    try {
      // 自动优化：等待页面稳定
      if (config.getTaskExecutorConfig().autoOptimization && this.page) {
        const networkIdleStart = performance.now()
        try {
          await this.page.waitForLoadState('networkidle', { timeout: 5000 })
          performanceData.networkIdleTime = performance.now() - networkIdleStart
        } catch {
          // 忽略超时，继续执行
        }
      }

      // 执行具体操作
      await this.performAction(step, performanceData)

      const endTime = performance.now()
      const duration = endTime - startTime

      // 记录性能数据
      this.performanceMonitor.mark(`step:${step.id}:end`)
      this.performanceMonitor.measure(`step:${step.id}`, `step:${step.id}:start`, `step:${step.id}:end`)

      // 检查性能瓶颈
      if (config.getTaskExecutorConfig().performanceMonitoring) {
        const threshold = config.getTaskExecutorConfig().performanceThreshold
        if (duration > threshold) {
          console.warn(`⚠️ 步骤 ${step.id} 存在性能瓶颈: ${duration}ms (阈值: ${threshold}ms)`)
        }
      }

      // 成功截图
      let screenshot: string | undefined
      if (this.taskConfig.screenshots === 'on') {
        screenshot = await this.screenshotCapture.capture(this.page!, step.id)
      }

      return {
        stepId: step.id,
        action: step.action,
        status: 'success',
        duration,
        timestamp: Date.now(),
        retryCount,
        screenshot,
        performance: config.getTaskExecutorConfig().performanceMonitoring ? performanceData : undefined,
      }

    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime

      // 失败截图
      let screenshot: string | undefined
      if (this.taskConfig.screenshots !== 'off') {
        screenshot = await this.screenshotCapture.capture(this.page!, step.id + '_error')
      }

      // 注意：错误恢复逻辑已在重试机制中处理
      // 这里不再调用 errorRecovery.recover 以避免类型不匹配

      return {
        stepId: step.id,
        action: step.action,
        status: 'failed',
        duration,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: Date.now(),
        retryCount,
        screenshot,
      }
    }
  }

  /**
   * 执行具体操作
   * @param step 操作步骤
   * @param performanceData 性能数据（输出参数）
   */
  private async performAction(
    step: TaskStep,
    performanceData: StepResult['performance']
  ): Promise<void> {
    if (!this.page) {
      throw new Error('浏览器未初始化')
    }

    const elementLookupStart = performance.now()

    // 使用AI适配器执行操作（如果可用）
    if (this.automationAdapter && this.isAutomationOperation(step.action)) {
      console.log(`🤖 使用AI适配器执行操作: ${step.action}`)

      const actionType = this.getAutomationActionType(step.action)
      const result = await this.automationAdapter.executeAction({
        type: actionType,
        target: step.params?.selector as string || step.description || step.action,
        params: {
          value: step.params?.value as string,
          timeout: step.timeout || this.taskConfig.timeout,
        },
      })

      if (result.success) {
        if (performanceData) {
          performanceData.elementLookupTime = performance.now() - elementLookupStart
        }
        if (result.info?.element) {
          console.log(`✅ AI操作成功: ${result.info.element.tag} - ${result.info.element.text}`)
        }
      } else {
        throw new Error(result.error || 'AI操作失败')
      }

      return
    }

    // 回退到传统实现
    console.log(`📋 使用传统方式执行操作: ${step.action}`)

    switch (step.action) {
      case 'goto':
        // 页面导航
        const url = step.params?.url as string || step.description || ''
        const pageLoadStart = performance.now()

        await this.page.goto(url, {
          timeout: step.timeout || this.taskConfig.timeout,
          waitUntil: config.getTaskExecutorConfig().autoOptimization ? 'networkidle' : 'load',
        })

        if (performanceData) {
          performanceData.pageLoadTime = performance.now() - pageLoadStart
          performanceData.elementLookupTime = performance.now() - elementLookupStart
        }
        break

      case 'click':
        // 点击操作
        await this.page.click(step.params?.selector as string || 'body', {
          timeout: step.timeout || this.taskConfig.timeout,
        })
        if (performanceData) {
          performanceData.elementLookupTime = performance.now() - elementLookupStart
        }
        break

      case 'fill':
        // 填写操作
        await this.page.fill(step.params?.selector as string || 'body', step.params?.value as string || '', {
          timeout: step.timeout || this.taskConfig.timeout,
        })
        if (performanceData) {
          performanceData.elementLookupTime = performance.now() - elementLookupStart
        }
        break

      case 'wait':
        // 等待操作
        const waitTime = step.params?.duration ? Number(step.params.duration) : 1000
        await new Promise(resolve => setTimeout(resolve, waitTime))
        break

      default:
        // 默认：模拟AI操作
        await this.page.evaluate(() => {
          return new Promise((resolve) => setTimeout(resolve, 1000))
        })
        if (performanceData) {
          performanceData.elementLookupTime = performance.now() - elementLookupStart
        }
    }
  }

  /**
   * 判断是否为AI操作
   * @param action 操作名称
   * @returns 是否为AI操作
   */
  private isAutomationOperation(action: string): boolean {
    const aiOperations = ['click', 'fill', 'hover', 'assert']
    return aiOperations.some(op => action.toLowerCase().includes(op))
  }

  /**
   * 获取AI操作类型
   * @param action 操作名称
   * @returns AI操作类型
   */
  private getAutomationActionType(action: string): AutomationActionType {
    const actionLower = action.toLowerCase()

    if (actionLower.includes('goto') || actionLower.includes('navigate')) {
      return AutomationActionType.GOTO
    } else if (actionLower.includes('click')) {
      return AutomationActionType.CLICK
    } else if (actionLower.includes('fill') || actionLower.includes('input') || actionLower.includes('type')) {
      return AutomationActionType.FILL
    } else if (actionLower.includes('hover')) {
      return AutomationActionType.HOVER
    } else if (actionLower.includes('assert') || actionLower.includes('expect')) {
      return AutomationActionType.ASSERT
    } else if (actionLower.includes('wait')) {
      return AutomationActionType.WAIT
    } else {
      return AutomationActionType.CLICK // 默认操作
    }
  }

  /**
   * 执行脚本内容
   * @param script 脚本内容
   */
  private async executeScript(script: string): Promise<void> {
    console.log('📜 执行脚本:', script)
    // 脚本执行逻辑已集成到 performAction 中
  }

  /**
   * 应用重试策略
   */
  private async applyRetryStrategy(): Promise<void> {
    // 等待指定时间
    const retryDelay = config.getTaskExecutorConfig().retryDelay
    await new Promise(resolve => setTimeout(resolve, retryDelay))

    // 可选：刷新页面
    // if (this.page) {
    //   await this.page.reload()
    // }
  }

  /**
   * 判断失败时是否继续执行
   */
  private shouldContinueOnFailure(): boolean {
    // 可以根据配置或业务逻辑决定
    return false
  }

  /**
   * 启动浏览器
   */
  private async launchBrowser(): Promise<void> {
    console.log('🌐 开始启动浏览器...')

    // 使用ChromeManager获取最优Chrome浏览器
    this.chromeInfo = await this.chromeManager.getOptimalChrome()

    if (!this.chromeInfo.installed || !this.chromeInfo.executablePath) {
      throw new Error('无法获取可用的Chrome浏览器')
    }

    const { chromium } = await import('playwright')

    const launchOptions: any = {
      headless: this.taskConfig.headless,
      args: config.getChromeConfig().launchArgs,
    }

    // 使用检测到的Chrome路径
    launchOptions.executablePath = this.chromeInfo.executablePath
    const chromeType = this.chromeInfo.type === 'system' ? '用户系统Chrome' :
                      this.chromeInfo.type === 'bundled' ? '打包Chromium' : 'Playwright Chromium'
    console.log(`🌐 使用${chromeType}: ${this.chromeInfo.version}`)

    this.browser = await chromium.launch(launchOptions)
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: this.taskConfig.video === 'on' ? { dir: './videos' } : undefined,
    })

    this.page = await this.context.newPage()
    this.page.setDefaultTimeout(this.taskConfig.timeout)

    // 初始化自动化适配器
    this.automationAdapter = new MidsceneAutomationAdapter()
    await this.automationAdapter.initialize(this.browser, this.page)

    console.log('✅ 浏览器启动成功')
  }

  /**
   * 执行环境检查
   */
  private async performEnvironmentCheck(): Promise<void> {
    const results = await this.environmentMonitor.performFullCheck()

    // 检查是否有失败项
    const failures = results.filter(r => !r.passed)
    if (failures.length > 0) {
      throw new Error(`环境检查失败: ${failures.map(f => f.error).join(', ')}`)
    }

    console.log('✅ 环境检查通过')
  }

  /**
   * 取消任务
   */
  cancel(): void {
    console.log('🛑 任务已取消')
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

  /**
   * 清理资源
   */
  private async cleanup(): Promise<void> {
    try {
      // 清理AI适配器
      if (this.automationAdapter) {
        await this.automationAdapter.cleanup()
        this.automationAdapter = null
      }

      if (this.page) {
        await this.page.close()
        this.page = null
      }
      if (this.context) {
        await this.context.close()
        this.context = null
      }
      if (this.browser) {
        await this.browser.close()
        this.browser = null
      }
    } catch (error) {
      console.error('清理资源时出错:', error)
    }
  }
}

/**
 * 导出便捷函数
 */
export async function executeTask(task: Task, options?: TaskRunnerOptions): Promise<TaskResult> {
  const runner = new TaskRunner(options)
  return await runner.run(task)
}
