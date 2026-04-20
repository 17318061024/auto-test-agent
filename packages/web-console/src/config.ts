/**
 * 前端配置
 */

const config = {
  // API 配置
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 30000,
  },

  // WebSocket 配置
  websocket: {
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
    autoConnect: true,
    reconnectInterval: 3000,
  },

  // 应用配置
  app: {
    name: 'Auto Test Agent',
    version: '0.1.0',
    title: '自动化测试控制台',
  },
}

export default config
