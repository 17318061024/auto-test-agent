/**
 * 客户端服务
 */

import { Injectable } from '@nestjs/common'
import { ClientService } from '../storage/client.service.js'

@Injectable()
export class ClientsService {
  constructor(private readonly clientService: ClientService) {}

  findAll() {
    return this.clientService.findAll()
  }

  findOnline() {
    return this.clientService.getOnlineClients()
  }

  findOne(id: string) {
    return this.clientService.findOne(id)
  }
}
