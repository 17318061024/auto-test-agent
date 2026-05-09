/**
 * @auto-test-agent/server
 *
 * NestJS 服务器入口
 */

import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { logger } from './utils/logger.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  })

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  // 启用 CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })

  const port = process.env.PORT || 3000
  const wsPort = process.env.WS_PORT || 3000

  await app.listen(port)

  console.log(`
┌─────────────────────────────────────────┐
│                                         │
│   Auto Test Agent Server                │
│                                         │
│   Environment: ${process.env.NODE_ENV || 'development'}              │
│   HTTP Server: http://localhost:${port}    │
│   WebSocket: ws://localhost:${wsPort}     │
│                                         │
└─────────────────────────────────────────┘
  `)
}

bootstrap()
