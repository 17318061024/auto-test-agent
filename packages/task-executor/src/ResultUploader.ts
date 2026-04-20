/**
 * 自动化回传模块
 *
 * 功能：
 * 1. 任务结束后生成 JSON 报文
 * 2. 流式上传：每完成一步实时同步
 * 3. 包含所有截图、耗时数据、报错信息
 */

import { io, Socket } from 'socket.io-client'

export interface StepUploadData {
  taskId: string
  stepId: string
  action: string
  status: 'success' | 'failed'
  duration: number
  timestamp: number
  screenshot?: string
  error?: string
}

export interface TaskUploadData {
  taskId: string
  status: 'running' | 'completed' | 'failed'
  duration: number
  steps: StepUploadData[]
  error?: string
  startedAt: number
  completedAt?: number
}

export interface UploadConfig {
  serverUrl: string
  reconnectInterval: number
  maxReconnectAttempts: number
  uploadInterval: number
}

export class ResultUploader {
  private socket: Socket | null = null
  private config: UploadConfig
  private isConnected: boolean = false
  private uploadQueue: Map<string, TaskUploadData> = new Map()
  private uploadTimer: NodeJS.Timeout | null = null

  constructor(config?: Partial<UploadConfig>) {
    this.config = {
      serverUrl: config?.serverUrl || 'ws://localhost:3001',
      reconnectInterval: config?.reconnectInterval || 3000,
      maxReconnectAttempts: config?.maxReconnectAttempts || 10,
      uploadInterval: config?.uploadInterval || 1000,
    }

    this.connect()
  }

  /**
   * 连接服务器
   */
  private connect(): void {
    console.log(`🔌 连接到服务器: ${this.config.serverUrl}`)

    this.socket = io(this.config.serverUrl, {
      reconnection: true,
      reconnectionDelay: this.config.reconnectInterval,
      reconnectionAttempts: this.config.maxReconnectAttempts,
    })

    this.socket.on('connect', () => {
      console.log('✅ 已连接到服务器')
      this.isConnected = true

      // 注册客户端
      this.socket?.emit('client:register', {
        name: 'auto-test-agent',
        version: '0.1.0',
        platform: process.platform,
      })
    })

    this.socket.on('disconnect', () => {
      console.log('❌ 与服务器断开连接')
      this.isConnected = false
    })

    this.socket.on('connect_error', (error: any) => {
      console.error('连接错误:', error)
    })

    this.socket.on('client:ack', (data: any) => {
      console.log('✅ 客户端已确认:', data)
    })

    // 启动定时上传
    this.startPeriodicUpload()
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.uploadTimer) {
      clearInterval(this.uploadTimer)
      this.uploadTimer = null
    }

    this.socket?.disconnect()
    this.isConnected = false
    console.log('🔌 已断开连接')
  }

  /**
   * 开始任务
   */
  startTask(taskId: string, taskName: string): void {
    const data: TaskUploadData = {
      taskId,
      status: 'running',
      duration: 0,
      steps: [],
      startedAt: Date.now(),
    }

    this.uploadQueue.set(taskId, data)

    // 实时上传任务开始事件
    this.emit('task:started', {
      taskId,
      taskName,
      timestamp: Date.now(),
    })
  }

  /**
   * 上传步骤进度（流式上传）
   */
  uploadStep(stepData: StepUploadData): void {
    const taskData = this.uploadQueue.get(stepData.taskId)
    if (!taskData) {
      console.warn(`任务不存在: ${stepData.taskId}`)
      return
    }

    // 添加步骤到任务数据
    taskData.steps.push(stepData)
    taskData.duration = Date.now() - taskData.startedAt

    // 实时上传步骤进度
    this.emit('task:progress', {
      taskId: stepData.taskId,
      currentStep: taskData.steps.length,
      step: stepData,
    })

    console.log(`📤 步骤 ${taskData.steps.length} 已上传: ${stepData.action}`)
  }

  /**
   * 完成任务
   */
  completeTask(
    taskId: string,
    status: 'completed' | 'failed',
    result?: {
      error?: string
      screenshots?: string[]
    }
  ): void {
    const taskData = this.uploadQueue.get(taskId)
    if (!taskData) {
      console.warn(`任务不存在: ${taskId}`)
      return
    }

    taskData.status = status
    taskData.completedAt = Date.now()
    taskData.duration = taskData.completedAt - taskData.startedAt

    if (result?.error) {
      taskData.error = result.error
    }

    // 生成完整的任务报告
    const report = this.generateReport(taskData, result)

    // 上传任务完成事件
    this.emit('task:completed', report)

    console.log(`✅ 任务 ${status}: ${taskId}`)
    console.log(`   总耗时: ${taskData.duration}ms`)
    console.log(`   步骤数: ${taskData.steps.length}`)

    // 从队列中移除
    setTimeout(() => {
      this.uploadQueue.delete(taskId)
    }, 60000) // 保留 1 分钟后删除
  }

  /**
   * 上传错误
   */
  uploadError(taskId: string, error: Error, context?: any): void {
    this.emit('task:error', {
      taskId,
      error: {
        message: error.message,
        stack: error.stack,
        context,
      },
      timestamp: Date.now(),
    })

    console.error(`❌ 错误已上传: ${taskId}`, error)
  }

  /**
   * 生成任务报告
   */
  private generateReport(taskData: TaskUploadData, result?: any): any {
    return {
      taskId: taskData.taskId,
      status: taskData.status,
      duration: taskData.duration,
      steps: taskData.steps,
      error: taskData.error,
      startedAt: taskData.startedAt,
      completedAt: taskData.completedAt,
      screenshots: result?.screenshots || [],
      summary: this.generateSummary(taskData),
    }
  }

  /**
   * 生成任务摘要
   */
  private generateSummary(taskData: TaskUploadData): {
    totalSteps: number
    successSteps: number
    failedSteps: number
    avgDuration: number
    maxDuration: number
    bottlenecks: Array<{ stepId: string; action: string; duration: number }>
  } {
    const totalSteps = taskData.steps.length
    const successSteps = taskData.steps.filter((s) => s.status === 'success').length
    const failedSteps = taskData.steps.filter((s) => s.status === 'failed').length

    const durations = taskData.steps.map((s) => s.duration)
    const avgDuration =
      durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0

    // 找出性能瓶颈（超过 10 秒的步骤）
    const threshold = 10000
    const bottlenecks = taskData.steps
      .filter((s) => s.duration > threshold)
      .map((s) => ({
        stepId: s.stepId,
        action: s.action,
        duration: s.duration,
      }))
      .sort((a, b) => b.duration - a.duration)

    return {
      totalSteps,
      successSteps,
      failedSteps,
      avgDuration,
      maxDuration,
      bottlenecks,
    }
  }

  /**
   * 启动定时上传
   */
  private startPeriodicUpload(): void {
    this.uploadTimer = setInterval(() => {
      // 上传所有进行中的任务进度
      for (const [taskId, taskData] of this.uploadQueue.entries()) {
        if (taskData.status === 'running') {
          taskData.duration = Date.now() - taskData.startedAt

          this.emit('task:heartbeat', {
            taskId,
            duration: taskData.duration,
            stepsCompleted: taskData.steps.length,
            timestamp: Date.now(),
          })
        }
      }
    }, this.config.uploadInterval)
  }

  /**
   * 发送事件
   */
  private emit(event: string, data: any): void {
    if (!this.isConnected || !this.socket) {
      console.warn('未连接到服务器，无法发送事件')
      return
    }

    this.socket.emit(event, data)
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  /**
   * 获取上传队列
   */
  getUploadQueue(): Map<string, TaskUploadData> {
    return new Map(this.uploadQueue)
  }

  /**
   * 清空上传队列
   */
  clearQueue(): void {
    this.uploadQueue.clear()
    console.log('🗑️  上传队列已清空')
  }

  /**
   * 重新连接
   */
  reconnect(): void {
    this.disconnect()
    setTimeout(() => {
      this.connect()
    }, 1000)
  }

  /**
   * 发送心跳
   */
  sendHeartbeat(): void {
    this.emit('heartbeat', {
      timestamp: Date.now(),
    })
  }
}
