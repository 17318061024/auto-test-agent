# ⚙️ 配置管理指南

## 📖 概述

本项目采用统一的配置管理系统，支持通过环境变量快速配置所有关键参数，包括服务端路径、端口、数据库连接等。

## 🚀 快速开始

### 1. 复制环境配置文件

```bash
# 复制默认配置
cp .env.example .env

# 如果需要特定环境配置
cp .env.development .env
# 或
cp .env.production .env
```

### 2. 编辑配置文件

根据你的需求修改 `.env` 文件中的配置项。

### 3. 初始化环境

```bash
pnpm config:init
```

这个命令会：
- 创建所有必要的目录
- 验证配置
- 显示当前配置摘要

## 📁 配置文件说明

### 根目录配置文件

| 文件 | 说明 |
|------|------|
| `.env.example` | 通用配置模板，包含所有可配置项 |
| `.env.development` | 开发环境配置 |
| `.env.production` | 生产环境配置 |
| `.env` | 你的实际配置（不要提交到git） |

### 前端配置文件

| 文件 | 位置 | 说明 |
|------|------|------|
| `.env.example` | `packages/web-console/` | 前端配置模板 |
| `.env` | `packages/web-console/` | 前端实际配置 |

## 🔧 主要配置分类

### 1. 服务器配置

```bash
# 服务器主机名 (默认: localhost)
SERVER_HOST=localhost

# HTTP 服务器端口 (默认: 3000)
PORT=3000

# WebSocket 服务器端口 (默认: 3001)
WS_PORT=3001

# 运行环境: development, production
NODE_ENV=development

# 启用 HTTPS
HTTPS=false
```

**快速修改服务端路径：**
```bash
# 修改端口号
PORT=8080
WS_PORT=8081

# 修改主机名
SERVER_HOST=192.168.1.100

# 启用 HTTPS
HTTPS=true
```

### 2. 路径配置

```bash
# 数据目录
DATA_DIR=./data

# 日志目录
LOGS_DIR=./logs

# 截图目录
SCREENSHOTS_DIR=./data/screenshots

# 报告目录
REPORTS_DIR=./data/reports

# 任务数据目录
TASKS_DIR=./data/tasks
```

**快速修改存储路径：**
```bash
# 使用绝对路径
DATA_DIR=D:/auto-test-agent/data
LOGS_DIR=D:/auto-test-agent/logs
SCREENSHOTS_DIR=D:/auto-test-agent/screenshots
```

### 3. CORS 配置

```bash
# 允许的来源，逗号分隔
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**添加新的允许来源：**
```bash
# 允许多个域名
ALLOWED_ORIGINS=http://localhost:5173,https://example.com,https://www.example.com
```

### 4. 任务执行配置

```bash
# 任务超时时间 (毫秒)
TASK_TIMEOUT=30000

# 最大重试次数
MAX_RETRIES=3

# 无头模式 (后台运行)
DEFAULT_HEADLESS=false

# 失败时截图
SCREENSHOT_ON_FAILURE=true

# 慢速模式延迟 (便于观察)
SLOW_MO=500
```

### 5. 数据库配置

```bash
# SQLite 数据库文件路径
DATABASE_URL=./data/tasks.db

# 连接池大小
DATABASE_POOL_SIZE=10
```

## 🛠️ 配置管理工具

### 可用命令

```bash
# 初始化环境（创建目录）
pnpm config:init

# 验证配置
pnpm config:validate

# 显示当前配置
pnpm config:show

# 检查环境文件
pnpm config:check
```

### 使用示例

```bash
# 1. 首次设置环境
pnpm config:init

# 2. 修改配置后验证
pnpm config:validate

# 3. 查看当前配置
pnpm config:show
```

## 🌍 环境切换

### 开发环境

```bash
# 使用开发环境配置
cp .env.development .env
pnpm config:init
```

### 生产环境

```bash
# 使用生产环境配置
cp .env.production .env
pnpm config:init
```

## 📝 前端配置

前端配置通过 Vite 环境变量管理，文件位于 `packages/web-console/.env`

### API 配置

```bash
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:3000

# API 超时时间
VITE_API_TIMEOUT=30000
```

### WebSocket 配置

```bash
# WebSocket 服务器地址
VITE_WS_URL=ws://localhost:3001

# 自动连接
VITE_WS_AUTO_CONNECT=true
```

### 功能开关

```bash
# 启用特定功能
VITE_FEATURE_WEBSOCKET=true
VITE_FEATURE_MOCK=true
VITE_FEATURE_LOGS=true
VITE_FEATURE_SCREENSHOTS=true
VITE_FEATURE_REPORTS=true
```

## 🔍 配置验证

配置管理工具会自动验证：

- ✅ 端口号范围 (1-65535)
- ✅ 超时时间合理性
- ✅ 重试次数范围
- ✅ 路径有效性

## 📋 常见配置场景

### 场景 1: 修改服务器端口

```bash
# 修改 .env 文件
PORT=8080
WS_PORT=8081

# 修改前端配置
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8081
```

### 场景 2: 使用外部存储

```bash
# 所有数据存储到 D 盘
DATA_DIR=D:/auto-test-agent/data
LOGS_DIR=D:/auto-test-agent/logs
SCREENSHOTS_DIR=D:/auto-test-agent/screenshots
REPORTS_DIR=D:/auto-test-agent/reports
DATABASE_URL=D:/auto-test-agent/tasks.db
```

### 场景 3: 网络部署

```bash
# 监听所有网络接口
SERVER_HOST=0.0.0.0

# 允许特定域名
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# 启用 HTTPS
HTTPS=true
WSS=true
```

### 场景 4: 性能优化

```bash
# 增加数据库连接池
DATABASE_POOL_SIZE=20

# 延长任务超时时间
TASK_TIMEOUT=120000

# 启用性能指标
ENABLE_METRICS=true
```

## 🚨 注意事项

### 安全性

- ⚠️ 不要将 `.env` 文件提交到 Git
- ⚠️ 生产环境使用强密码和 HTTPS
- ⚠️ 限制 CORS 允许的来源

### 性能

- 💡 根据硬件资源调整连接池大小
- 💡 合理设置超时时间，避免资源浪费
- 💡 生产环境建议启用无头模式

### 路径

- 💡 使用绝对路径避免路径混淆
- 💡 确保应用有读写权限
- 💡 定期清理日志和临时文件

## 📚 相关文件

- `.env.example` - 通用配置模板
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `packages/shared/src/config.ts` - 配置管理代码
- `packages/web-console/src/config.ts` - 前端配置代码
- `scripts/config.ts` - 配置管理工具

## 🔗 相关命令

```bash
# 环境管理
pnpm config:init        # 初始化环境
pnpm config:validate    # 验证配置
pnpm config:show        # 显示配置
pnpm config:check       # 检查文件

# 开发命令
pnpm dev:server         # 启动服务器
pnpm dev:web            # 启动前端

# 构建命令
pnpm build              # 构建所有包
```

## 💡 最佳实践

1. **首次使用**: 复制 `.env.example` 为 `.env`，运行 `pnpm config:init`
2. **环境切换**: 使用对应环境的配置文件
3. **配置修改**: 修改后运行 `pnpm config:validate` 验证
4. **生产部署**: 使用 `.env.production` 并仔细检查安全配置
5. **定期检查**: 使用 `pnpm config:show` 查看当前配置

---

**需要帮助？** 查看 [README.md](./README.md) 或提交 Issue。
