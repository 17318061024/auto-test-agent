/**
 * 配置管理
 * 统一管理所有环境变量和配置
 */

// 获取项目根目录
export const PROJECT_ROOT = process.cwd()

export const config = {
  // 服务器配置
  server: {
    host: process.env.SERVER_HOST || 'localhost',
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

  // 路径配置
  paths: {
    // 数据目录
    dataDir: process.env.DATA_DIR || './data',
    // 日志目录
    logsDir: process.env.LOGS_DIR || './logs',
    // 临时文件目录
    tempDir: process.env.TEMP_DIR || './temp',
    // 截图目录
    screenshotsDir: process.env.SCREENSHOTS_DIR || './data/screenshots',
    // 报告目录
    reportsDir: process.env.REPORTS_DIR || './data/reports',
    // 任务数据目录
    tasksDir: process.env.TASKS_DIR || './data/tasks',
  },

  // 数据库配置
  database: {
    url: process.env.DATABASE_URL || './data/tasks.db',
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/server.log',
    maxSize: parseInt(process.env.LOG_MAX_SIZE || '10485760', 10), // 10MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
  },

  // 任务执行配置
  task: {
    timeout: parseInt(process.env.TASK_TIMEOUT || '30000', 10),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    defaultHeadless: process.env.DEFAULT_HEADLESS === 'true',
    screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE !== 'false', // 默认开启
    slowMo: parseInt(process.env.SLOW_MO || '0', 10), // 慢速模式延迟
  },

  // Playwright 配置
  playwright: {
    browsersPath: process.env.PLAYWRIGHT_BROWSERS_PATH || '0',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chromium',
    devtools: process.env.PLAYWRIGHT_DEVTOOLS === 'true',
  },

  // 客户端配置
  client: {
    heartbeatInterval: parseInt(process.env.CLIENT_HEARTBEAT_INTERVAL || '30000', 10),
    timeout: parseInt(process.env.CLIENT_TIMEOUT || '60000', 10),
    maxReconnectAttempts: parseInt(process.env.CLIENT_MAX_RECONNECT || '5', 10),
  },

  // API 配置
  api: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15分钟
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  // 性能配置
  performance: {
    enableProfiling: process.env.ENABLE_PROFILING === 'true',
    enableMetrics: process.env.ENABLE_METRICS !== 'false', // 默认开启
  },
} as const

export type Config = typeof config

/**
 * 获取服务器 URL
 */
export function getServerUrl(): string {
  const { host, port } = config.server
  const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
  return `${protocol}://${host}:${port}`
}

/**
 * 获取 WebSocket URL
 */
export function getWebSocketUrl(): string {
  const { host, wsPort } = config.server
  const protocol = process.env.WSS === 'true' ? 'wss' : 'ws'
  return `${protocol}://${host}:${wsPort}`
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

/**
 * 是否启用调试模式
 */
export function isDebug(): boolean {
  return process.env.DEBUG === 'true' || isDevelopment()
}

/**
 * 验证配置
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 验证端口
  if (config.server.port < 1 || config.server.port > 65535) {
    errors.push(`无效的服务器端口: ${config.server.port}`)
  }
  if (config.server.wsPort < 1 || config.server.wsPort > 65535) {
    errors.push(`无效的 WebSocket 端口: ${config.server.wsPort}`)
  }

  // 验证超时设置
  if (config.task.timeout < 1000) {
    errors.push(`任务超时时间过短: ${config.task.timeout}ms`)
  }
  if (config.client.heartbeatInterval < 1000) {
    errors.push(`心跳间隔过短: ${config.client.heartbeatInterval}ms`)
  }

  // 验证重试次数
  if (config.task.maxRetries < 0 || config.task.maxRetries > 10) {
    errors.push(`重试次数设置不合理: ${config.task.maxRetries}`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 获取配置摘要
 */
export function getConfigSummary(): Record<string, unknown> {
  return {
    environment: config.server.nodeEnv,
    server: {
      url: getServerUrl(),
      wsUrl: getWebSocketUrl(),
    },
    paths: config.paths,
    task: {
      timeout: config.task.timeout,
      maxRetries: config.task.maxRetries,
    },
    cors: config.cors.allowedOrigins,
  }
}
