/**
 * 客户端控制器
 */

import { Controller, Get, Inject } from '@nestjs/common'
import { ClientsService } from './clients.service.js'

@Controller('api/clients')
export class ClientsController {
  constructor(@Inject(ClientsService) private readonly clientsService: ClientsService) {}

  @Get()
  findAll() {
    return this.clientsService.findAll()
  }

  @Get('online')
  findOnline() {
    return this.clientsService.findOnline()
  }
}
