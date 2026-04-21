/**
 * WebSocket 模块
 */

import { Module } from '@nestjs/common'
import { SocketGateway } from './socket.gateway.js'
import { ClientService } from '../storage/client.service.js'
import { TaskService } from '../storage/task.service.js'

@Module({
  imports: [],
  providers: [SocketGateway, ClientService, TaskService],
  exports: [SocketGateway],
})
export class WebsocketModule {}
