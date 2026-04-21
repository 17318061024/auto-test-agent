/**
 * 截图捕获 - 支持红框标记视觉证据
 */

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export interface ScreenshotOptions {
  fullPage?: boolean
  quality?: number
  type?: 'png' | 'jpeg'
  highlightSelector?: string // 需要高亮的元素选择器
  highlightStyle?: 'red-border' | 'yellow-background' | 'glow' // 高亮样式
}

export class ScreenshotCapture {
  private screenshotDir: string
  private screenshots: Map<string, string> = new Map()

  constructor(screenshotDir?: string) {
    this.screenshotDir = screenshotDir || process.env.SCREENSHOT_DIR || './screenshots'
  }

  /**
   * 初始化截图目录
   */
  private async initDir(): Promise<void> {
    if (!existsSync(this.screenshotDir)) {
      await mkdir(this.screenshotDir, { recursive: true })
    }
  }

  /**
   * 在页面上注入高亮样式
   */
  private async injectHighlightStyles(
    page: any,
    selector: string,
    style: 'red-border' | 'yellow-background' | 'glow' = 'red-border'
  ): Promise<void> {
    try {
      const styleMap = {
        'red-border': `
          outline: 3px solid #ff0000 !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.5) !important;
          position: relative !important;
          z-index: 9999 !important;
        `,
        'yellow-background': `
          background-color: #ffff00 !important;
          outline: 2px solid #ff9900 !important;
          position: relative !important;
          z-index: 9999 !important;
        `,
        'glow': `
          box-shadow: 0 0 15px 5px rgba(255, 165, 0, 0.8) !important;
          outline: 2px solid #ff6600 !important;
          position: relative !important;
          z-index: 9999 !important;
          animation: glow-pulse 1s ease-in-out infinite;
        `
      }

      // 注入脉冲动画
      await page.addStyleTag({
        content: `
          @keyframes glow-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `
      })

      // 应用高亮样式到目标元素
      await page.evaluate((sel: string, css: string) => {
        const elements = document.querySelectorAll(sel)
        elements.forEach((el: Element) => {
          if (el instanceof HTMLElement) {
            el.style.cssText += css
          }
        })
      }, selector, styleMap[style])

      console.log(`已应用 ${style} 高亮到元素: ${selector}`)
    } catch (error) {
      console.warn('应用高亮样式失败:', error)
    }
  }

  /**
   * 移除页面上的高亮样式
   */
  private async removeHighlightStyles(page: any): Promise<void> {
    try {
      await page.evaluate(() => {
        // 移除所有注入的样式标签
        const styleTags = document.querySelectorAll('style[data-puppeteer]')
        styleTags.forEach((tag: Element) => {
          if (tag instanceof HTMLElement) {
            tag.remove()
          }
        })
      })
    } catch (error) {
      console.warn('移除高亮样式失败:', error)
    }
  }

  /**
   * 捕获截图（支持红框标记）
   */
  async capture(
    page: any,
    name: string,
    options: ScreenshotOptions = {}
  ): Promise<string> {
    await this.initDir()

    const filename = `${name}_${Date.now()}.png`
    const filepath = join(this.screenshotDir, filename)

    try {
      // 如果指定了高亮选择器，先应用高亮
      if (options.highlightSelector) {
        await this.injectHighlightStyles(
          page,
          options.highlightSelector,
          options.highlightStyle || 'red-border'
        )
        // 等待高亮效果应用
        await page.waitForTimeout(500)
      }

      // 使用 Playwright 的截图功能
      const buffer = await page.screenshot({
        fullPage: options.fullPage ?? false,
        type: options.type || 'png',
        quality: options.quality,
      })

      // 保存到文件
      await writeFile(filepath, buffer)

      // 保存到内存
      this.screenshots.set(name, filepath)

      console.log(`截图已保存: ${filepath}${options.highlightSelector ? ' (带红框标记)' : ''}`)

      return filepath
    } catch (error) {
      console.error('截图失败:', error)
      throw error
    }
  }

  /**
   * 捕获操作前后的对比截图（带红框标记）
   */
  async captureAction(
    page: any,
    actionName: string,
    selector: string,
    options: ScreenshotOptions = {}
  ): Promise<{ before: string; after: string }> {
    // 捕获操作前截图（带红框标记）
    const beforePath = await this.capture(page, `${actionName}_before`, {
      ...options,
      highlightSelector: selector,
      highlightStyle: 'red-border'
    })

    // 等待一小段时间让用户看到高亮效果
    await page.waitForTimeout(1000)

    // 捕获操作后截图（带高亮标记）
    const afterPath = await this.capture(page, `${actionName}_after`, {
      ...options,
      highlightSelector: selector,
      highlightStyle: 'glow'
    })

    return {
      before: beforePath,
      after: afterPath
    }
  }

  /**
   * 获取截图路径
   */
  getScreenshot(name: string): string | undefined {
    return this.screenshots.get(name)
  }

  /**
   * 获取所有截图
   */
  getAllScreenshots(): Map<string, string> {
    return new Map(this.screenshots)
  }

  /**
   * 清除所有截图
   */
  clear(): void {
    this.screenshots.clear()
  }

  /**
   * 将截图转换为 Base64
   */
  async toBase64(filepath: string): Promise<string> {
    const { readFile } = await import('fs/promises')
    const buffer = await readFile(filepath)
    return buffer.toString('base64')
  }

  /**
   * 创建带标记的截图报告
   */
  async createMarkedScreenshotReport(
    page: any,
    action: string,
    selector: string,
    description?: string
  ): Promise<{
    action: string
    selector: string
    description?: string
    screenshots: {
      before: string
      after: string
    }
    timestamp: number
  }> {
    const screenshots = await this.captureAction(page, action, selector)

    return {
      action,
      selector,
      description,
      screenshots,
      timestamp: Date.now()
    }
  }
}
