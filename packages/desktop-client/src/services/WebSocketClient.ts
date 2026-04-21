/**
 * @auto-test-agent/desktop-client
 *
 * WebSocket 客户端
 * 负责与服务器建立实时通信连接，处理任务状态同步和消息推送
 *
 * 主要功能：
 * - 自动连接和重连机制
 * - 任务状态实时同步
 * - 心跳保活机制
 * - 消息队列和离线消息处理
 * - 错误处理和日志记录
 */

import { io, Socket } from 'socket.io-client'
import { config } from '@auto-test-agent/shared'

/**
 * WebSocket 连接状态枚举
 */
export enum ConnectionState {
  /** 未连接 */
  DISCONNECTED = 'disconnected',
  /** 连接中 */
  CONNECTING = 'connecting',
  /** 已连接 */
  CONNECTED = 'connected',
  /** 重连中 */
  RECONNECTING = 'reconnecting',
  /** 连接失败 */
  FAILED = 'failed',
}

/**
 * 任务状态消息接口
 */
export interface TaskStatusMessage {
  /** 任务ID */
  taskId: string
  /** 任务状态 */
  status: 'pending' | 'running' | 'completed' | 'failed'
  /** 当前步骤 */
  currentStep?: number
  /** 总步骤数 */
  totalSteps?: number
  /** 步骤结果 */
  stepResult?: {
    stepId: string
    status: 'success' | 'failed'
    duration: number
    error?: string
  }
  /** 进度百分比 */
  progress?: number
  /** 额外数据 */
  data?: Record<string, any>
}

/**
 * 连接配置接口
 */
export interface ConnectionConfig {
  /** 服务器地址 */
  url?: string
  /** 自动重连 */
  autoReconnect?: boolean
  /** 重连间隔（毫秒） */
  reconnectInterval?: number
  /** 最大重连次数 */
  maxReconnectAttempts?: number
  /** 心跳间隔（毫秒） */
  heartbeatInterval?: number
  /** 连接超时（毫秒） */
  connectionTimeout?: number
}

/**
 * 事件回调类型定义
 */
export type EventCallback = (...args: any[]) => void

/**
 * WebSocket 客户端类
 * 提供完整的WebSocket通信功能
 */
export class WebSocketClient {
  /** Socket.IO 客户端实例 */
  private socket: Socket | null = null
  /** 连接状态 */
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED
  /** 连接配置 */
  private config: Required<ConnectionConfig>
  /** 重连次数 */
  private reconnectAttempts: number = 0
  /** 心跳定时器 */
  private heartbeatTimer: NodeJS.Timeout | null = null
  /** 事件监听器映射 */
  private listeners: Map<string, Set<EventCallback>> = new Map()
  /** 消息队列（离线时缓存消息） */
  private messageQueue: any[] = []
  /** 客户端信息 */
  private clientInfo: {
    id: string
    name: string
    version: string
    platform: string
    arch: string
  }

  constructor(customConfig?: ConnectionConfig) {
    // 合并默认配置
    const clientConfig = config.getClientConfig()
    this.config = {
      url: customConfig?.url || config.getWebSocketURL(),
      autoReconnect: customConfig?.autoReconnect ?? true,
      reconnectInterval: customConfig?.reconnectInterval || clientConfig.reconnectInterval,
      maxReconnectAttempts: customConfig?.maxReconnectAttempts || clientConfig.maxReconnectAttempts,
      heartbeatInterval: customConfig?.heartbeatInterval || clientConfig.heartbeatInterval,
      connectionTimeout: customConfig?.connectionTimeout || 10000,
    }

    // 初始化客户端信息
    this.clientInfo = {
      id: this.generateClientId(),
      name: clientConfig.name,
      version: clientConfig.version,
      platform: process.platform,
      arch: process.arch,
    }

    console.log('🔌 WebSocket 客户端初始化完成')
  }

  /**
   * 连接到服务器
   */
  connect(): void {
    if (this.connectionState === ConnectionState.CONNECTED ||
        this.connectionState === ConnectionState.CONNECTING) {
      console.log('⚠️ WebSocket 已连接或正在连接中，跳过重复连接')
      return
    }

    console.log(`🔌 正在连接到 WebSocket 服务器: ${this.config.url}`)
    this.setConnectionState(ConnectionState.CONNECTING)

    try {
      // 创建 Socket.IO 连接
      this.socket = io(this.config.url, {
        autoConnect: true,
        reconnection: this.config.autoReconnect,
        reconnectionDelay: this.config.reconnectInterval,
        reconnectionAttempts: this.config.maxReconnectAttempts,
        timeout: this.config.connectionTimeout,
        query: {
          clientId: this.clientInfo.id,
          clientName: this.clientInfo.name,
          version: this.clientInfo.version,
        },
      })

      // 设置事件监听
      this.setupEventListeners()

    } catch (error) {
      console.error('❌ WebSocket 连接失败:', error)
      this.setConnectionState(ConnectionState.FAILED)
      this.handleReconnect()
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 断开 WebSocket 连接')
      this.socket.disconnect()
      this.socket = null
    }

    this.stopHeartbeat()
    this.setConnectionState(ConnectionState.DISCONNECTED)
    this.reconnectAttempts = 0
  }

  /**
   * 发送消息到服务器
   * @param event 事件名称
   * @param data 消息数据
   */
  emit(event: string, data?: any): void {
    if (this.socket && this.connectionState === ConnectionState.CONNECTED) {
      console.log(`📤 发送消息: ${event}`, data)
      this.socket.emit(event, {
        ...data,
        clientId: this.clientInfo.id,
        timestamp: Date.now(),
      })
    } else {
      // 连接未建立，将消息加入队列
      console.log(`📦 消息已加入队列: ${event}`, data)
      this.messageQueue.push({ event, data })
    }
  }

  /**
   * 监听服务器事件
   * @param event 事件名称
   * @param callback 回调函数
   */
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    // 如果已连接，立即绑定事件
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  /**
   * 移除事件监听
   * @param event 事件名称
   * @param callback 回调函数
   */
  off(event: string, callback?: EventCallback): void {
    if (!this.listeners.has(event)) return

    const listeners = this.listeners.get(event)!

    if (callback) {
      listeners.delete(callback)
      if (this.socket) {
        this.socket.off(event, callback)
      }
    } else {
      // 移除所有监听器
      listeners.clear()
      if (this.socket) {
        this.socket.off(event)
      }
    }
  }

  /**
   * 发送任务状态更新
   * @param message 任务状态消息
   */
  sendTaskStatus(message: TaskStatusMessage): void {
    this.emit('task:status', message)
  }

  /**
   * 请求执行任务
   * @param taskId 任务ID
   */
  requestTaskExecution(taskId: string): void {
    this.emit('task:execute', { taskId })
  }

  /**
   * 取消任务执行
   * @param taskId 任务ID
   */
  cancelTaskExecution(taskId: string): void {
    this.emit('task:cancel', { taskId })
  }

  /**
   * 发送心跳
   */
  private sendHeartbeat(): void {
    this.emit('client:heartbeat', {
      timestamp: Date.now(),
      uptime: process.uptime(),
    })
  }

  /**
   * 设置 Socket.IO 事件监听器
   */
  private setupEventListeners(): void {
    if (!this.socket) return

    // 连接成功
    this.socket.on('connect', () => {
      console.log('✅ WebSocket 连接成功')
      this.setConnectionState(ConnectionState.CONNECTED)
      this.reconnectAttempts = 0

      // 注册客户端
      this.socket!.emit('client:register', this.clientInfo)

      // 发送队列中的消息
      this.flushMessageQueue()

      // 启动心跳
      this.startHeartbeat()
    })

    // 连接错误
    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket 连接错误:', error)
      this.setConnectionState(ConnectionState.FAILED)
    })

    // 断开连接
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket 连接断开:', reason)
      this.setConnectionState(ConnectionState.DISCONNECTED)
      this.stopHeartbeat()

      // 如果是服务器主动断开，尝试重连
      if (reason === 'io server disconnect') {
        this.handleReconnect()
      }
    })

    // 重连尝试
    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 WebSocket 重连尝试 ${attempt}/${this.config.maxReconnectAttempts}`)
      this.setConnectionState(ConnectionState.RECONNECTING)
      this.reconnectAttempts = attempt
    })

    // 重连成功
    this.socket.on('reconnect', (attempt) => {
      console.log(`✅ WebSocket 重连成功 (第 ${attempt} 次尝试)`)
      this.setConnectionState(ConnectionState.CONNECTED)
      this.reconnectAttempts = 0
    })

    // 重连失败
    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket 重连失败，已达到最大尝试次数')
      this.setConnectionState(ConnectionState.FAILED)
    })

    // 接收任务分配
    this.socket.on('task:assigned', (data) => {
      console.log('📋 收到任务分配:', data)
      this.trigger('task:assigned', data)
    })

    // 接收任务状态更新
    this.socket.on('task:updated', (data) => {
      console.log('📊 收到任务状态更新:', data)
      this.trigger('task:updated', data)
    })

    // 接收客户端列表
    this.socket.on('clients:list', (data) => {
      console.log('👥 收到客户端列表:', data)
      this.trigger('clients:list', data)
    })

    // 接收服务器消息
    this.socket.on('server:message', (data) => {
      console.log('📨 收到服务器消息:', data)
      this.trigger('server:message', data)
    })
  }

  /**
   * 触发事件监听器
   * @param event 事件名称
   * @param data 事件数据
   */
  private trigger(event: string, data?: any): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`❌ 事件监听器执行错误 (${event}):`, error)
        }
      })
    }
  }

  /**
   * 处理重连逻辑
   */
  private handleReconnect(): void {
    if (!this.config.autoReconnect) {
      console.log('❌ 自动重连已禁用')
      return
    }

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('❌ 已达到最大重连次数，放弃重连')
      this.setConnectionState(ConnectionState.FAILED)
      return
    }

    console.log(`🔄 ${this.config.reconnectInterval / 1000}秒后尝试重连...`)
    setTimeout(() => {
      if (this.connectionState !== ConnectionState.CONNECTED) {
        this.reconnectAttempts++
        this.connect()
      }
    }, this.config.reconnectInterval)
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()

    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat()
    }, this.config.heartbeatInterval)

    console.log(`💓 心跳已启动 (间隔: ${this.config.heartbeatInterval / 1000}秒)`)
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
      console.log('💔 心跳已停止')
    }
  }

  /**
   * 发送队列中的消息
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return

    console.log(`📤 发送队列中的 ${this.messageQueue.length} 条消息`)

    while (this.messageQueue.length > 0) {
      const { event, data } = this.messageQueue.shift()!
      this.emit(event, data)
    }
  }

  /**
   * 设置连接状态
   * @param state 新的连接状态
   */
  private setConnectionState(state: ConnectionState): void {
    const oldState = this.connectionState
    this.connectionState = state

    if (oldState !== state) {
      console.log(`📡 连接状态变更: ${oldState} → ${state}`)
      this.trigger('connection:state', { oldState, newState: state })
    }
  }

  /**
   * 生成客户端ID
   * @returns 客户端ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取连接状态
   * @returns 当前连接状态
   */
  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  /**
   * 检查是否已连接
   * @returns 是否已连接
   */
  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED
  }

  /**
   * 获取客户端信息
   * @returns 客户端信息
   */
  getClientInfo(): typeof this.clientInfo {
    return { ...this.clientInfo }
  }

  /**
   * 销毁客户端
   */
  destroy(): void {
    console.log('🔌 销毁 WebSocket 客户端')

    this.disconnect()
    this.listeners.clear()
    this.messageQueue = []
  }
}

/**
 * 导出便捷函数
 */

/**
 * 创建并连接WebSocket客户端
 * @param config 连接配置
 * @returns WebSocket客户端实例
 */
export function createWebSocketClient(config?: ConnectionConfig): WebSocketClient {
  const client = new WebSocketClient(config)
  client.connect()
  return client
}
