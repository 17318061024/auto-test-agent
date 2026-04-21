/**
 * HTML报告生成器
 * 生成美观、交互式的测试执行HTML报告
 */

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * 测试步骤接口
 */
export interface TestStep {
  id: string
  action: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  duration: number
  timestamp: number
  error?: string
  stack?: string
  errorAnalysis?: {
    possibleCause: string
    suggestion: string
  }
  screenshots?: {
    before?: string
    after?: string
    error?: string
  }
}

/**
 * 测试报告数据接口
 */
export interface TestReportData {
  testName: string
  testId: string
  startTime: number
  endTime: number
  duration: number
  status: 'completed' | 'failed' | 'cancelled'
  totalSteps: number
  completedSteps: number
  failedSteps: number
  steps: TestStep[]
  performanceData: {
    browserLaunchTime: number
    totalPageLoadTime: number
    totalActionTime: number
    averageStepTime: number
  }
  screenshots: string[]
  environment: {
    platform: string
    nodeVersion: string
    chromeVersion?: string
    userAgent?: string
  }
}

/**
 * HTML报告生成器类
 */
export class HTMLReportGenerator {
  private reportDir: string

  constructor(reportDir?: string) {
    this.reportDir = reportDir || process.env.REPORTS_DIR || './reports'
  }

  /**
   * 初始化报告目录
   */
  private async initDir(): Promise<void> {
    if (!existsSync(this.reportDir)) {
      await mkdir(this.reportDir, { recursive: true })
    }
  }

  /**
   * 生成HTML报告
   * @param reportData 测试报告数据
   * @returns 报告文件路径
   */
  async generateReport(reportData: TestReportData): Promise<string> {
    await this.initDir()

    const filename = `report_${reportData.testId}_${Date.now()}.html`
    const filepath = join(this.reportDir, filename)

    const htmlContent = this.generateHTMLContent(reportData)

    await writeFile(filepath, htmlContent, 'utf-8')

    console.log(`📊 HTML报告已生成: ${filepath}`)
    return filepath
  }

  /**
   * 生成HTML内容
   * @param reportData 测试报告数据
   * @returns HTML内容
   */
  private generateHTMLContent(reportData: TestReportData): string {
    const { testName, testId, startTime, endTime, duration, status, steps, performanceData, screenshots } = reportData

    const successRate = ((reportData.completedSteps / reportData.totalSteps) * 100).toFixed(1)
    const failureRate = ((reportData.failedSteps / reportData.totalSteps) * 100).toFixed(1)

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${testName} - 测试报告</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2em;
            margin-bottom: 10px;
        }

        .header .meta {
            opacity: 0.9;
            font-size: 0.9em;
        }

        .status-bar {
            display: flex;
            justify-content: space-around;
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
        }

        .status-item {
            text-align: center;
            flex: 1;
        }

        .status-item .label {
            font-size: 0.8em;
            color: #6c757d;
            margin-bottom: 5px;
        }

        .status-item .value {
            font-size: 1.5em;
            font-weight: bold;
        }

        .status-item .value.success { color: #28a745; }
        .status-item .value.failed { color: #dc3545; }
        .status-item .value.duration { color: #007bff; }

        .section {
            padding: 30px;
            border-bottom: 1px solid #e9ecef;
        }

        .section-title {
            font-size: 1.3em;
            margin-bottom: 20px;
            color: #333;
            display: flex;
            align-items: center;
        }

        .section-title::before {
            content: '';
            width: 4px;
            height: 20px;
            background: #667eea;
            margin-right: 10px;
            border-radius: 2px;
        }

        .steps-container {
            display: grid;
            gap: 15px;
        }

        .step-card {
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .step-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }

        .step-card.status-success {
            border-color: #28a745;
            background: #f8fff9;
        }

        .step-card.status-failed {
            border-color: #dc3545;
            background: #fff5f5;
        }

        .step-card.status-running {
            border-color: #007bff;
            background: #f8f9ff;
        }

        .step-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .step-title {
            font-weight: 600;
            color: #333;
        }

        .step-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 600;
        }

        .step-status.success { background: #d4edda; color: #155724; }
        .step-status.failed { background: #f8d7da; color: #721c24; }
        .step-status.running { background: #d1ecf1; color: #0c5460; }
        .step-status.pending { background: #e2e3e5; color: #383d41; }

        .step-time {
            color: #6c757d;
            font-size: 0.9em;
        }

        .step-error {
            margin-top: 15px;
            padding: 15px;
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            border-radius: 4px;
        }

        .step-error-title {
            font-weight: 600;
            color: #856404;
            margin-bottom: 8px;
        }

        .step-error-message {
            color: #856404;
            font-family: monospace;
            font-size: 0.9em;
        }

        .screenshots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 15px;
        }

        .screenshot-card {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.3s ease;
        }

        .screenshot-card:hover {
            transform: scale(1.05);
        }

        .screenshot-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }

        .screenshot-info {
            padding: 10px;
            background: #f8f9fa;
            font-size: 0.8em;
            color: #6c757d;
        }

        .performance-chart {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .performance-item {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .performance-label {
            font-size: 0.9em;
            color: #6c757d;
            margin-bottom: 10px;
        }

        .performance-value {
            font-size: 2em;
            font-weight: bold;
            color: #007bff;
        }

        .performance-unit {
            font-size: 0.6em;
            color: #6c757d;
        }

        .env-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            font-size: 0.9em;
        }

        .env-item {
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
        }

        .env-label {
            font-weight: 600;
            color: #495057;
            margin-bottom: 5px;
        }

        .env-value {
            color: #6c757d;
            font-family: monospace;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 0.9em;
        }

        .collapsible-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }

        .collapsible-content.active {
            max-height: 500px;
        }

        @media (max-width: 768px) {
            .status-bar {
                flex-direction: column;
                gap: 15px;
            }

            .steps-container {
                grid-template-columns: 1fr;
            }

            .screenshots-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 头部 -->
        <div class="header">
            <h1>🧪 ${testName}</h1>
            <div class="meta">
                <div>测试ID: ${testId}</div>
                <div>开始时间: ${new Date(startTime).toLocaleString('zh-CN')}</div>
                <div>结束时间: ${new Date(endTime).toLocaleString('zh-CN')}</div>
            </div>
        </div>

        <!-- 状态栏 -->
        <div class="status-bar">
            <div class="status-item">
                <div class="label">总体状态</div>
                <div class="value ${status === 'completed' ? 'success' : 'failed'}">
                    ${status === 'completed' ? '✅ 完成' : '❌ 失败'}
                </div>
            </div>
            <div class="status-item">
                <div class="label">总耗时</div>
                <div class="value duration">${(duration / 1000).toFixed(2)}s</div>
            </div>
            <div class="status-item">
                <div class="label">成功率</div>
                <div class="value success">${successRate}%</div>
            </div>
            <div class="status-item">
                <div class="label">失败率</div>
                <div class="value failed">${failureRate}%</div>
            </div>
        </div>

        <!-- 性能数据 -->
        <div class="section">
            <h2 class="section-title">⚡ 性能数据</h2>
            <div class="performance-chart">
                <div class="performance-item">
                    <div class="performance-label">浏览器启动</div>
                    <div class="performance-value">${performanceData.browserLaunchTime}<span class="performance-unit">ms</span></div>
                </div>
                <div class="performance-item">
                    <div class="performance-label">页面加载</div>
                    <div class="performance-value">${performanceData.totalPageLoadTime}<span class="performance-unit">ms</span></div>
                </div>
                <div class="performance-item">
                    <div class="performance-label">操作执行</div>
                    <div class="performance-value">${performanceData.totalActionTime}<span class="performance-unit">ms</span></div>
                </div>
                <div class="performance-item">
                    <div class="performance-label">平均步骤时间</div>
                    <div class="performance-value">${performanceData.averageStepTime}<span class="performance-unit">ms</span></div>
                </div>
            </div>
        </div>

        <!-- 执行步骤 -->
        <div class="section">
            <h2 class="section-title">📋 执行步骤 (${steps.length})</h2>
            <div class="steps-container">
                ${steps.map((step, index) => this.generateStepHTML(step, index)).join('')}
            </div>
        </div>

        <!-- 截图展示 -->
        ${screenshots.length > 0 ? `
        <div class="section">
            <h2 class="section-title">📸 截图证据 (${screenshots.length})</h2>
            <div class="screenshots-grid">
                ${screenshots.map((screenshot, index) => `
                    <div class="screenshot-card">
                        <img src="${screenshot}" alt="Screenshot ${index + 1}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2214%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E截图未找到%3C/text%3E%3C/svg%3E'">
                        <div class="screenshot-info">截图 ${index + 1}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- 环境信息 -->
        <div class="section">
            <h2 class="section-title">🖥️ 环境信息</h2>
            <div class="env-info">
                <div class="env-item">
                    <div class="env-label">操作系统</div>
                    <div class="env-value">${reportData.environment.platform}</div>
                </div>
                <div class="env-item">
                    <div class="env-label">Node版本</div>
                    <div class="env-value">${reportData.environment.nodeVersion}</div>
                </div>
                ${reportData.environment.chromeVersion ? `
                <div class="env-item">
                    <div class="env-label">Chrome版本</div>
                    <div class="env-value">${reportData.environment.chromeVersion}</div>
                </div>
                ` : ''}
                ${reportData.environment.userAgent ? `
                <div class="env-item">
                    <div class="env-label">用户代理</div>
                    <div class="env-value">${reportData.environment.userAgent}</div>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- 页脚 -->
        <div class="footer">
            <p>🤖 由 Auto Test Agent 生成</p>
            <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        </div>
    </div>

    <script>
        // 步骤卡片展开/收起功能
        document.querySelectorAll('.step-card').forEach(card => {
            card.addEventListener('click', function() {
                const content = this.querySelector('.collapsible-content');
                if (content) {
                    content.classList.toggle('active');
                }
            });
        });

        // 图片点击放大功能
        document.querySelectorAll('.screenshot-card img').forEach(img => {
            img.addEventListener('click', function(e) {
                e.stopPropagation();
                window.open(this.src, '_blank');
            });
        });
    </script>
</body>
</html>`
  }

  /**
   * 生成单个步骤的HTML
   * @param step 步骤数据
   * @param index 步骤索引
   * @returns HTML字符串
   */
  private generateStepHTML(step: TestStep, index: number): string {
    const statusClass = `status-${step.status}`
    const statusText = {
      'success': '✅ 成功',
      'failed': '❌ 失败',
      'running': '🔄 执行中',
      'pending': '⏳ 等待中',
      'skipped': '⏭️ 跳过'
    }[step.status]

    return `
      <div class="step-card ${statusClass}">
        <div class="step-header">
          <div class="step-title">${index + 1}. ${step.action}</div>
          <div class="step-status ${step.status}">${statusText}</div>
        </div>
        <div class="step-time">⏱️ ${step.duration}ms | 🕐 ${new Date(step.timestamp).toLocaleTimeString('zh-CN')}</div>

        ${step.error ? `
          <div class="step-error">
            <div class="step-error-title">⚠️ 错误信息</div>
            <div class="step-error-message">${this.escapeHTML(step.error)}</div>
            ${step.errorAnalysis ? `
              <div style="margin-top: 10px; font-size: 0.9em;">
                <strong>🔍 可能原因:</strong> ${this.escapeHTML(step.errorAnalysis.possibleCause)}<br>
                <strong>💡 建议:</strong> ${this.escapeHTML(step.errorAnalysis.suggestion)}
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${step.screenshots && (step.screenshots.before || step.screenshots.after || step.screenshots.error) ? `
          <div class="collapsible-content">
            <div class="screenshots-grid" style="margin-top: 15px;">
              ${step.screenshots.before ? `
                <div class="screenshot-card">
                  <img src="${step.screenshots.before}" alt="操作前截图">
                  <div class="screenshot-info">操作前 - 带红框标记</div>
                </div>
              ` : ''}
              ${step.screenshots.after ? `
                <div class="screenshot-card">
                  <img src="${step.screenshots.after}" alt="操作后截图">
                  <div class="screenshot-info">操作后 - 发光效果</div>
                </div>
              ` : ''}
              ${step.screenshots.error ? `
                <div class="screenshot-card">
                  <img src="${step.screenshots.error}" alt="错误截图">
                  <div class="screenshot-info">错误发生时</div>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `
  }

  /**
   * HTML转义
   * @param text 需要转义的文本
   * @returns 转义后的文本
   */
  private escapeHTML(text: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }
    return text.replace(/[&<>"']/g, char => htmlEscapes[char])
  }

  /**
   * 批量生成报告
   * @param reportDatas 报告数据数组
   * @returns 生成的报告文件路径数组
   */
  async generateBatchReports(reportDatas: TestReportData[]): Promise<string[]> {
    const generatedPaths: string[] = []

    for (const reportData of reportDatas) {
      try {
        const path = await this.generateReport(reportData)
        generatedPaths.push(path)
      } catch (error) {
        console.error(`生成报告失败: ${reportData.testId}`, error)
      }
    }

    return generatedPaths
  }
}

/**
 * 导出便捷函数
 */
export async function generateHTMLReport(reportData: TestReportData): Promise<string> {
  const generator = new HTMLReportGenerator()
  return await generator.generateReport(reportData)
}