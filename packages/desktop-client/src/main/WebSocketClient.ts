/**
 * @auto-test-agent/desktop-client
 *
 * WebSocket客户端
 * 负责与服务端建立实时连接，接收任务指令和发送状态更新
 *
 * 主要功能：
 * - 自动连接和重连
 * - 心跳保持连接
 * - 消息队列管理
 * - 任务状态同步
 */

import { io, Socket } from 'socket.io-client'
import { config } from '@auto-test-agent/shared'
import { EventEmitter } from 'events'
import { app } from 'electron'

/**
 * WebSocket连接状态
 */
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * WebSocket消息类型
 */
export enum WSMessageType {
  // 客户端 → 服务器
  CLIENT_REGISTER = 'client:register',
  CLIENT_HEARTBEAT = 'client:heartbeat',
  TASK_PROGRESS = 'task:progress',
  TASK_COMPLETED = 'task:completed',
  TASK_FAILED = 'task:failed',
  TASK_ERROR = 'task:error',
  LOG = 'log',
  SCREENSHOT = 'screenshot',
  ERROR = 'error',

  // 服务器 → 客户端
  TASK_ASSIGNED = 'task:assigned',
  TASK_START = 'task:start',
  TASK_CANCEL = 'task:cancel',
  STEP_START = 'step:start',
  STEP_COMPLETE = 'step:complete',
  STEP_FAILED = 'step:failed',
  SERVER_PING = 'server:ping',
}

/**
 * WebSocket客户端类
 */
export class WebSocketClient extends EventEmitter {
  private socket: Socket | null = null
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 1000 // 1秒
  private heartbeatInterval: NodeJS.Timeout | null = null
  private messageQueue: any[] = []
  private isManualDisconnect: boolean = false

  /**
   * 连接到WebSocket服务器
   */
  connect(): void {
    if (this.connectionState === ConnectionState.CONNECTED ||
        this.connectionState === ConnectionState.CONNECTING) {
      console.log('🔌 WebSocket已连接或正在连接中')
      return
    }

    console.log('🔌 连接到WebSocket服务器...')
    this.connectionState = ConnectionState.CONNECTING

    try {
      const wsUrl = config.getWebSocketURL()
      console.log(`📡 WebSocket URL: ${wsUrl}`)

      this.socket = io(wsUrl, {
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000,
        transports: ['websocket', 'polling'],
      })

      this.setupEventHandlers()
    } catch (error) {
      console.error('❌ WebSocket连接失败:', error)
      this.connectionState = ConnectionState.ERROR
      this.emit('error', error)
    }
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    if (!this.socket) return

    // 连接成功
    this.socket.on('connect', () => {
      console.log('✅ WebSocket连接成功')
      this.connectionState = ConnectionState.CONNECTED
      this.reconnectAttempts = 0
      this.isManualDisconnect = false

      // 发送客户端注册信息
      this.registerClient()

      // 发送队列中的消息
      this.flushMessageQueue()

      // 开始心跳
      this.startHeartbeat()

      this.emit('connected')
    })

    // 连接错误
    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket连接错误:', error)
      this.connectionState = ConnectionState.ERROR
      this.emit('error', error)
    })

    // 断开连接
    this.socket.on('disconnect', (reason) => {
      console.log(`🔌 WebSocket断开连接: ${reason}`)
      this.connectionState = ConnectionState.DISCONNECTED

      // 停止心跳
      this.stopHeartbeat()

      if (!this.isManualDisconnect && reason !== 'io client disconnect') {
        console.log('🔄 尝试重新连接...')
        this.connectionState = ConnectionState.RECONNECTING
        this.emit('reconnecting')
      }
    })

    // 重连成功
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ WebSocket重连成功 (第${attemptNumber}次尝试)`)
      this.connectionState = ConnectionState.CONNECTED
      this.reconnectAttempts = 0
      this.emit('reconnected', attemptNumber)
    })

    // 重连失败
    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket重连失败')
      this.connectionState = ConnectionState.ERROR
      this.emit('reconnectFailed')
    })

    // 接收服务器消息
    this.setupMessageHandlers()
  }

  /**
   * 设置消息处理器
   */
  private setupMessageHandlers(): void {
    if (!this.socket) return

    // 任务分配
    this.socket.on(WSMessageType.TASK_ASSIGNED, (data) => {
      console.log('📋 收到任务分配:', data)
      this.emit('task:assigned', data)
    })

    // 任务开始
    this.socket.on(WSMessageType.TASK_START, (data) => {
      console.log('🚀 收到任务开始指令:', data)
      this.emit('task:start', data)
    })

    // 任务取消
    this.socket.on(WSMessageType.TASK_CANCEL, (data) => {
      console.log('🛑 收到任务取消指令:', data)
      this.emit('task:cancel', data)
    })

    // 步骤开始
    this.socket.on(WSMessageType.STEP_START, (data) => {
      console.log('📝 步骤开始:', data)
      this.emit('step:start', data)
    })

    // 步骤完成
    this.socket.on(WSMessageType.STEP_COMPLETE, (data) => {
      console.log('✅ 步骤完成:', data)
      this.emit('step:complete', data)
    })

    // 步骤失败
    this.socket.on(WSMessageType.STEP_FAILED, (data) => {
      console.log('❌ 步骤失败:', data)
      this.emit('step:failed', data)
    })

    // 服务器ping
    this.socket.on(WSMessageType.SERVER_PING, () => {
      this.emit('server:ping')
    })
  }

  /**
   * 注册客户端
   */
  private registerClient(): void {
    if (!this.socket || !this.socket.connected) return

    const clientInfo = {
      type: 'desktop-client',
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      hostname: require('os').hostname(),
      timestamp: Date.now(),
    }

    this.send(WSMessageType.CLIENT_REGISTER, clientInfo)
    console.log('📱 客户端已注册:', clientInfo)
  }

  /**
   * 开始心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.send(WSMessageType.CLIENT_HEARTBEAT, {
          timestamp: Date.now(),
        })
      }
    }, 30000) // 每30秒发送一次心跳
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * 发送消息到服务器
   */
  send(event: string, data?: any): boolean {
    if (!this.socket?.connected) {
      console.warn('⚠️ WebSocket未连接，消息加入队列')
      this.messageQueue.push({ event, data, timestamp: Date.now() })
      return false
    }

    try {
      this.socket.emit(event, data)
      console.log(`📤 发送消息: ${event}`, data?.toString?.().substring(0, 100) || '')
      return true
    } catch (error) {
      console.error('❌ 发送消息失败:', error)
      return false
    }
  }

  /**
   * 发送任务进度
   */
  sendTaskProgress(taskId: string, progress: any): boolean {
    return this.send(WSMessageType.TASK_PROGRESS, {
      taskId,
      progress,
      timestamp: Date.now(),
    })
  }

  /**
   * 发送任务完成
   */
  sendTaskCompleted(taskId: string, result: any): boolean {
    return this.send(WSMessageType.TASK_COMPLETED, {
      taskId,
      result,
      timestamp: Date.now(),
    })
  }

  /**
   * 发送任务失败
   */
  sendTaskFailed(taskId: string, error: any): boolean {
    return this.send(WSMessageType.TASK_FAILED, {
      taskId,
      error,
      timestamp: Date.now(),
    })
  }

  /**
   * 发送日志
   */
  sendLog(level: 'info' | 'warn' | 'error', message: string, data?: any): boolean {
    return this.send(WSMessageType.LOG, {
      level,
      message,
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * 发送截图
   */
  sendScreenshot(taskId: string, stepId: string, screenshotPath: string): boolean {
    return this.send(WSMessageType.SCREENSHOT, {
      taskId,
      stepId,
      screenshotPath,
      timestamp: Date.now(),
    })
  }

  /**
   * 清空消息队列
   */
  private flushMessageQueue(): void {
    console.log(`📤 发送队列中的消息: ${this.messageQueue.length}条`)

    while (this.messageQueue.length > 0 && this.socket?.connected) {
      const message = this.messageQueue.shift()
      if (message) {
        this.socket.emit(message.event, message.data)
      }
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    console.log('🔌 断开WebSocket连接')
    this.isManualDisconnect = true
    this.stopHeartbeat()

    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    this.connectionState = ConnectionState.DISCONNECTED
  }

  /**
   * 获取连接状态
   */
  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED && this.socket?.connected === true
  }
}

/**
 * 导出全局WebSocket客户端实例
 */
export const wsClient = new WebSocketClient()
