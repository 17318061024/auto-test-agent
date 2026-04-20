/**
 * 视觉证据库
 *
 * 功能：
 * 1. 自动生成截图（红框标记元素）
 * 2. 与 AI 指令关联存储
 * 3. 截图管理
 */

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export interface ScreenshotMetadata {
  id: string
  timestamp: number
  instruction: string
  action: string
  elementSelector?: string
  filepath: string
  base64?: string
}

export interface EvidenceConfig {
  outputDir: string
  format: 'png' | 'jpeg'
  quality: number
  highlightElements: boolean
}

export class VisualEvidence {
  private config: EvidenceConfig
  private screenshots: Map<string, ScreenshotMetadata> = new Map()

  constructor(config?: Partial<EvidenceConfig>) {
    this.config = {
      outputDir: config?.outputDir || './screenshots',
      format: config?.format || 'png',
      quality: config?.quality || 80,
      highlightElements: config?.highlightElements ?? true,
    }
  }

  /**
   * 初始化输出目录
   */
  private async initDir(): Promise<void> {
    if (!existsSync(this.config.outputDir)) {
      await mkdir(this.config.outputDir, { recursive: true })
    }
  }

  /**
   * 捕获截图并标记元素
   */
  async captureWithHighlight(
    page: any,
    instruction: string,
    action: string,
    options: {
      elementSelector?: string
      highlightColor?: string
      highlightWidth?: number
    } = {}
  ): Promise<ScreenshotMetadata> {
    const {
      elementSelector,
      highlightColor = 'red',
      highlightWidth = 3,
    } = options

    await this.initDir()

    // 高亮标记元素
    if (this.config.highlightElements && elementSelector) {
      await this.highlightElement(page, elementSelector, highlightColor, highlightWidth)
    }

    // 捕获截图
    const timestamp = Date.now()
    const id = `screenshot_${timestamp}`
    const filename = `${id}.${this.config.format}`
    const filepath = join(this.config.outputDir, filename)

    try {
      const buffer = await page.screenshot({
        path: filepath,
        type: this.config.format,
        quality: this.config.format === 'jpeg' ? this.config.quality : undefined,
      })

      const metadata: ScreenshotMetadata = {
        id,
        timestamp,
        instruction,
        action,
        elementSelector,
        filepath,
        base64: buffer.toString('base64'),
      }

      this.screenshots.set(id, metadata)
      console.log(`✅ 截图已保存: ${filepath}`)

      return metadata
    } catch (error) {
      console.error('❌ 截图失败:', error)
      throw error
    }
  }

  /**
   * 高亮标记元素
   */
  private async highlightElement(
    page: any,
    selector: string,
    color: string,
    width: number
  ): Promise<void> {
    try {
      const script = `({ selector, color, width }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          const rect = element.getBoundingClientRect();

          // 创建高亮框
          const highlight = document.createElement('div');
          highlight.style.position = 'absolute';
          highlight.style.left = rect.left + window.scrollX + 'px';
          highlight.style.top = rect.top + window.scrollY + 'px';
          highlight.style.width = rect.width + 'px';
          highlight.style.height = rect.height + 'px';
          highlight.style.border = width + 'px solid ' + color;
          highlight.style.pointerEvents = 'none';
          highlight.style.zIndex = '999999';
          highlight.id = 'auto-test-highlight';

          document.body.appendChild(highlight);
        });
      }`

      await page.evaluate(script, { selector, color, width })

      // 等待一下让高亮框显示
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.log('⚠️  高亮元素失败:', error)
    }
  }

  /**
   * 移除高亮标记
   */
  async removeHighlight(page: any): Promise<void> {
    try {
      const script = `() => {
        const highlight = document.getElementById('auto-test-highlight');
        if (highlight) {
          highlight.remove();
        }
      }`
      await page.evaluate(script)
    } catch (error) {
      console.log('⚠️  移除高亮失败:', error)
    }
  }

  /**
   * 捕获页面全屏截图
   */
  async captureFullPage(
    page: any,
    instruction: string
  ): Promise<ScreenshotMetadata> {
    await this.initDir()

    const timestamp = Date.now()
    const id = `fullpage_${timestamp}`
    const filename = `${id}.${this.config.format}`
    const filepath = join(this.config.outputDir, filename)

    try {
      const buffer = await page.screenshot({
        path: filepath,
        type: this.config.format,
        fullPage: true,
      })

      const metadata: ScreenshotMetadata = {
        id,
        timestamp,
        instruction,
        action: 'full_page_capture',
        filepath,
        base64: buffer.toString('base64'),
      }

      this.screenshots.set(id, metadata)
      console.log(`✅ 全屏截图已保存: ${filepath}`)

      return metadata
    } catch (error) {
      console.error('❌ 全屏截图失败:', error)
      throw error
    }
  }

  /**
   * 捕获元素截图
   */
  async captureElement(
    page: any,
    selector: string,
    instruction: string
  ): Promise<ScreenshotMetadata | null> {
    try {
      const element = await page.locator(selector).first()
      if (!(await element.count())) {
        console.log(`⚠️  元素不存在: ${selector}`)
        return null
      }

      await this.initDir()

      const timestamp = Date.now()
      const id = `element_${timestamp}`
      const filename = `${id}.${this.config.format}`
      const filepath = join(this.config.outputDir, filename)

      const buffer = await element.screenshot({
        path: filepath,
        type: this.config.format,
      })

      const metadata: ScreenshotMetadata = {
        id,
        timestamp,
        instruction,
        action: 'element_capture',
        elementSelector: selector,
        filepath,
        base64: buffer.toString('base64'),
      }

      this.screenshots.set(id, metadata)
      console.log(`✅ 元素截图已保存: ${filepath}`)

      return metadata
    } catch (error) {
      console.error('❌ 元素截图失败:', error)
      return null
    }
  }

  /**
   * 获取截图元数据
   */
  getScreenshot(id: string): ScreenshotMetadata | undefined {
    return this.screenshots.get(id)
  }

  /**
   * 获取所有截图
   */
  getAllScreenshots(): ScreenshotMetadata[] {
    return Array.from(this.screenshots.values()).sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * 根据指令搜索截图
   */
  searchByInstruction(keyword: string): ScreenshotMetadata[] {
    return this.getAllScreenshots().filter((s) =>
      s.instruction.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  /**
   * 根据操作类型搜索截图
   */
  searchByAction(action: string): ScreenshotMetadata[] {
    return this.getAllScreenshots().filter((s) => s.action.toLowerCase().includes(action.toLowerCase()))
  }

  /**
   * 删除截图
   */
  async deleteScreenshot(id: string): Promise<boolean> {
    const metadata = this.screenshots.get(id)
    if (!metadata) return false

    // TODO: 删除文件
    this.screenshots.delete(id)
    console.log(`🗑️  截图已删除: ${id}`)
    return true
  }

  /**
   * 清除所有截图
   */
  clear(): void {
    this.screenshots.clear()
    console.log('🗑️  所有截图已清除')
  }

  /**
   * 生成截图报告（HTML）
   */
  generateReport(): string {
    const screenshots = this.getAllScreenshots()

    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>视觉证据报告</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      text-align: center;
      color: #333;
    }
    .screenshot {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .screenshot img {
      max-width: 100%;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    .metadata {
      margin-top: 10px;
      color: #666;
      font-size: 14px;
    }
    .instruction {
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    .timestamp {
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>视觉证据报告</h1>
  <p>共 ${screenshots.length} 张截图</p>
  ${screenshots.map((s) => `
    <div class="screenshot">
      <div class="instruction">指令: ${s.instruction}</div>
      <div class="metadata">操作: ${s.action}</div>
      ${s.elementSelector ? `<div class="metadata">元素: ${s.elementSelector}</div>` : ''}
      <div class="timestamp">${new Date(s.timestamp).toLocaleString('zh-CN')}</div>
      <img src="data:image/${this.config.format};base64,${s.base64}" alt="${s.instruction}">
    </div>
  `).join('')}
</body>
</html>
    `

    return html
  }

  /**
   * 导出为 HTML 报告
   */
  async exportToHtml(filepath: string): Promise<void> {
    const html = this.generateReport()
    await writeFile(filepath, html, 'utf-8')
    console.log(`✅ HTML 报告已导出: ${filepath}`)
  }

  /**
   * 导出为 JSON
   */
  async exportToJson(filepath: string): Promise<void> {
    const data = this.getAllScreenshots()
    await writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8')
    console.log(`✅ JSON 报告已导出: ${filepath}`)
  }
}
