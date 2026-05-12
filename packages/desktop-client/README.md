# @auto-test-agent/desktop-client

桌面客户端，基于 Electron + Vue3 + Element Plus。

接收 Server 下发的测试任务，启动 Playwright 浏览器执行自动化测试，支持视频录制和回放。

## 技术栈

- Electron（双进程架构：主进程 Node.js + 渲染进程 Chromium）
- Vue3 + Element Plus（渲染进程 UI）
- Playwright + Midscene AI（浏览器自动化，AI 视觉定位）
- Socket.IO（WebSocket 连接 Server）

## 启动步骤

### 1. 前置条件：先启动 Server

```bash
pnpm --filter @auto-test-agent/server dev
```

桌面客户端依赖 Server 的 WebSocket，必须先启动 Server。

### 2. 配置 AI 模型（首次使用必须）

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env，填入你的视觉模型 API Key
# 必填项：
#   MIDSCENE_MODEL_NAME      模型名称（如 glm-4.6v）
#   MIDSCENE_MODEL_API_KEY   API Key
#   MIDSCENE_MODEL_BASE_URL  API 地址
#   MIDSCENE_MODEL_FAMILY    模型系列（如 glm-v）
```

支持的模型提供商：

| 提供商 | MODEL_NAME | BASE_URL |
|--------|-----------|----------|
| 智谱 AI | glm-4.6v | https://open.bigmodel.cn/api/paas/v4 |
| 通义千问 | qwen3-vl-plus | https://dashscope.aliyuncs.com/compatible-mode/v1 |
| Google | gemini-3-flash | https://generativelanguage.googleapis.com/v1beta/openai/ |

### 3. 启动桌面客户端

```bash
pnpm --filter @auto-test-agent/desktop-client dev
```

启动后会弹出 Electron 窗口，自动连接 Server 并注册。

### 4. 设置客户端名称（建议）

点击右上角齿轮按钮，输入你的名字（如"张三的ThinkPad"），方便同事在 Web 控制台识别你的电脑。

也可以在 `.env` 中配置：

```
CLIENT_NAME=张三的ThinkPad
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发模式启动（Vite 热重载 + Electron） |
| `pnpm build` | 编译 TypeScript + Vite 打包 |
| `pnpm typecheck` | 类型检查 |

## 目录结构

```
desktop-client/src/
├── main/                    ← 主进程（Node.js 环境，有系统权限）
│   ├── index.ts             入口：窗口管理、IPC 注册、Playwright 执行器
│   ├── WebSocketClient.ts   与 Server 的 WebSocket 连接
│   └── ProtocolHandler.ts   midscene:// 自定义协议
│
├── renderer/                ← 渲染进程（Chromium 浏览器环境）
│   ├── main.ts              Vue 挂载 + Element Plus 注册
│   ├── App.vue              主界面（步骤/日志/详情/录制回放/设置）
│   ├── index.css            全局样式
│   └── index.html           HTML 壳
│
└── composables/
    └── useTaskExecution.ts  任务状态管理（连接主进程和 UI）
```

## 两个进程说明

| | 主进程 (Main) | 渲染进程 (Renderer) |
|--|--------------|-------------------|
| 运行环境 | Node.js | Chromium 浏览器 |
| 职责 | WebSocket、文件读写、启动浏览器 | Vue UI、用户交互 |
| 通信方式 | ipcMain.handle / webContents.send | ipcRenderer.invoke / ipcRenderer.on |

## 录制功能

任务执行时自动录制浏览器操作过程（Playwright recordVideo），完成后在"录制回放"标签页可播放。视频保存在：

```
~/Library/Application Support/@auto-test-agent/desktop-client/videos/
```
