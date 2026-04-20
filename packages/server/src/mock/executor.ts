/**
 * Mock 任务执行器
 * 用于演示完整的任务执行流程
 */

import { chromium } from 'playwright'
import { logger } from '../utils/logger.js'

export interface MockTaskStep {
  id: string
  action: string
  params: any
  description: string
}

export interface MockTask {
  id: string
  name: string
  description: string
  script: string
  steps: MockTaskStep[]
  config: any
}

export class MockTaskExecutor {
  private browser: any = null
  private page: any = null
  private onProgress?: (step: number, total: number, message: string) => void
  private onComplete?: (result: any) => void
  private onError?: (error: Error) => void

  constructor(options?: {
    onProgress?: (step: number, total: number, message: string) => void
    onComplete?: (result: any) => void
    onError?: (error: Error) => void
  }) {
    this.onProgress = options?.onProgress
    this.onComplete = options?.onComplete
    this.onError = options?.onError
  }

  /**
   * 初始化浏览器
   */
  async init(): Promise<void> {
    logger.info('初始化浏览器...')
    this.browser = await chromium.launch({
      headless: false, // 显示浏览器窗口
      slowMo: 500, // 慢速模式，便于观察
    })
    this.page = await this.browser.newPage()
    logger.info('浏览器初始化完成')
  }

  /**
   * 执行任务
   */
  async executeTask(task: MockTask): Promise<any> {
    const startTime = Date.now()
    const results: any[] = []

    try {
      await this.init()

      this.onProgress?.(0, task.steps.length, '开始执行任务')

      for (let i = 0; i < task.steps.length; i++) {
        const step = task.steps[i]
        const stepStartTime = Date.now()

        this.onProgress?.(i + 1, task.steps.length, step.description)
        logger.taskProgress(task.id, i + 1, task.steps.length, step.description)

        try {
          const result = await this.executeStep(step)
          const stepDuration = Date.now() - stepStartTime

          results.push({
            stepId: step.id,
            action: step.action,
            status: 'success',
            duration: stepDuration,
            result,
          })

          logger.info(`步骤 ${i + 1} 完成 (耗时: ${stepDuration}ms)`)

          // 实时上报进度
          if (this.onProgress) {
            this.onProgress(i + 1, task.steps.length, `${step.description} - 完成`)
          }
        } catch (error) {
          const stepDuration = Date.now() - stepStartTime

          results.push({
            stepId: step.id,
            action: step.action,
            status: 'failed',
            duration: stepDuration,
            error: error instanceof Error ? error.message : String(error),
          })

          logger.error(`步骤 ${i + 1} 失败`, error as Error)
          throw error
        }
      }

      const totalDuration = Date.now() - startTime

      const finalResult = {
        taskId: task.id,
        status: 'completed',
        duration: totalDuration,
        steps: results,
        timestamp: Date.now(),
      }

      logger.taskComplete(task.id, totalDuration)
      this.onComplete?.(finalResult)

      return finalResult
    } catch (error) {
      const totalDuration = Date.now() - startTime

      const errorResult = {
        taskId: task.id,
        status: 'failed',
        duration: totalDuration,
        steps: results,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      }

      logger.taskFail(task.id, error as Error)
      this.onError?.(error as Error)

      throw error
    } finally {
      await this.cleanup()
    }
  }

  /**
   * 执行单个步骤
   */
  private async executeStep(step: MockTaskStep): Promise<any> {
    switch (step.action) {
      case 'navigate':
        return await this.navigate(step.params.url)

      case 'input':
        return await this.input(step.params.selector, step.params.value)

      case 'click':
        return await this.click(step.params.selector)

      case 'wait':
        return await this.wait(step.params.duration)

      default:
        throw new Error(`未知操作: ${step.action}`)
    }
  }

  /**
   * 导航到 URL
   */
  private async navigate(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'networkidle' })
    console.log(`   ✓ 已导航到: ${url}`)
  }

  /**
   * 输入文本
   */
  private async input(selector: string, value: string): Promise<void> {
    await this.page.waitForSelector(selector, { timeout: 5000 })
    await this.page.fill(selector, value)
    console.log(`   ✓ 已输入: "${value}"`)
  }

  /**
   * 点击元素
   */
  private async click(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { timeout: 5000 })
    await this.page.click(selector)
    console.log(`   ✓ 已点击: ${selector}`)
  }

  /**
   * 等待
   */
  private async wait(duration: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, duration))
    console.log(`   ✓ 已等待: ${duration}ms`)
  }

  /**
   * 清理资源
   */
  private async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      logger.info('浏览器已关闭')
    }
  }

  /**
   * 截图
   */
  async screenshot(filename?: string): Promise<Buffer> {
    if (!this.page) {
      throw new Error('页面未初始化')
    }

    const screenshot = await this.page.screenshot({
      path: filename,
      fullPage: true,
    })

    logger.info(`截图已保存${filename ? ': ' + filename : ''}`)
    return screenshot
  }
}
