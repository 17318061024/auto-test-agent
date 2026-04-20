/**
 * 协议拦截器
 *
 * 功能：
 * 1. 注册 midscene:// 自定义协议
 * 2. 处理 midscene://run?taskId=xxx 唤起
 * 3. 窗口管理和任务执行进度展示
 */

import { app, BrowserWindow, protocol } from 'electron'
import path from 'path'

export interface ProtocolHandlerOptions {
  onTaskReceived?: (taskId: string, params: Record<string, string>) => void
}

export class ProtocolHandler {
  private mainWindow: BrowserWindow | null = null
  private options: ProtocolHandlerOptions

  constructor(options?: ProtocolHandlerOptions) {
    this.options = options || {}
    this.registerProtocol()
    this.setupEventListeners()
  }

  /**
   * 设置主窗口
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  /**
   * 注册自定义协议
   */
  private registerProtocol(): void {
    const scheme = 'midscene'

    // 注册协议
    protocol.registerSchemesAsPrivileged([
      {
        scheme,
        privileges: {
          standard: true,
          secure: true,
          supportFetchAPI: true,
        },
      },
    ])

    // 监听协议请求
    app.on('ready', () => {
      protocol.handle(scheme, (request) => {
        const url = request.url
        console.log('协议请求:', url)

        // 解析 URL
        const parsedUrl = new URL(url)
        const action = parsedUrl.hostname
        const params = this.parseParams(parsedUrl)

        // 处理不同的操作
        switch (action) {
          case 'run':
            this.handleRun(params)
            break
          case 'install':
            this.handleInstall(params)
            break
          case 'configure':
            this.handleConfigure(params)
            break
          default:
            console.log('未知操作:', action)
        }

        // 返回响应
        return new Response('OK', {
          status: 200,
          headers: {
            'Content-Type': 'text/plain',
          },
        })
      })
    })

    console.log('✅ midscene:// 协议已注册')
  }

  /**
   * 解析 URL 参数
   */
  private parseParams(url: URL): Record<string, string> {
    const params: Record<string, string> = {}
    url.searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  }

  /**
   * 处理运行任务
   */
  private handleRun(params: Record<string, string>): void {
    const { taskId } = params

    if (!taskId) {
      console.error('缺少 taskId 参数')
      return
    }

    console.log('🚀 收到任务运行请求:', taskId)

    // 前置窗口
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore()
      }
      this.mainWindow.focus()

      // 发送任务到渲染进程
      this.mainWindow.webContents.send('task:received', {
        taskId,
        params,
      })

      // 显示任务执行进度条
      this.showTaskProgress(taskId)
    }

    // 回调
    if (this.options.onTaskReceived) {
      this.options.onTaskReceived(taskId, params)
    }
  }

  /**
   * 处理安装
   */
  private handleInstall(params: Record<string, string>): void {
    console.log('收到安装请求:', params)

    if (this.mainWindow) {
      this.mainWindow.webContents.send('install:requested', params)
    }
  }

  /**
   * 处理配置
   */
  private handleConfigure(params: Record<string, string>): void {
    console.log('收到配置请求:', params)

    if (this.mainWindow) {
      this.mainWindow.webContents.send('configure:requested', params)
    }
  }

  /**
   * 显示任务执行进度
   */
  private showTaskProgress(taskId: string): void {
    if (!this.mainWindow) return

    // 发送显示进度条事件
    this.mainWindow.webContents.send('task:progress:show', {
      taskId,
      timestamp: Date.now(),
    })

    console.log('📊 显示任务进度条:', taskId)
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听第二个实例启动（通过协议打开）
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      console.log('检测到第二个实例')

      // 查找协议 URL
      const protocolUrl = commandLine.find((arg) => arg.startsWith('midscene://'))

      if (protocolUrl && this.mainWindow) {
        // 前置窗口
        if (this.mainWindow.isMinimized()) {
          this.mainWindow.restore()
        }
        this.mainWindow.focus()

        // 解析并处理 URL
        try {
          const url = new URL(protocolUrl)
          const params = this.parseParams(url)
          const action = url.hostname

          if (action === 'run') {
            this.handleRun(params)
          }
        } catch (error) {
          console.error('解析协议 URL 失败:', error)
        }
      }
    })

    // Windows: 监听应用启动
    app.on('open-url', (event, url) => {
      event.preventDefault()

      console.log('打开 URL:', url)

      try {
        const parsedUrl = new URL(url)
        const params = this.parseParams(parsedUrl)
        const action = parsedUrl.hostname

        if (action === 'run') {
          this.handleRun(params)
        }
      } catch (error) {
        console.error('处理协议 URL 失败:', error)
      }
    })
  }

  /**
   * 生成协议 URL
   */
  static generateRunUrl(taskId: string, params?: Record<string, string>): string {
    const url = new URL('midscene://run')
    url.searchParams.set('taskId', taskId)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }

    return url.toString()
  }

  /**
   * 生成配置 URL
   */
  static generateConfigureUrl(params?: Record<string, string>): string {
    const url = new URL('midscene://configure')

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }

    return url.toString()
  }

  /**
   * 测试协议（开发用）
   */
  testProtocol(taskId: string): void {
    const url = ProtocolHandler.generateRunUrl(taskId)
    console.log('测试协议 URL:', url)

    if (this.mainWindow) {
      this.mainWindow.loadURL(url)
    }
  }
}
