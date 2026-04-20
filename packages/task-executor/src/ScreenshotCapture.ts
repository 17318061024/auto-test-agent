/**
 * 截图捕获
 */

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export interface ScreenshotOptions {
  fullPage?: boolean
  quality?: number
  type?: 'png' | 'jpeg'
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
   * 捕获截图（需要传入 page 对象）
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

      console.log(`截图已保存: ${filepath}`)
      return filepath
    } catch (error) {
      console.error('截图失败:', error)
      throw error
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
}
