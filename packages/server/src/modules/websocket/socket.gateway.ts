/**
 * WebSocket 网关
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ClientService } from '../storage/client.service.js'
import { TaskService } from '../storage/task.service.js'
import { Logger } from '@nestjs/common'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(SocketGateway.name)

  constructor(
    private readonly clientService: ClientService,
    private readonly taskService: TaskService,
  ) {
    this.logger.log('SocketGateway constructed')
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)

    this.clientService.create({
      name: `Client-${client.id.substr(0, 8)}`,
      status: 'online',
      metadata: { socketId: client.id },
    })

    this.broadcastClients()
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)

    const disconnectedClient = this.clientService.findBySocketId(client.id)
    if (disconnectedClient) {
      this.clientService.updateStatus(disconnectedClient.id, 'offline')

      // 将该客户端正在执行的任务标记为 failed
      const runningTasks = this.taskService.findAll().filter(
        t => t.assignedClientId === disconnectedClient.id && t.status === 'running',
      )
      for (const task of runningTasks) {
        this.taskService.updateStatus(task.id, 'failed')
        this.server.emit('task:updated', {
          taskId: task.id,
          status: 'failed',
          result: { error: '客户端断开连接' },
        })
      }
    }

    this.broadcastClients()
  }

  @SubscribeMessage('client:register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { type?: string; platform?: string; arch?: string; version?: string; hostname?: string },
  ) {
    const existing = this.clientService.findBySocketId(client.id)
    if (!existing) return

    const displayName = data.hostname || data.type || `Client-${client.id.substr(0, 8)}`
    this.clientService.update(existing.id, {
      name: displayName,
      metadata: {
        ...existing.metadata,
        ...data,
        socketId: client.id,
      },
    })

    this.logger.log(`Client registered: ${displayName} (${data.platform || 'unknown'})`)
    this.broadcastClients()
  }

  @SubscribeMessage('client:heartbeat')
  handleHeartbeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() _data: any,
  ) {
    const existing = this.clientService.findBySocketId(client.id)
    if (existing) {
      this.clientService.update(existing.id, { status: 'online' })
    }
  }

  @SubscribeMessage('task:progress')
  handleTaskProgress(
    @ConnectedSocket() _client: Socket,
    @MessageBody() data: { taskId: string; status: string; currentStep?: number; totalSteps?: number; progress?: number },
  ) {
    this.server.emit('task:updated', data)
  }

  @SubscribeMessage('task:completed')
  handleTaskCompleted(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string; result?: any },
  ) {
    this.logger.log(`Task completed: ${data.taskId}`)
    this.taskService.updateStatus(data.taskId, 'completed')

    // 客户端恢复 online
    const existing = this.clientService.findBySocketId(client.id)
    if (existing) {
      this.clientService.updateStatus(existing.id, 'online')
    }

    this.server.emit('task:updated', {
      taskId: data.taskId,
      status: 'completed',
      result: data.result,
    })

    this.broadcastClients()
  }

  @SubscribeMessage('task:failed')
  handleTaskFailed(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string; error?: string },
  ) {
    this.logger.log(`Task failed: ${data.taskId} - ${data.error}`)
    this.taskService.updateStatus(data.taskId, 'failed')

    const existing = this.clientService.findBySocketId(client.id)
    if (existing) {
      this.clientService.updateStatus(existing.id, 'online')
    }

    this.server.emit('task:updated', {
      taskId: data.taskId,
      status: 'failed',
      result: { error: data.error },
    })

    this.broadcastClients()
  }

  assignTask(clientId: string, task: any) {
    const client = this.clientService.findOne(clientId)
    if (!client?.metadata?.socketId) {
      throw new Error('Client not found or offline')
    }

    this.server.to(client.metadata.socketId).emit('task:assigned', task)
    this.logger.log(`Task assigned to client: ${clientId}`)
  }

  getOnlineClients() {
    return this.clientService.getOnlineClients()
  }

  private broadcastClients() {
    const clients = this.clientService.findAll()
    this.server.emit('clients:list', clients)
  }
}
