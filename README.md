# Auto Test Agent

> 基于 AI 视觉的浏览器自动化测试工具。通过 Midscene.js 截图 + 大模型视觉识别，无需 CSS 选择器即可完成页面操作。

## 项目结构

```
auto-test-agent/
├── packages/
│   ├── server/            # NestJS 后端服务 (HTTP + WebSocket)
│   ├── desktop-client/    # Electron 桌面客户端 (任务执行 + 可视化)
│   ├── web-console/       # Vue3 Web 控制台 (任务管理 + 日志查看)
│   ├── task-executor/     # 任务执行引擎 (Midscene + Playwright)
│   ├── shared/            # 共享类型、常量、工具函数
│   └── cli/               # 命令行安装工具
├── scripts/               # 辅助脚本
└── config/                # TypeScript 基础配置
```

## 技术栈

| 模块 | 技术 |
|------|------|
| 后端 | NestJS + WebSocket + 内存存储 |
| 桌面端 | Electron + Vue3 + TailwindCSS v4 |
| Web 控制台 | Vue3 + Vite |
| 自动化引擎 | Playwright + Midscene.js (视觉AI) |
| 语言 | TypeScript (全栈) |
| 包管理 | pnpm workspace (monorepo) |

## 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **pnpm** >= 10.0.0

### 1. 安装依赖

```bash
git clone <repo-url>
cd auto-test-agent
pnpm install
```

### 2. 配置视觉 AI 模型

桌面客户端需要一个视觉模型来定位页面元素。在 `packages/desktop-client/` 下创建 `.env` 文件：

```bash
cp packages/desktop-client/.env.example packages/desktop-client/.env
```

编辑 `.env`，填入你的 API Key。支持的模型：

| 模型系列 | MIDSCENE_MODEL_NAME | MIDSCENE_MODEL_FAMILY | MIDSCENE_MODEL_BASE_URL |
|----------|-------------------|----------------------|------------------------|
| 智谱 GLM | `glm-4.6v` | `glm-v` | `https://open.bigmodel.cn/api/paas/v4` |
| 通义千问 | `qwen3-vl-plus` | `qwen3-vl` | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| Google Gemini | `gemini-3-flash` | `gemini` | `https://generativelanguage.googleapis.com/v1beta/openai/` |

完整配置参考: [Midscene 模型配置文档](https://midscenejs.com/model-common-config)

### 3. 安装 Playwright 浏览器

桌面客户端用 Playwright 打开浏览器执行任务：

```bash
cd packages/desktop-client
npx playwright install chromium
```

### 4. 启动服务

**方式一：全部启动**

```bash
pnpm dev
```

**方式二：分别启动（推荐开发时使用）**

```bash
# 终端 1 - 启动后端服务 (端口 3000)
pnpm dev:server

# 终端 2 - 启动 Web 控制台 (端口 5174)
pnpm dev:web

# 终端 3 - 启动桌面客户端 (Electron)
cd packages/desktop-client && pnpm dev
```

### 5. 访问界面

- **Web 控制台**: http://localhost:5174
- **后端 API**: http://localhost:3000
- **桌面客户端**: 自动启动 Electron 窗口

## 运行流程

```
1. Web 控制台 → 创建任务 → POST /api/tasks
2. Web 控制台 → 执行任务 → POST /api/tasks/{id}/run
3. 后端 → 通过 WebSocket 分配任务给桌面客户端
4. 桌面客户端 → 用 Playwright 打开真实浏览器
5. 桌面客户端 → 每一步用 Midscene 截图 + AI 识别 → 操作元素
6. 桌面客户端 → 实时返回步骤进度 → Web/桌面端同步显示
```

## 各包说明

### packages/server (后端)

- 框架: NestJS
- 端口: 3000 (HTTP + WebSocket)
- API 路由: `/api/tasks`, `/api/mock`, `/api/clients`
- WebSocket 事件: `task:assigned`, `task:updated`, `client:register`
- 启动: `pnpm dev:server` 或 `cd packages/server && pnpm dev`

### packages/desktop-client (桌面客户端)

- 框架: Electron + Vue3 + TailwindCSS v4
- 端口: Vite 开发服务器 5173 (仅开发时)
- 入口: `src/main/index.ts` (Electron 主进程), `src/renderer/` (渲染进程)
- 核心功能: 接收 WebSocket 任务 → 用 Playwright 打开浏览器 → Midscene 视觉 AI 执行
- 配置: `packages/desktop-client/.env` (必须配置视觉模型 API Key)
- 启动: `cd packages/desktop-client && pnpm dev`

> **注意**: 首次运行前必须配置 `.env` 文件并安装 Playwright 浏览器，否则任务执行会失败。

### packages/web-console (Web 控制台)

- 框架: Vue3 + Vite
- 端口: 5174
- 配置: `src/config.ts`，支持环境变量覆盖 (见 `.env.example`)
- 启动: `pnpm dev:web` 或 `cd packages/web-console && pnpm dev`

### packages/task-executor (任务执行引擎)

- 提供 TaskRunner、ErrorRecovery、ChromeManager 等模块
- 被 desktop-client 引用
- 启动: 无需单独启动，作为库使用

### packages/shared (共享模块)

- 类型定义、事件常量、工具函数
- 被 server / desktop-client / web-console / task-executor 引用
- 无需单独启动

### packages/cli (命令行工具)

- `npx @auto-test-agent/cli install` 安装桌面客户端
- 注册 `midscene://` 自定义协议

## 构建

```bash
# 构建所有包
pnpm build

# 构建单个包
cd packages/<package-name> && pnpm build
```

## 常见问题

### 任务执行报 "429 余额不足"

视觉模型 API 账户余额不足。需要：
- 登录对应平台充值（智谱: open.bigmodel.cn，阿里云: dashscope.console.aliyun.com）
- 或更换其他有余额的模型 API Key

### 浏览器没有打开

确认已安装 Playwright 浏览器：
```bash
cd packages/desktop-client && npx playwright install chromium
```

### 桌面客户端连接不上服务器

确认 server 已启动（端口 3000）。桌面客户端通过 WebSocket 连接 `ws://localhost:3000`。

### Web 控制台端口冲突

web-console 已改为 5174 端口，desktop-client 使用 5173 端口，两者不会冲突。

## 开发说明

- TypeScript 项目引用 (Project References) 用于 monorepo 类型检查
- `pnpm workspace:*` 引用 workspace 内部包
- Electron 主进程使用动态 import 加载 Playwright 和 Midscene（避免打包体积过大）
- Midscene 视觉 AI 通过环境变量配置，不硬编码在代码中
