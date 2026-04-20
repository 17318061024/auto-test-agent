/**
 * 客户端 API 路由
 */

import { Router } from 'express'
import { ClientStore } from '../storage/ClientStore.js'

export function createClientsRouter(): Router {
  const router = Router()
  const clientStore = new ClientStore()

  // 获取所有客户端
  router.get('/', (req, res) => {
    const clients = clientStore.getAll()
    res.json(clients)
  })

  // 获取在线客户端
  router.get('/online', (req, res) => {
    const clients = clientStore.getOnline()
    res.json(clients)
  })

  // 获取单个客户端
  router.get('/:id', (req, res) => {
    const client = clientStore.get(req.params.id)
    if (!client) {
      return res.status(404).json({ error: '客户端不存在' })
    }
    res.json(client)
  })

  return router
}
