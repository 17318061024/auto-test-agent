/**
 * 客户端状态存储 (内存存储，生产环境请使用真实数据库)
 */

// 本地类型定义（临时）
export interface ClientInfo {
  id: string
  name: string
  version: string
  platform: string
  status: 'online' | 'offline'
  lastSeen: number
}

export class ClientStore {
  private clients: Map<string, ClientInfo> = new Map()

  constructor() {
    // 内存存储
  }

  /**
   * 注册或更新客户端
   */
  upsert(client: Omit<ClientInfo, 'lastSeen'>): ClientInfo {
    const now = Date.now()

    const newClient: ClientInfo = {
      ...client,
      lastSeen: now,
    }

    this.clients.set(client.id, newClient)
    return newClient
  }

  /**
   * 获取客户端
   */
  get(id: string): ClientInfo | undefined {
    return this.clients.get(id)
  }

  /**
   * 获取所有客户端
   */
  getAll(): ClientInfo[] {
    return Array.from(this.clients.values()).sort((a, b) => b.lastSeen - a.lastSeen)
  }

  /**
   * 获取在线客户端
   */
  getOnline(): ClientInfo[] {
    return this.getAll().filter((client) => client.status === 'online')
  }

  /**
   * 更新客户端状态
   */
  updateStatus(id: string, status: 'online' | 'offline'): ClientInfo | undefined {
    const client = this.clients.get(id)
    if (!client) return undefined

    const updated: ClientInfo = {
      ...client,
      status,
      lastSeen: Date.now(),
    }

    this.clients.set(id, updated)
    return updated
  }

  /**
   * 更新客户端心跳时间
   */
  updateHeartbeat(id: string): ClientInfo | undefined {
    const client = this.clients.get(id)
    if (!client) return undefined

    const updated: ClientInfo = {
      ...client,
      lastSeen: Date.now(),
    }

    this.clients.set(id, updated)
    return updated
  }

  close(): void {
    this.clients.clear()
  }
}
