/**
 * @auto-test-agent/desktop-client
 *
 * 协议拦截器 (Protocol Handler)
 * 处理 midscene:// 自定义协议，实现网页端唤起桌面客户端
 */

import { app, protocol } from 'electron'
import path from 'path'
import fs from 'fs'
import { URL } from 'url'

/**
 * 协议操作类型枚举
 */
export enum ProtocolAction {
  /** 运行任务 */
  RUN = 'run',
  /** 查看任务 */
  VIEW = 'view',
  /** 配置客户端 */
  CONFIG = 'config',
  /** 健康检查 */
  HEALTH = 'health',
}

/**
 * 协议参数接口
 */
export interface ProtocolParams {
  /** 操作类型 */
  action: ProtocolAction
  /** 任务ID */
  taskId?: string
  /** 服务器地址 */
  server?: string
  /** 其他参数 */
  [key: string]: string | undefined
}

/**
 * 协议处理回调函数
 */
export type ProtocolCallback = (params: ProtocolParams) => void | Promise<void>

/**
 * 协议处理器类
 * 负责注册和处理 midscene:// 自定义协议
 */
export class ProtocolHandler {
  private static instance: ProtocolHandler
  private readonly PROTOCOL_SCHEME = 'midscene'
  private isRegistered = false
  private callback: ProtocolCallback | null = null

  private constructor() {
    // 私有构造函数，确保单例模式
  }

  /**
   * 获取协议处理器实例（单例模式）
   */
  static getInstance(): ProtocolHandler {
    if (!ProtocolHandler.instance) {
      ProtocolHandler.instance = new ProtocolHandler()
    }
    return ProtocolHandler.instance
  }

  /**
   * 注册自定义协议
   * 必须在 app.ready() 之前调用
   */
  register(): void {
    if (this.isRegistered) {
      console.log('协议已注册，跳过重复注册')
      return
    }

    try {
      // 注册自定义协议
      protocol.registerSchemesAsPrivileged([
        {
          scheme: this.PROTOCOL_SCHEME,
          privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true,
          },
        },
      ])

      this.isRegistered = true
      console.log(`✅ 协议 ${this.PROTOCOL_SCHEME}:// 注册成功`)
    } catch (error) {
      console.error('❌ 协议注册失败:', error)
    }
  }

  /**
   * 启动协议监听
   * 必须在 app.ready() 之后调用
   */
  startListening(callback: ProtocolCallback): void {
    this.callback = callback

    // 监听协议调用
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // 查找协议参数
      const protocolArgs = commandLine.find(arg => arg.startsWith(`${this.PROTOCOL_SCHEME}://`))
      if (protocolArgs) {
        this.handleProtocolCall(protocolArgs)
      }
    })

    // 处理单实例启动时的协议参数
    const protocolArgs = process.argv.find(arg => arg.startsWith(`${this.PROTOCOL_SCHEME}://`))
    if (protocolArgs) {
      this.handleProtocolCall(protocolArgs)
    }

    console.log(`🎧 开始监听 ${this.PROTOCOL_SCHEME}:// 协议调用`)
  }

  /**
   * 处理协议调用
   * @param protocolUrl 协议URL
   */
  private handleProtocolCall(protocolUrl: string): void {
    try {
      console.log(`📞 收到协议调用: ${protocolUrl}`)

      // 解析协议URL
      const params = this.parseProtocolUrl(protocolUrl)

      // 触发回调
      if (this.callback) {
        this.callback(params)
      } else {
        console.warn('⚠️ 未设置协议处理回调')
      }

      // 显示主窗口
      this.showMainWindow()

    } catch (error) {
      console.error('❌ 处理协议调用失败:', error)
    }
  }

  /**
   * 解析协议URL
   * @param protocolUrl 协议URL
   * @returns 解析后的参数
   */
  private parseProtocolUrl(protocolUrl: string): ProtocolParams {
    try {
      // 解析URL
      const url = new URL(protocolUrl)

      // 获取操作类型（从hostname）
      const action = url.hostname as ProtocolAction

      // 解析查询参数
      const params: ProtocolParams = {
        action,
      }

      // 解析任务ID（从pathname）
      const pathParts = url.pathname.split('/').filter(Boolean)
      if (pathParts.length > 0) {
        params.taskId = pathParts[0]
      }

      // 解析其他查询参数
      url.searchParams.forEach((value, key) => {
        params[key] = value
      })

      return params

    } catch (error) {
      throw new Error(`协议URL解析失败: ${error}`)
    }
  }

  /**
   * 显示主窗口
   */
  private showMainWindow(): void {
    // 获取主窗口
    const mainWindow = this.getMainWindow()

    if (mainWindow) {
      // 显示并聚焦窗口
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
      mainWindow.show()

      console.log('🪟 主窗口已显示')
    } else {
      console.warn('⚠️ 未找到主窗口')
    }
  }

  /**
   * 获取主窗口
   */
  private getMainWindow(): Electron.BrowserWindow | null {
    const { BrowserWindow } = require('electron')
    const windows = BrowserWindow.getAllWindows()
    return windows.length > 0 ? windows[0] : null
  }

  /**
   * 生成协议URL
   * @param action 操作类型
   * @param params 参数
   * @returns 协议URL
   */
  generateUrl(action: ProtocolAction, params: Record<string, string> = {}): string {
    const url = new URL(`${this.PROTOCOL_SCHEME}://${action}`)

    // 添加参数
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })

    return url.toString()
  }

  /**
   * 验证协议URL格式
   * @param protocolUrl 协议URL
   * @returns 是否有效
   */
  validateUrl(protocolUrl: string): boolean {
    try {
      const url = new URL(protocolUrl)
      return url.protocol === `${this.PROTOCOL_SCHEME}:`
    } catch {
      return false
    }
  }

  /**
   * 停止监听
   */
  stopListening(): void {
    this.callback = null
    console.log(`🛑 停止监听 ${this.PROTOCOL_SCHEME}:// 协议调用`)
  }
}

/**
 * 导出便捷函数
 */

/**
 * 注册协议（必须在app.ready()之前调用）
 */
export function registerProtocol(): void {
  ProtocolHandler.getInstance().register()
}

/**
 * 启动协议监听（必须在app.ready()之后调用）
 */
export function startProtocolListening(callback: ProtocolCallback): void {
  ProtocolHandler.getInstance().startListening(callback)
}

/**
 * 生成协议URL
 */
export function generateProtocolUrl(action: ProtocolAction, params?: Record<string, string>): string {
  return ProtocolHandler.getInstance().generateUrl(action, params)
}

/**
 * 验证协议URL
 */
export function validateProtocolUrl(protocolUrl: string): boolean {
  return ProtocolHandler.getInstance().validateUrl(protocolUrl)
}

/**
 * 协议处理器使用示例
 *
 * // 1. 在主进程入口文件中注册协议（app.ready()之前）
 * import { registerProtocol } from './ProtocolHandler'
 * registerProtocol()
 *
 * // 2. 启动协议监听（app.ready()之后）
 * import { startProtocolListening } from './ProtocolHandler'
 * app.whenReady().then(() => {
 *   startProtocolListening(async (params) => {
 *     // 处理协议调用
 *     if (params.action === ProtocolAction.RUN && params.taskId) {
 *       // 执行任务
 *       await executeTask(params.taskId)
 *     }
 *   })
 * })
 *
 * // 3. 生成协议URL（在网页端使用）
 * import { generateProtocolUrl } from './ProtocolHandler'
 * const url = generateProtocolUrl(ProtocolAction.RUN, { taskId: '123' })
 * // 结果: midscene://run?taskId=123
 */
