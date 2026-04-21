/**
 * @auto-test-agent/task-executor
 *
 * @midscene/web 自动化适配器
 * 浏览器自动化脚本执行引擎
 *
 * 主要功能：
 * - 元素定位和操作
 * - 页面导航和交互
 * - 断言和验证
 * - 视觉证据收集
 * - 自动重试和恢复
 */

import { Page, Browser } from 'playwright'
import { config } from '@auto-test-agent/shared'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
// @ts-ignore - @midscene/web types may not be available
import { midscene } from '@midscene/web'
import { ScreenshotCapture } from './ScreenshotCapture.js'

/**
 * 基本的HTML元素接口
 */
interface BasicHTMLElement {
  tagName: string
  textContent: string | null
}

/**
 * 自动化操作类型枚举
 */
export enum AutomationActionType {
  /** 导航到URL */
  GOTO = 'goto',
  /** 点击元素 */
  CLICK = 'click',
  /** 填写输入框 */
  FILL = 'fill',
  /** 悬停 */
  HOVER = 'hover',
  /** 选择选项 */
  SELECT = 'select',
  /** 上传文件 */
  UPLOAD = 'upload',
  /** 断言验证 */
  ASSERT = 'assert',
  /** 等待元素 */
  WAIT = 'wait',
  /** 滚动页面 */
  SCROLL = 'scroll',
}

/**
 * AI 操作参数接口
 */
export interface AutomationActionParams {
  /** 操作类型 */
  type: AutomationActionType
  /** 自然语言描述或选择器 */
  target: string
  /** 操作参数 */
  params?: {
    /** 值（用于填写操作） */
    value?: string
    /** 选项（用于选择操作） */
    option?: string
    /** 文件路径（用于上传操作） */
    filePath?: string
    /** 超时时间 */
    timeout?: number
    /** 等待选项 */
    waitFor?: 'loadstate' | 'networkidle' | 'selector'
  }
}

/**
 * 自动化操作结果接口
 */
export interface AutomationActionResult {
  /** 操作是否成功 */
  success: boolean
  /** 执行耗时（毫秒） */
  duration: number
  /** 错误信息 */
  error?: string
  /** 额外信息 */
  info?: {
    /** 执行方法 */
    method?: string
    /** 操作类型 */
    action?: string
    /** 目标元素 */
    target?: string
    /** 填写值（仅填写操作） */
    value?: string
    /** 找到的元素信息 */
    element?: {
      tag: string
      text: string
      selector: string
    }
    /** 页面状态 */
    pageState?: {
      url: string
      title: string
    }
    /** 截图信息 */
    screenshots?: {
      before?: string | null
      after?: string | null
      error?: string | null
    }
  }
}

/**
 * @midscene/web 自动化适配器类
 * 提供浏览器自动化脚本执行能力
 */
export class MidsceneAutomationAdapter {
  private page: Page | null = null
  private browser: Browser | null = null
  private context: any = null
  private isInitialized = false
  private videoPath: string | null = null
  private screenshotDir: string = './screenshots'
  private screenshotCapture: ScreenshotCapture = new ScreenshotCapture()

  /**
   * 初始化自动化适配器
   * @param browser Playwright浏览器实例
   * @param page Playwright页面实例
   */
  async initialize(browser: Browser, page: Page): Promise<void> {
    this.browser = browser
    this.page = page
    this.isInitialized = true
    this.screenshotCapture = new ScreenshotCapture(this.screenshotDir)

    // 设置视频录制
    try {
      const videoDir = './videos'
      if (!existsSync(videoDir)) {
        await mkdir(videoDir, { recursive: true })
      }

      // 获取browser context以设置视频录制
      // 注意：这需要在创建context时设置，这里只是记录视频目录
      this.videoPath = join(videoDir, `recording_${Date.now()}.webm`)

      console.log('🎥 视频录制已配置')
    } catch (error) {
      console.warn(`⚠️ 视频录制配置失败: ${error}`)
    }

    // 尝试初始化@midscene/web
    try {
      // @ts-ignore - @midscene/web API
      if (typeof midscene !== 'undefined') {
        // @ts-ignore
        await midscene.init(page, {
          testId: 'auto-test-agent',
          verbose: true,
        })
        console.log('🔧 @midscene/web 初始化成功')
      }
    } catch (error) {
      console.warn('⚠️ @midscene/web 初始化失败，将使用基础Playwright API:', error)
    }

    console.log('🔧 自动化适配器初始化完成')
  }

  /**
   * 执行自动化操作
   * @param action 自动化操作定义
   * @returns 操作结果
   */
  async executeAction(action: AutomationActionParams): Promise<AutomationActionResult> {
    if (!this.isInitialized || !this.page) {
      throw new Error('自动化适配器未初始化')
    }

    console.log(`🔧 执行自动化操作: ${action.type} - ${action.target}`)

    const startTime = performance.now()
    let beforeScreenshot: string | null = null

    try {
      let result: AutomationActionResult

      // 操作前截图
      beforeScreenshot = await this.captureScreenshot(`before_${action.type}_${Date.now()}`)

      switch (action.type) {
        case AutomationActionType.GOTO:
          result = await this.performGoto(action)
          break
        case AutomationActionType.CLICK:
          result = await this.performClick(action)
          break
        case AutomationActionType.FILL:
          result = await this.performFill(action)
          break
        case AutomationActionType.HOVER:
          result = await this.performHover(action)
          break
        case AutomationActionType.ASSERT:
          result = await this.performAssert(action)
          break
        case AutomationActionType.WAIT:
          result = await this.performWait(action)
          break
        default:
          throw new Error(`不支持的操作类型: ${action.type}`)
      }

      result.duration = performance.now() - startTime

      // 操作后截图
      const afterScreenshot = await this.captureScreenshot(`after_${action.type}_${Date.now()}`)

      console.log(`✅ 自动化操作完成: ${action.type} (耗时: ${result.duration.toFixed(2)}ms)`)

      // 添加截图信息到结果
      if (!result.info) {
        result.info = {}
      }
      result.info.screenshots = {
        before: beforeScreenshot,
        after: afterScreenshot,
      }

      return result

    } catch (error) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      // 错误时截图
      const errorScreenshot = await this.captureScreenshot(`error_${action.type}_${Date.now()}`)

      console.error(`❌ 自动化操作失败: ${action.type} - ${errorMessage}`)

      return {
        success: false,
        duration,
        error: errorMessage,
        info: {
          screenshots: {
            before: beforeScreenshot,
            error: errorScreenshot,
          },
        },
      }
    }
  }

  /**
   * 执行页面导航
   * @param action 导航操作
   * @returns 操作结果
   */
  private async performGoto(action: AutomationActionParams): Promise<AutomationActionResult> {
    if (!this.page) throw new Error('页面未初始化')

    const url = action.target
    const timeout = action.params?.timeout || config.getTaskExecutorConfig().stepTimeout

    await this.page.goto(url, {
      timeout,
      waitUntil: config.getTaskExecutorConfig().autoOptimization ? 'networkidle' : 'load',
    })

    return {
      success: true,
      duration: 0,
      info: {
        pageState: {
          url: this.page.url(),
          title: await this.page.title(),
        },
      },
    }
  }

  /**
   * 执行点击操作（带红框标记）
   * @param action 点击操作
   * @returns 操作结果
   */
  private async performClick(action: AutomationActionParams): Promise<AutomationActionResult> {
    if (!this.page) throw new Error('页面未初始化')

    const target = action.target
    const timeout = action.params?.timeout || config.getTaskExecutorConfig().stepTimeout

    try {
      // 操作前截图 - 带红框标记目标元素
      await this.screenshotCapture.capture(this.page, `before_click_${Date.now()}`, {
        highlightSelector: target,
        highlightStyle: 'red-border'
      })

      // 尝试使用 @midscene/web 的自动化能力（如果可用）
      // 如果不可用，则回退到传统选择器

      // 首先尝试作为选择器
      await this.page.click(target, { timeout })

      // 操作后截图 - 带发光效果标记
      await this.screenshotCapture.capture(this.page, `after_click_${Date.now()}`, {
        highlightSelector: target,
        highlightStyle: 'glow'
      })

      // 获取元素信息
      const element = await this.page.$(target)
      const elementInfo = element ? {
        tag: await element.evaluate(el => el.tagName),
        text: await element.evaluate(el => el.textContent?.trim() || ''),
        selector: target,
      } : undefined

      return {
        success: true,
        duration: 0,
        info: { element: elementInfo }
      }

    } catch (error) {
      // 如果传统选择器失败，尝试元素查找
      if (this.isElementLookupAvailable()) {
        return await this.performElementLookupClick(action)
      } else {
        throw error
      }
    }
  }

  /**
   * 执行元素查找的点击操作（使用@midscene/web）
   * @param action 点击操作
   * @returns 操作结果
   */
  private async performElementLookupClick(action: AutomationActionParams): Promise<AutomationActionResult> {
    if (!this.page) throw new Error('页面未初始化')

    console.log(`🔍 使用@midscene/web查找并点击: ${action.target}`)

    try {
      // @ts-ignore - @midscene/web API
      if (typeof midscene !== 'undefined' && midscene.click) {
        const startTime = performance.now()

        // 使用@midscene/web的真实元素定位和点击
        // @ts-ignore
        await midscene.click(action.target, {
          timeout: action.params?.timeout || config.getTaskExecutorConfig().stepTimeout,
        })

        const duration = performance.now() - startTime

        return {
          success: true,
          duration,
          info: {
            method: '@midscene/web',
            action: 'click',
            target: action.target,
          },
        }
      } else {
        // 降级到传统方法
        console.warn('⚠️ @midscene/web不可用，使用传统方法')
        return await this.performTraditionalClick(action)
      }
    } catch (error) {
      console.error(`❌ @midscene/web点击失败: ${error}`)
      throw error
    }
  }

  /**
   * 传统点击操作（降级方法）
   * @param action 点击操作
   * @returns 操作结果
   */
  private async performTraditionalClick(action: AutomationActionParams): Promise<AutomationActionResult> {
    if (!this.page) throw new Error('页面未初始化')

    console.log('📋 使用传统Playwright方法点击')

    // 尝试通过文本内容查找
    const elements = await this.page.$$('*')
    let targetElement: any = null

    for (const element of elements) {
      const text = await element.evaluate(el => el.textContent?.trim() || '')
      if (text.includes(action.target) || text.toLowerCase().includes(action.target.toLowerCase())) {
        targetElement = element
        break
      }
    }

    if (!targetElement) {
      throw new Error(`无法找到匹配"${action.target}"的元素`)
    }

    await targetElement.click()

    const elementInfo = {
      tag: await targetElement.evaluate((el: BasicHTMLElement) => el.tagName),
      text: await targetElement.evaluate((el: BasicHTMLElement) => el.textContent?.trim() || ''),
      selector: 'traditional-locator',
    }

    return {
      success: true,
      duration: 0,
      info: { element: elementInfo },
    }
  }

  /**
   * 执行填写操作
   * @param action 填写操作
   * @returns 操作结果
   */
  private async performFill(action: AutomationActionParams): Promise<AutomationActionResult> {
    if (!this.page) throw new Error('页面未初始化')

    const selector = action.target
    const value = action.params?.value || ''
    const timeout = action.params?.timeout || config.getTaskExecutorConfig().stepTimeout

    try {
      // 清空输入框
      await this.page.fill(selector, value, { timeout })

      return {
        success: true,
        duration: 0,
        info: {
          element: {
            tag: 'input',
            text: value,
            selector,
          },
        },
      }

    } catch (error) {
      // 如果失败，尝试元素查找
      if (this.isElementLookupAvailable()) {
        return await this.performElementLookupFill(action)
      } else {
        throw error
      }
    }
  }

  /**
   * 执行元素查找的填写操作（使用@midscene/web）
   * @param action 填写操作
   * @returns 操作结果
   */
  private async performElementLookupFill(action: AutomationActionParams): Promise<AutomationActionResult> {
    if (!this.page) throw new Error('页面未初始化')

    const value = action.params?.value || ''
    console.log(`🔍 使用@midscene/web查找并填写: ${action.target} = ${value}`)

    try {
      // @ts-ignore - @midscene/web API
      if (typeof midscene !== 'undefined' && midscene.fill) {
        const startTime = performance.now()

        // 使用@midscene/web的真实元素定位和填写
        // @ts-ignore
        await midscene.fill(action.target, value, {
          timeout: action.params?.timeout || config.getTaskExecutorConfig().stepTimeout,
        })

        const duration = performance.now() - startTime

        return {
          success: true,
          duration,
          info: {
            method: '@midscene/web',
            action: 'fill',
            target: action.target,
            value,
          },
        }
      } else {
        // 降级到传统方法
        console.warn('⚠️ @midscene/web不可用，使用传统方法')
        return await this.performTraditionalFill(action)
      }
    } catch (error) {
      console.error(`❌ @midscene/web填写失败: ${error}`)
      throw error
    }
  }

  /**
   * 传统填写操作（降级方法）
   * @param action 填写操作
   * @returns 操作结果
   */
  private async performTraditionalFill(action: AutomationActionParams): Promise<AutomationActionResult> {
    if (!this.page) throw new Error('页面未初始化')

    console.log('📋 使用传统Playwright方法填写')

    const value = action.params?.value || ''

    // 查找包含目标描述的输入框
    const inputs = await this.page.$$('input, textarea')
    let targetInput: any = null

    for (const input of inputs) {
      const placeholder = await input.evaluate((el: Element) => {
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          return el.placeholder || ''
        }
        return ''
      })
      const label = await input.evaluate((el: Element) => {
        const parent = el.closest('label')
        return parent?.textContent?.trim() || ''
      })

      if (placeholder.includes(action.target) ||
          label.includes(action.target) ||
          action.target.includes(placeholder) ||
          action.target.includes(label)) {
        targetInput = input
        break
      }
    }

    if (!targetInput) {
      throw new Error(`无法找到匹配"${action.target}"的输入框`)
    }

    await targetInput.fill(value)

    return {
      success: true,
      duration: 0,
      info: {
        element: {
          tag: 'input',
          text: value,
          selector: 'traditional-locator',
        },
      },
    }
  }

  /**
   * 执行悬停操作
   * @param action 悬停操作
   * @returns 操作结果
   */
  private async performHover(action: AutomationActionParams): Promise<AutomationActionResult> {
    if (!this.page) throw new Error('页面未初始化')

    const selector = action.target
    const timeout = action.params?.timeout || config.getTaskExecutorConfig().stepTimeout

    await this.page.hover(selector, { timeout })

    return {
      success: true,
      duration: 0,
    }
  }

  /**
   * 执行断言操作
   * @param action 断言操作
   * @returns 操作结果
   */
  private async performAssert(action: AutomationActionParams): Promise<AutomationActionResult> {
    if (!this.page) throw new Error('页面未初始化')

    const assertion = action.target
    const timeout = action.params?.timeout || 5000

    try {
      // 等待选择器出现
      await this.page.waitForSelector(assertion, { timeout })

      // 可选：验证元素可见性
      const element = await this.page.$(assertion)
      if (!element) {
        throw new Error(`元素不存在: ${assertion}`)
      }

      const isVisible = await element.isVisible()
      if (!isVisible) {
        throw new Error(`元素不可见: ${assertion}`)
      }

      return {
        success: true,
        duration: 0,
        info: {
          element: {
            tag: await element.evaluate(el => el.tagName),
            text: await element.evaluate(el => el.textContent?.trim() || ''),
            selector: assertion,
          },
        },
      }

    } catch (error) {
      return {
        success: false,
        duration: 0,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * 执行等待操作
   * @param action 等待操作
   * @returns 操作结果
   */
  private async performWait(action: AutomationActionParams): Promise<AutomationActionResult> {
    if (!this.page) throw new Error('页面未初始化')

    const waitFor = action.params?.waitFor || 'selector'
    const target = action.target
    const timeout = action.params?.timeout || config.getTaskExecutorConfig().stepTimeout

    switch (waitFor) {
      case 'loadstate':
        await this.page.waitForLoadState('load', { timeout })
        break
      case 'networkidle':
        await this.page.waitForLoadState('networkidle', { timeout })
        break
      case 'selector':
        await this.page.waitForSelector(target, { timeout })
        break
      default:
        await this.page.waitForTimeout(parseInt(target) || 1000)
    }

    return {
      success: true,
      duration: 0,
    }
  }

  /**
   * 检查是否可以使用元素查找
   * @returns 是否可用
   */
  private isElementLookupAvailable(): boolean {
    // 检查 @midscene/web 是否可用
    try {
      require.resolve('@midscene/web')
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取页面状态信息
   * @returns 页面状态
   */
  async getPageState(): Promise<{
    url: string
    title: string
    elementCount: number
  } | null> {
    if (!this.page) return null

    return {
      url: this.page.url(),
      title: await this.page.title(),
      elementCount: await this.page.$$('*').then(els => els.length),
    }
  }

  /**
   * 截取页面截图
   * @param path 截图保存路径
   * @returns 截图buffer
   */
  async takeScreenshot(path?: string): Promise<Buffer> {
    if (!this.page) throw new Error('页面未初始化')

    return await this.page.screenshot({
      path,
      fullPage: true,
    })
  }

  /**
   * 清理资源
   */
  /**
   * 捕获截图
   * @param name 截图名称
   * @returns 截图文件路径
   */
  private async captureScreenshot(name: string): Promise<string | null> {
    if (!this.page) return null

    try {
      // 确保截图目录存在
      if (!existsSync(this.screenshotDir)) {
        await mkdir(this.screenshotDir, { recursive: true })
      }

      const filename = `${name}.png`
      const filepath = join(this.screenshotDir, filename)

      // 捕获截图
      await this.page.screenshot({
        path: filepath,
        type: 'png',
        fullPage: false,
      })

      console.log(`📸 截图已保存: ${filepath}`)
      return filepath
    } catch (error) {
      console.warn(`⚠️ 截图失败: ${error}`)
      return null
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    // 停止视频录制
    if (this.context && this.videoPath) {
      try {
        // @ts-ignore
        await this.context.close()
        console.log(`🎥 视频已保存: ${this.videoPath}`)
      } catch (error) {
        console.warn(`⚠️ 视频保存失败: ${error}`)
      }
    }

    this.page = null
    this.browser = null
    this.context = null
    this.isInitialized = false

    console.log('🧹 自动化适配器已清理')
  }
}

/**
 * 导出便捷函数
 */

/**
 * 创建AI适配器实例
 * @param browser Playwright浏览器实例
 * @param page Playwright页面实例
 * @returns AI适配器实例
 */
export async function createAutomationAdapter(browser: Browser, page: Page): Promise<MidsceneAutomationAdapter> {
  const adapter = new MidsceneAutomationAdapter()
  await adapter.initialize(browser, page)
  return adapter
}
