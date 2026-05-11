/**
 * 前端配置
 * 支持环境变量覆盖
 */

// 获取环境变量或使用默认值
const getEnvVar = (key: string, defaultValue: string): string => {
  return (import.meta as any).env?.[key] || defaultValue
}

const getEnvBool = (key: string, defaultValue: boolean): boolean => {
  const value = (import.meta as any).env?.[key]
  if (value === 'true') return true
  if (value === 'false') return false
  return defaultValue
}

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = (import.meta as any).env?.[key]
  return value ? parseInt(value, 10) : defaultValue
}

const config = {
  // API 配置
  api: {
    baseURL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000'),
    timeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
    enableRetry: getEnvBool('VITE_API_ENABLE_RETRY', true),
    maxRetries: getEnvNumber('VITE_API_MAX_RETRIES', 3),
  },

  // WebSocket 配置
  websocket: {
    url: getEnvVar('VITE_WS_URL', 'ws://localhost:3000'),
    autoConnect: getEnvBool('VITE_WS_AUTO_CONNECT', true),
    reconnectInterval: getEnvNumber('VITE_WS_RECONNECT_INTERVAL', 3000),
    maxReconnectAttempts: getEnvNumber('VITE_WS_MAX_RECONNECT', 5),
  },

  // 应用配置
  app: {
    name: getEnvVar('VITE_APP_NAME', 'Auto Test Agent'),
    version: getEnvVar('VITE_APP_VERSION', '0.1.0'),
    title: getEnvVar('VITE_APP_TITLE', '自动化测试控制台'),
    description: getEnvVar('VITE_APP_DESCRIPTION', '智能化自动化测试平台'),
  },

  // UI 配置
  ui: {
    theme: getEnvVar('VITE_UI_THEME', 'light'), // light, dark, auto
    language: getEnvVar('VITE_UI_LANGUAGE', 'zh-CN'),
    timezone: getEnvVar('VITE_UI_TIMEZONE', 'Asia/Shanghai'),
    enableAnimations: getEnvBool('VITE_UI_ENABLE_ANIMATIONS', true),
  },

  // 功能开关
  features: {
    enableWebSocket: getEnvBool('VITE_FEATURE_WEBSOCKET', true),
    enableMock: getEnvBool('VITE_FEATURE_MOCK', true),
    enableLogs: getEnvBool('VITE_FEATURE_LOGS', true),
    enableScreenshots: getEnvBool('VITE_FEATURE_SCREENSHOTS', true),
    enableReports: getEnvBool('VITE_FEATURE_REPORTS', true),
  },

  // 开发配置
  development: {
    enableDebug: getEnvBool('VITE_DEV_DEBUG', (import.meta as any).env?.DEV),
    enableMockData: getEnvBool('VITE_DEV_MOCK_DATA', false),
    logLevel: getEnvVar('VITE_DEV_LOG_LEVEL', 'info'), // debug, info, warn, error
  },
}

export default config

// 导出类型
export type Config = typeof config

/**
 * 获取服务器 URL
 */
export function getServerUrl(): string {
  return config.api.baseURL
}

/**
 * 获取 WebSocket URL
 */
export function getWebSocketUrl(): string {
  return config.websocket.url
}

/**
 * 是否为开发模式
 */
export function isDevelopment(): boolean {
  return (import.meta as any).env?.DEV
}

/**
 * 是否启用调试
 */
export function isDebugMode(): boolean {
  return config.development.enableDebug
}

/**
 * 获取配置摘要
 */
export function getConfigSummary(): Record<string, unknown> {
  return {
    app: config.app,
    api: {
      baseURL: config.api.baseURL,
      timeout: config.api.timeout,
    },
    websocket: {
      url: config.websocket.url,
      autoConnect: config.websocket.autoConnect,
    },
    ui: config.ui,
    features: config.features,
    development: config.development,
  }
}
