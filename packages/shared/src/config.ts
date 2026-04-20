/**
 * 配置管理
 * 统一管理所有环境变量和配置
 */

export const config = {
  // 服务器配置
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    wsPort: parseInt(process.env.WS_PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // CORS 配置
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:5173',
      'http://localhost:3000',
    ],
  },

  // 数据库配置
  database: {
    url: process.env.DATABASE_URL || './data/tasks.db',
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/server.log',
  },

  // 任务执行配置
  task: {
    timeout: parseInt(process.env.TASK_TIMEOUT || '30000', 10),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    defaultHeadless: process.env.DEFAULT_HEADLESS === 'true',
  },

  // Playwright 配置
  playwright: {
    browsersPath: process.env.PLAYWRIGHT_BROWSERS_PATH || '0',
  },

  // 客户端配置
  client: {
    heartbeatInterval: parseInt(process.env.CLIENT_HEARTBEAT_INTERVAL || '30000', 10),
    timeout: parseInt(process.env.CLIENT_TIMEOUT || '60000', 10),
  },
} as const

export type Config = typeof config

/**
 * 获取服务器 URL
 */
export function getServerUrl(): string {
  const port = config.server.port
  const host = process.env.SERVER_HOST || 'localhost'
  return `http://${host}:${port}`
}

/**
 * 获取 WebSocket URL
 */
export function getWebSocketUrl(): string {
  const port = config.server.wsPort
  const host = process.env.SERVER_HOST || 'localhost'
  return `ws://${host}:${port}`
}

/**
 * 是否为生产环境
 */
export function isProduction(): boolean {
  return config.server.nodeEnv === 'production'
}

/**
 * 是否为开发环境
 */
export function isDevelopment(): boolean {
  return config.server.nodeEnv === 'development'
}
