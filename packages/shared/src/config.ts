/**
 * @auto-test-agent/shared
 *
 * 统一配置管理系统
 * 集中管理所有可配置变量，方便快速配置和部署
 */

// 获取项目根目录
export const PROJECT_ROOT = process.cwd()

/**
 * 环境类型枚举
 */
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * 服务端配置接口
 */
export interface ServerConfig {
  /** 服务器地址 */
  host: string
  /** HTTP 端口 */
  port: number
  /** WebSocket 端口 */
  wsPort: number
  /** API 基础路径 */
  apiBasePath: string
  /** 超时时间（毫秒） */
  timeout: number
}

/**
 * 客户端配置接口
 */
export interface ClientConfig {
  /** 客户端名称 */
  name: string
  /** 版本号 */
  version: string
  /** 重连间隔（毫秒） */
  reconnectInterval: number
  /** 最大重连次数 */
  maxReconnectAttempts: number
  /** 心跳间隔（毫秒） */
  heartbeatInterval: number
}

/**
 * 任务执行配置接口
 */
export interface TaskExecutorConfig {
  /** 最大重试次数 */
  maxRetries: number
  /** 重试延迟（毫秒） */
  retryDelay: number
  /** 单步超时（毫秒） */
  stepTimeout: number
  /** 是否启用影子执行模式（headful） */
  headless: boolean
  /** 性能瓶颈阈值（毫秒） */
  performanceThreshold: number
  /** 是否启用自动优化 */
  autoOptimization: boolean
  /** 是否启用性能监控 */
  performanceMonitoring: boolean
}

/**
 * Chrome 配置接口
 */
export interface ChromeConfig {
  /** 是否优先使用系统 Chrome */
  preferSystemChrome: boolean
  /** Chrome 可执行文件路径（可选） */
  executablePath?: string
  /** 远程调试端口 */
  debugPort: number
  /** 启动参数 */
  launchArgs: string[]
}

/**
 * 日志配置接口
 */
export interface LoggingConfig {
  /** 日志级别 */
  level: 'debug' | 'info' | 'warn' | 'error'
  /** 是否启用文件日志 */
  enableFileLogging: boolean
  /** 日志文件路径 */
  logFilePath: string
  /** 最大日志文件大小（MB） */
  maxLogFileSize: number
  /** 保留日志天数 */
  logRetentionDays: number
}

/**
 * UI 配置接口
 */
export interface UIConfig {
  /** 是否启用全屏日志 */
  enableFullscreenLogs: boolean
  /** 是否启用错误诊断助手 */
  enableErrorAssistant: boolean
  /** 日志刷新频率（毫秒） */
  logRefreshInterval: number
}

/**
 * 应用完整配置接口
 */
export interface AppConfig {
  /** 当前环境 */
  env: Environment
  /** 服务端配置 */
  server: ServerConfig
  /** 客户端配置 */
  client: ClientConfig
  /** 任务执行配置 */
  taskExecutor: TaskExecutorConfig
  /** Chrome 配置 */
  chrome: ChromeConfig
  /** 日志配置 */
  logging: LoggingConfig
  /** UI 配置 */
  ui: UIConfig
}

/**
 * 默认配置对象
 * 所有配置项都有合理的默认值，可以根据环境变量覆盖
 */
export const defaultConfig: AppConfig = {
  // 环境配置
  env: Environment.DEVELOPMENT,

  // 服务端配置
  server: {
    host: process.env.SERVER_HOST || 'localhost',
    port: parseInt(process.env.SERVER_PORT || '3000', 10),
    wsPort: parseInt(process.env.WS_PORT || '3001', 10),
    apiBasePath: process.env.API_BASE_PATH || '/api',
    timeout: parseInt(process.env.SERVER_TIMEOUT || '30000', 10),
  },

  // 客户端配置
  client: {
    name: process.env.CLIENT_NAME || 'auto-test-agent',
    version: process.env.npm_package_version || '0.2.0',
    reconnectInterval: parseInt(process.env.RECONNECT_INTERVAL || '3000', 10),
    maxReconnectAttempts: parseInt(process.env.MAX_RECONNECT_ATTEMPTS || '5', 10),
    heartbeatInterval: parseInt(process.env.HEARTBEAT_INTERVAL || '30000', 10),
  },

  // 任务执行配置
  taskExecutor: {
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.RETRY_DELAY || '2000', 10),
    stepTimeout: parseInt(process.env.STEP_TIMEOUT || '30000', 10),
    headless: process.env.HEADLESS !== 'false', // 默认无头模式
    performanceThreshold: parseInt(process.env.PERFORMANCE_THRESHOLD || '10000', 10),
    autoOptimization: process.env.AUTO_OPTIMIZATION !== 'false',
    performanceMonitoring: process.env.PERFORMANCE_MONITORING !== 'false',
  },

  // Chrome 配置
  chrome: {
    preferSystemChrome: process.env.PREFER_SYSTEM_CHROME !== 'false',
    executablePath: process.env.CHROME_PATH,
    debugPort: parseInt(process.env.CHROME_DEBUG_PORT || '9222', 10),
    launchArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
    ],
  },

  // 日志配置
  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info',
    enableFileLogging: process.env.ENABLE_FILE_LOGGING !== 'false',
    logFilePath: process.env.LOG_FILE_PATH || './logs',
    maxLogFileSize: parseInt(process.env.MAX_LOG_FILE_SIZE || '10', 10),
    logRetentionDays: parseInt(process.env.LOG_RETENTION_DAYS || '7', 10),
  },

  // UI 配置
  ui: {
    enableFullscreenLogs: true,
    enableErrorAssistant: true,
    logRefreshInterval: parseInt(process.env.LOG_REFRESH_INTERVAL || '1000', 10),
  },
}

/**
 * 配置管理类
 * 提供配置的读取、更新和验证功能
 */
export class ConfigManager {
  private config: AppConfig

  constructor(customConfig?: Partial<AppConfig>) {
    // 合并默认配置和自定义配置
    this.config = this.mergeConfig(defaultConfig, customConfig)
    this.validateConfig()
  }

  /**
   * 获取完整配置
   */
  getConfig(): AppConfig {
    return this.config
  }

  /**
   * 获取服务端配置
   */
  getServerConfig(): ServerConfig {
    return this.config.server
  }

  /**
   * 获取客户端配置
   */
  getClientConfig(): ClientConfig {
    return this.config.client
  }

  /**
   * 获取任务执行配置
   */
  getTaskExecutorConfig(): TaskExecutorConfig {
    return this.config.taskExecutor
  }

  /**
   * 获取 Chrome 配置
   */
  getChromeConfig(): ChromeConfig {
    return this.config.chrome
  }

  /**
   * 获取日志配置
   */
  getLoggingConfig(): LoggingConfig {
    return this.config.logging
  }

  /**
   * 获取 UI 配置
   */
  getUIConfig(): UIConfig {
    return this.config.ui
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<AppConfig>): void {
    this.config = this.mergeConfig(this.config, updates)
    this.validateConfig()
  }

  /**
   * 获取 WebSocket 服务器 URL
   */
  getWebSocketURL(): string {
    return `ws://${this.config.server.host}:${this.config.server.wsPort}`
  }

  /**
   * 获取 HTTP 服务器 URL
   */
  getHTTPURL(): string {
    return `http://${this.config.server.host}:${this.config.server.port}`
  }

  /**
   * 获取 API 基础 URL
   */
  getAPIBaseURL(): string {
    return `${this.getHTTPURL()}${this.config.server.apiBasePath}`
  }

  /**
   * 合并配置对象
   */
  private mergeConfig(base: AppConfig, updates?: Partial<AppConfig>): AppConfig {
    if (!updates) return base

    return {
      env: updates.env || base.env,
      server: { ...base.server, ...updates.server },
      client: { ...base.client, ...updates.client },
      taskExecutor: { ...base.taskExecutor, ...updates.taskExecutor },
      chrome: { ...base.chrome, ...updates.chrome },
      logging: { ...base.logging, ...updates.logging },
      ui: { ...base.ui, ...updates.ui },
    }
  }

  /**
   * 验证配置的有效性
   */
  private validateConfig(): void {
    // 验证端口号范围
    if (this.config.server.port < 1 || this.config.server.port > 65535) {
      throw new Error(`Invalid server port: ${this.config.server.port}`)
    }

    if (this.config.server.wsPort < 1 || this.config.server.wsPort > 65535) {
      throw new Error(`Invalid WebSocket port: ${this.config.server.wsPort}`)
    }

    // 验证超时时间
    if (this.config.server.timeout <= 0) {
      throw new Error(`Invalid server timeout: ${this.config.server.timeout}`)
    }

    // 验证重试次数
    if (this.config.taskExecutor.maxRetries < 0) {
      throw new Error(`Invalid max retries: ${this.config.taskExecutor.maxRetries}`)
    }

    // 验证性能阈值
    if (this.config.taskExecutor.performanceThreshold <= 0) {
      throw new Error(`Invalid performance threshold: ${this.config.taskExecutor.performanceThreshold}`)
    }
  }
}

/**
 * 导出全局配置实例
 * 使用单例模式，确保整个应用使用同一个配置实例
 */
export const config = new ConfigManager()

/**
 * 导出旧的配置接口，保持向后兼容
 */
export const legacyConfig = {
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

export type Config = typeof legacyConfig

/**
 * 获取服务器 URL
 */
export function getServerUrl(): string {
  const { host, port } = legacyConfig.server
  const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
  return `${protocol}://${host}:${port}`
}

/**
 * 获取 WebSocket URL
 */
export function getWebSocketUrl(): string {
  const { host, wsPort } = legacyConfig.server
  const protocol = process.env.WSS === 'true' ? 'wss' : 'ws'
  return `${protocol}://${host}:${wsPort}`
}

/**
 * 是否为生产环境
 */
export function isProduction(): boolean {
  return legacyConfig.server.nodeEnv === 'production'
}

/**
 * 是否为开发环境
 */
export function isDevelopment(): boolean {
  return legacyConfig.server.nodeEnv === 'development'
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
  if (legacyConfig.server.port < 1 || legacyConfig.server.port > 65535) {
    errors.push(`无效的服务器端口: ${legacyConfig.server.port}`)
  }
  if (legacyConfig.server.wsPort < 1 || legacyConfig.server.wsPort > 65535) {
    errors.push(`无效的 WebSocket 端口: ${legacyConfig.server.wsPort}`)
  }

  // 验证超时设置
  if (legacyConfig.task.timeout < 1000) {
    errors.push(`任务超时时间过短: ${legacyConfig.task.timeout}ms`)
  }
  if (legacyConfig.client.heartbeatInterval < 1000) {
    errors.push(`心跳间隔过短: ${legacyConfig.client.heartbeatInterval}ms`)
  }

  // 验证重试次数
  if (legacyConfig.task.maxRetries < 0 || legacyConfig.task.maxRetries > 10) {
    errors.push(`重试次数设置不合理: ${legacyConfig.task.maxRetries}`)
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
    environment: legacyConfig.server.nodeEnv,
    server: {
      url: getServerUrl(),
      wsUrl: getWebSocketUrl(),
    },
    paths: legacyConfig.paths,
    task: {
      timeout: legacyConfig.task.timeout,
      maxRetries: legacyConfig.task.maxRetries,
    },
    cors: legacyConfig.cors.allowedOrigins,
  }
}
