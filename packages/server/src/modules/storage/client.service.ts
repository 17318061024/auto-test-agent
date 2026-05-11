/**
 * 客户端存储服务
 */

import { Injectable } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'

export interface Client {
  id: string
  name: string
  status: 'online' | 'offline' | 'busy'
  lastSeen: string
  metadata: Record<string, any>
}

@Injectable()
export class ClientService {
  private clients: Map<string, Client> = new Map()

  create(data: Omit<Client, 'id' | 'lastSeen'>): Client {
    const client: Client = {
      id: uuidv4(),
      ...data,
      lastSeen: new Date().toISOString(),
    }
    this.clients.set(client.id, client)
    return client
  }

  findAll(): Client[] {
    return Array.from(this.clients.values())
  }

  findOne(id: string): Client | undefined {
    return this.clients.get(id)
  }

  update(id: string, data: Partial<Client>): Client | undefined {
    const client = this.clients.get(id)
    if (!client) return undefined

    const updatedClient = {
      ...client,
      ...data,
      id: client.id,
      lastSeen: new Date().toISOString(),
    }
    this.clients.set(id, updatedClient)
    return updatedClient
  }

  updateStatus(id: string, status: Client['status']): Client | undefined {
    return this.update(id, { status })
  }

  delete(id: string): boolean {
    return this.clients.delete(id)
  }

  getOnlineClients(): Client[] {
    return this.findAll().filter(client => client.status === 'online')
  }

  findBySocketId(socketId: string): Client | undefined {
    return this.findAll().find(c => c.metadata?.socketId === socketId)
  }

  findOnlineById(id: string): Client | undefined {
    const client = this.findOne(id)
    if (client && client.status === 'online') return client
    return undefined
  }
}
