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
    this.logger.log('SocketGateway constructed');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)

    if (!this.clientService) {
      this.logger.warn('clientService not injected, skipping client registration')
      return
    }

    // 注册客户端
    this.clientService.create({
      name: `Client-${client.id.substr(0, 8)}`,
      status: 'online',
      metadata: { socketId: client.id },
    })

    // 广播客户端列表
    this.broadcastClients()
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)

    if (!this.clientService) return

    // 更新客户端状态
    const clients = this.clientService.findAll()
    const disconnectedClient = clients.find(
      c => c.metadata?.socketId === client.id,
    )

    if (disconnectedClient) {
      this.clientService.updateStatus(disconnectedClient.id, 'offline')
    }

    // 广播客户端列表
    this.broadcastClients()
  }

  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { name: string },
  ) {
    this.logger.log(`Client registered: ${data.name}`)

    // 更新客户端信息
    const clients = this.clientService.findAll()
    const existingClient = clients.find(
      c => c.metadata?.socketId === client.id,
    )

    if (existingClient) {
      this.clientService.update(existingClient.id, { name: data.name })
    }

    this.broadcastClients()
  }

  @SubscribeMessage('task:update')
  handleTaskUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string; status: string; result?: any },
  ) {
    this.logger.log(`Task update: ${data.taskId} - ${data.status}`)

    // 更新任务状态
    this.taskService.updateStatus(
      data.taskId,
      data.status as any,
    )

    // 广播任务更新
    this.server.emit('task:updated', {
      taskId: data.taskId,
      status: data.status,
      result: data.result,
    })
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
