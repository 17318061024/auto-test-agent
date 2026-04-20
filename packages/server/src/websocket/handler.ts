/**
 * WebSocket 处理器
 */

import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { ClientStore } from '../storage/ClientStore.js'
import { TaskStore } from '../storage/TaskStore.js'
import { ReportStore } from '../storage/ReportStore.js'

// 本地事件定义（临时）
export const WSEvents = {
  CLIENT_REGISTER: 'client:register',
  HEARTBEAT: 'heartbeat',
  TASK_ASSIGNED: 'task:assigned',
  TASK_STARTED: 'task:started',
  TASK_PROGRESS: 'task:progress',
  TASK_COMPLETED: 'task:completed',
  TASK_FAILED: 'task:failed',
  TASK_CANCELLED: 'task:cancelled',
  CLIENT_ACK: 'client:ack',
} as const

export class WSHandler {
  private io: SocketIOServer
  private clientStore: ClientStore
  private taskStore: TaskStore
  private reportStore: ReportStore

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    this.clientStore = new ClientStore()
    this.taskStore = new TaskStore()
    this.reportStore = new ReportStore()

    this.setupHandlers()
  }

  private setupHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`客户端连接: ${socket.id}`)

      // 客户端注册
      socket.on(WSEvents.CLIENT_REGISTER, (data) => {
        console.log('客户端注册:', data)
        const client = this.clientStore.upsert({
          id: socket.id,
          name: data.name || 'Unknown',
          version: data.version || '0.0.0',
          platform: data.platform || 'unknown',
          status: 'online',
        })

        // 加入客户端房间
        socket.join(`client:${socket.id}`)

        // 确认注册
        socket.emit(WSEvents.CLIENT_ACK, { clientId: socket.id })
      })

      // 心跳
      socket.on(WSEvents.HEARTBEAT, () => {
        const client = this.clientStore.updateHeartbeat(socket.id)
        if (client) {
          socket.emit(WSEvents.HEARTBEAT, { timestamp: Date.now() })
        }
      })

      // 任务进度
      socket.on(WSEvents.TASK_PROGRESS, (data) => {
        console.log('任务进度:', data)
        // 广播给所有监听该任务的客户端
        this.io.emit(WSEvents.TASK_PROGRESS, data)
      })

      // 任务完成
      socket.on(WSEvents.TASK_COMPLETED, async (data) => {
        console.log('任务完成:', data)

        // 保存报告
        const reportId = this.reportStore.create(data)

        // 广播给所有监听该任务的客户端
        this.io.emit(WSEvents.TASK_COMPLETED, { ...data, reportId })
      })

      // 任务失败
      socket.on(WSEvents.TASK_FAILED, (data) => {
        console.log('任务失败:', data)

        // 保存报告
        this.reportStore.create(data)

        // 广播给所有监听该任务的客户端
        this.io.emit(WSEvents.TASK_FAILED, data)
      })

      // 断开连接
      socket.on('disconnect', () => {
        console.log(`客户端断开: ${socket.id}`)
        this.clientStore.updateStatus(socket.id, 'offline')
      })
    })
  }

  /**
   * 分配任务给客户端
   */
  assignTask(clientId: string, task: any): void {
    this.io.to(`client:${clientId}`).emit(WSEvents.TASK_ASSIGNED, task)
  }

  /**
   * 取消任务
   */
  cancelTask(clientId: string, taskId: string): void {
    this.io.to(`client:${clientId}`).emit(WSEvents.TASK_CANCELLED, { taskId })
  }

  /**
   * 获取在线客户端
   */
  getOnlineClients() {
    return this.clientStore.getOnline()
  }

  /**
   * 关闭
   */
  close(): void {
    this.io.close()
    this.clientStore.close()
    this.taskStore.close()
    this.reportStore.close()
  }
}
