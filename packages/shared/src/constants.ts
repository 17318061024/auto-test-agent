/**
 * 应用常量
 */

export const APP_NAME = 'auto-test-agent'

export const APP_VERSION = '0.1.0'

export const PROTOCOL_SCHEME = 'midscene'

// 默认配置
export const DEFAULT_CONFIG = {
  // 服务器配置
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
  WS_URL: process.env.WS_URL || 'ws://localhost:3001',

  // 任务配置
  TASK_TIMEOUT: 30000, // 30s
  TASK_RETRIES: 3,

  // 浏览器配置
  BROWSER_HEADLESS: false,
  BROWSER_TIMEOUT: 30000,

  // 日志配置
  LOG_LEVEL: 'info',
  LOG_MAX_SIZE: 100 * 1024 * 1024, // 100MB

  // 性能阈值
  PERFORMANCE_THRESHOLD: 10000, // 10s
} as const

// WebSocket 配置
export const WS_CONFIG = {
  RECONNECT_INTERVAL: 3000, // 3s
  MAX_RECONNECT_ATTEMPTS: 10,
  HEARTBEAT_INTERVAL: 30000, // 30s
} as const

// 文件路径
export const PATHS = {
  USER_DATA: '%APPDATA%/auto-test-agent',
  LOGS: '%APPDATA%/auto-test-agent/logs',
  SCREENSHOTS: '%APPDATA%/auto-test-agent/screenshots',
  TASKS: '%APPDATA%/auto-test-agent/tasks',
} as const
