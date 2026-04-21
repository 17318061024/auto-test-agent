# Auto Test Agent - 配置管理指南

## 🚀 快速配置指南

本文档提供了所有可配置变量的集中管理，方便快速配置和部署。

## 📋 配置文件位置

- **主配置文件**: `packages/shared/src/config.ts`
- **环境变量**: `.env` 文件 (项目根目录)
- **用户配置**: `~/.auto-test-agent/config.json` (用户主目录)

## 🔧 核心配置项

### 服务器配置

```bash
# 服务器地址
SERVER_HOST=localhost
SERVER_PORT=3000
WS_PORT=3001
API_BASE_PATH=/api
SERVER_TIMEOUT=30000
```

### 客户端配置

```bash
# 客户端基本设置
CLIENT_NAME=auto-test-agent
CLIENT_VERSION=0.2.0
RECONNECT_INTERVAL=3000
MAX_RECONNECT_ATTEMPTS=5
HEARTBEAT_INTERVAL=30000
```

### 任务执行配置

```bash
# 任务执行参数
MAX_RETRIES=3
RETRY_DELAY=2000
STEP_TIMEOUT=30000
HEADLESS=true
PERFORMANCE_THRESHOLD=10000
AUTO_OPTIMIZATION=true
PERFORMANCE_MONITORING=true
```

### Chrome 配置

```bash
# Chrome 浏览器设置
PREFER_SYSTEM_CHROME=true
CHROME_PATH=
CHROME_DEBUG_PORT=9222
```

### 日志配置

```bash
# 日志系统设置
LOG_LEVEL=info
ENABLE_FILE_LOGGING=true
LOG_FILE_PATH=./logs
MAX_LOG_FILE_SIZE=10
LOG_RETENTION_DAYS=7
```

### UI 配置

```bash
# 界面设置
ENABLE_FULLSCREEN_LOGS=true
ENABLE_ERROR_ASSISTANT=true
LOG_REFRESH_INTERVAL=1000
```

### 路径配置

```bash
# 数据存储路径
DATA_DIR=./data
LOGS_DIR=./logs
TEMP_DIR=./temp
SCREENSHOTS_DIR=./data/screenshots
REPORTS_DIR=./data/reports
TASKS_DIR=./data/tasks
```

## 🌐 网络配置

### CORS 设置

```bash
# 允许的跨域源
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### API 限流

```bash
# API 速率限制
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## 🔐 安全配置

### HTTPS/WSS

```bash
# 启用 HTTPS 和 WSS
HTTPS=false
WSS=false
```

## 📊 性能配置

### 性能监控

```bash
# 性能分析
ENABLE_PROFILING=false
ENABLE_METRICS=true
```

### Playwright 配置

```bash
# Playwright 特定设置
PLAYWRIGHT_BROWSERS_PATH=0
PLAYWRIGHT_CHANNEL=chromium
PLAYWRIGHT_DEVTOOLS=false
```

## 🛠️ 配置管理 API

### 获取配置

```typescript
import { config } from '@auto-test-agent/shared'

// 获取完整配置
const appConfig = config.getConfig()

// 获取特定配置
const serverConfig = config.getServerConfig()
const taskConfig = config.getTaskExecutorConfig()
const chromeConfig = config.getChromeConfig()
```

### 更新配置

```typescript
// 更新配置
config.updateConfig({
  taskExecutor: {
    maxRetries: 5,
    stepTimeout: 60000
  }
})
```

### 验证配置

```typescript
import { validateConfig } from '@auto-test-agent/shared'

const validation = validateConfig()
if (!validation.valid) {
  console.error('配置错误:', validation.errors)
}
```

## 🎯 环境特定配置

### 开发环境

```bash
NODE_ENV=development
DEBUG=true
HEADLESS=false
LOG_LEVEL=debug
```

### 生产环境

```bash
NODE_ENV=production
DEBUG=false
HEADLESS=true
LOG_LEVEL=warn
```

### 测试环境

```bash
NODE_ENV=test
DEBUG=true
HEADLESS=true
LOG_LEVEL=info
```

## 📝 配置文件示例

### .env 文件示例

```bash
# Auto Test Agent 配置文件
# 复制此文件为 .env 并根据需要修改

# 服务器配置
SERVER_HOST=localhost
SERVER_PORT=3000
WS_PORT=3001

# 任务执行配置
MAX_RETRIES=3
STEP_TIMEOUT=30000
HEADLESS=true

# Chrome 配置
PREFER_SYSTEM_CHROME=true

# 日志配置
LOG_LEVEL=info
ENABLE_FILE_LOGGING=true
```

### TypeScript 配置文件示例

```typescript
import { config, AppConfig } from '@auto-test-agent/shared'

// 自定义配置
const customConfig: Partial<AppConfig> = {
  taskExecutor: {
    maxRetries: 5,
    retryDelay: 3000,
    stepTimeout: 60000,
    headless: false
  },
  server: {
    host: '192.168.1.100',
    port: 8080
  }
}

// 应用自定义配置
config.updateConfig(customConfig)
```

## 🔄 配置优先级

配置按以下优先级加载（高到低）：

1. **环境变量** - 最高优先级
2. **用户配置文件** - `~/.auto-test-agent/config.json`
3. **项目 .env 文件**
4. **默认配置** - `packages/shared/src/config.ts`

## 🚨 常见配置问题

### 问题 1: Chrome 找不到

**解决方案**: 设置 `CHROME_PATH` 或启用 `PREFER_SYSTEM_CHROME=true`

### 问题 2: 端口被占用

**解决方案**: 修改 `SERVER_PORT` 和 `WS_PORT`

### 问题 3: 权限错误

**解决方案**: 检查 `DATA_DIR` 和 `LOGS_DIR` 的写入权限

## 📚 更多信息

- [完整配置参考](../packages/shared/src/config.ts)
- [环境变量说明](./ENV_VARIABLES.md)
- [部署配置指南](./DEPLOYMENT.md)

---
**最后更新**: 2026-04-21
**版本**: 1.0.0