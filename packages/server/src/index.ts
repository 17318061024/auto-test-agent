/**
 * @auto-test-agent/server
 *
 * 后端服务器
 */

import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import { WSHandler } from './websocket/handler.js'
import { createTasksRouter } from './routes/tasks.js'
import { createClientsRouter } from './routes/clients.js'
import { createReportsRouter } from './routes/reports.js'
import { createMockRoutes } from './routes/mock.js'

const PORT = process.env.PORT || 3000
const WS_PORT = process.env.WS_PORT || 3001

const app = express()
const httpServer = createServer(app)

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 初始化 WebSocket
const wsHandler = new WSHandler(httpServer)

// 路由
app.use('/api/tasks', createTasksRouter(wsHandler))
app.use('/api/clients', createClientsRouter())
app.use('/api/reports', createReportsRouter())
app.use('/api/mock', createMockRoutes(wsHandler))

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// 错误处理
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 启动服务器
httpServer.listen(PORT, () => {
  console.log(`
┌─────────────────────────────────────────┐
│                                         │
│   Auto Test Agent Server                │
│                                         │
│   HTTP Server: http://localhost:${PORT}    │
│   WebSocket: ws://localhost:${WS_PORT}     │
│                                         │
└─────────────────────────────────────────┘
  `)
})

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...')
  wsHandler.close()
  httpServer.close()
  process.exit(0)
})
