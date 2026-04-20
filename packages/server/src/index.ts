/**
 * @auto-test-agent/server
 *
 * 后端服务器
 */

import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import { config } from '@auto-test-agent/shared'
import { WSHandler } from './websocket/handler.js'
import { createTasksRouter } from './routes/tasks.js'
import { createClientsRouter } from './routes/clients.js'
import { createReportsRouter } from './routes/reports.js'
import { createMockRoutes } from './routes/mock.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { logger } from './utils/logger.js'

const app = express()
const httpServer = createServer(app)

// 中间件
app.use(cors({
  origin: config.cors.allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}))
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
  res.json({
    status: 'ok',
    version: process.env.npm_package_version || '0.1.0',
    timestamp: Date.now(),
    uptime: process.uptime(),
    environment: config.server.nodeEnv,
    server: {
      http: `http://localhost:${config.server.port}`,
      ws: `ws://localhost:${config.server.wsPort}`,
    }
  })
})

// 404 处理
app.use(notFoundHandler)

// 错误处理
app.use(errorHandler)

// 启动服务器
httpServer.listen(config.server.port, () => {
  console.log(`
┌─────────────────────────────────────────┐
│                                         │
│   Auto Test Agent Server                │
│                                         │
│   Environment: ${config.server.nodeEnv}              │
│   HTTP Server: http://localhost:${config.server.port}    │
│   WebSocket: ws://localhost:${config.server.wsPort}     │
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
