/**
 * 视觉证据收集
 */

import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export class VisualEvidence {
  private screenshots: string[] = []

  /**
   * 保存截图
   */
  async saveScreenshot(buffer: Buffer, filename: string): Promise<string> {
    const dir = join(process.cwd(), 'screenshots')
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    const filepath = join(dir, filename)
    await writeFile(filepath, buffer)
    this.screenshots.push(filepath)

    return filepath
  }

  /**
   * 获取所有截图路径
   */
  getScreenshots() {
    return this.screenshots
  }

  /**
   * 清空截图
   */
  clear() {
    this.screenshots = []
  }
}