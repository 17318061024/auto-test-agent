# Auto Test Agent 项目架构说明

> 面向新同事的通俗版架构文档，回答"这是什么、怎么运作的、代码在哪改"。

## 项目整体结构

```
auto-test-agent/
├── packages/
│   ├── server/          ← 后端服务 (NestJS)，HTTP API + WebSocket 中转
│   ├── desktop-client/  ← 桌面客户端 (Electron)，实际执行测试的终端
│   ├── web-console/     ← Web 控制台 (Vite + Vue3)，操作界面
│   ├── shared/          ← 共享配置包
│   ├── task-executor/   ← 任务执行引擎库（备用）
│   └── cli/             ← 命令行工具（备用）
└── docs/
```

三端协作关系：

```
┌──────────────┐  HTTP + WebSocket   ┌──────────────┐  WebSocket        ┌────────────────┐
│  Web 控制台   │ ──────────────────→ │    Server     │ ────────────────→ │  桌面客户端      │
│  (浏览器)     │ ←────────────────── │  (NestJS)    │ ←──────────────── │  (Electron)    │
│  发任务/看状态 │   任务状态/客户端列表  │   中转/调度   │  注册/心跳/执行结果  │  执行/录制/回放  │
└──────────────┘                     └──────────────┘                   └────────────────┘
```

---

## 一、Electron 是什么？桌面端是 Web 应用吗？

**Electron 不是 Web 应用，它是一个把 Web 技术"装进"桌面应用的框架。**

类比理解：

| 概念 | 类比 |
|------|------|
| 普通网站 | 在 Chrome 里打开一个网页，关掉 Chrome 就没了 |
| Electron 应用 | 自己带了一个 Chrome 内核，网页直接跑在这个内核里，不需要用户装浏览器 |

Electron 应用有 **两个进程**，这是理解桌面端架构的关键：

```
┌──────────────────────────────────────────────────┐
│              Electron 应用 = 一个进程组             │
│                                                    │
│  ┌──────────────────────┐  ┌─────────────────────┐ │
│  │    主进程 (Main)       │  │   渲染进程 (Renderer) │ │
│  │    Node.js 环境        │  │   Chromium 浏览器环境  │ │
│  │                       │  │                      │ │
│  │  ✓ 访问文件系统         │  │  ✓ 运行 Vue 组件      │ │
│  │  ✓ 启动子进程           │  │  ✓ Element Plus UI   │ │
│  │  ✓ 操作原生窗口         │  │  ✓ 用户交互/动画      │ │
│  │  ✓ 打开浏览器           │  │  ✗ 不能直接访问文件    │ │
│  │  ✓ WebSocket 连接      │  │  ✗ 不能启动子进程      │ │
│  └──────────┬────────────┘  └──────────▲──────────┘ │
│             │         IPC 通信          │            │
│             └───────────────────────────┘            │
└──────────────────────────────────────────────────────┘
```

**为什么分两个进程？安全。** 渲染进程显示的是网页内容，如果网页有恶意代码，它无法直接读取你的文件系统。只有主进程才有系统权限。两个进程之间通过 IPC 通信，互相发送消息。

---

## 二、IPC 是什么？

**IPC = Inter-Process Communication，进程间通信。** 就是主进程和渲染进程互相发消息的方式。

理解成"两个人通过微信聊天"：

```
渲染进程想做的事                     主进程实际做的事
─────────────────                  ──────────────────
"帮我读取配置文件"     ──IPC──→     读文件 → 返回结果
"帮我保存客户端名称"   ──IPC──→     写文件到磁盘
"收到任务了，更新界面"  ←──IPC──     WebSocket 收到 task:assigned
"步骤完成了"          ←──IPC──     Playwright 执行完一个步骤
```

代码中的两种方式：

```typescript
// 1. ipcMain.handle / ipcRenderer.invoke —— 请求-响应模式（像 HTTP）
// 渲染进程：
const info = await ipcRenderer.invoke('client:getInfo')  // 发请求，等结果
// 主进程：
ipcMain.handle('client:getInfo', async () => { return { ... } })  // 处理并返回

// 2. webContents.send / ipcRenderer.on —— 单向通知（像发短信）
// 主进程：
mainWindow.webContents.send('task:assigned', taskData)  // 主动推给渲染进程
// 渲染进程：
ipcRenderer.on('task:assigned', (event, data) => { ... })  // 收到通知
```

---

## 三、浏览器是怎么启动的？

桌面端启动的浏览器是 **Playwright 内置的 Chromium 内核**，不是你电脑上安装的 Chrome。

```
Playwright 内置 Chromium          你电脑上的 Chrome
─────────────────────            ──────────────────
项目安装时自动下载                   用户手动安装
版本固定，不受用户更新影响            版本不固定
可以无头/有头运行                    只能手动打开
支持录制/截图/自动化操控              不支持自动化
路径：node_modules/playwright/     路径：/Applications/Google Chrome.app/
```

启动流程：

```typescript
// main/index.ts → runTaskWithBrowser()

const { chromium } = await import('playwright')

// 启动有头浏览器（用户能看到浏览器窗口弹出来）
browser = await chromium.launch({ headless: false })

// 创建上下文，开启视频录制
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: VIDEOS_DIR, size: { width: 1280, height: 800 } },
})

// 打开页面
const page = await context.newPage()

// 用 Midscene AI 操作页面（截图 → 视觉模型识别 → 执行操作）
const { PlaywrightAgent } = await import('@midscene/web/playwright')
const agent = new PlaywrightAgent(page)

await agent.aiTap('搜索按钮')     // AI 看截图找到搜索按钮并点击
await agent.aiInput('输入框', { value: '华为' })  // AI 找到输入框并输入
```

**关键点**：不是用 CSS 选择器定位元素，而是通过 AI 视觉模型（截图识别）来操作页面。这就是为什么需要配置视觉模型 API Key。

---

## 四、桌面端代码架构详解

### 文件结构

```
desktop-client/src/
├── main/                    ← 主进程（Node.js 环境）
│   ├── index.ts             应用入口：窗口管理、IPC 注册、生命周期
│   ├── WebSocketClient.ts   与 Server 的 WebSocket 连接、注册、心跳
│   └── ProtocolHandler.ts   midscene:// 自定义协议（网页唤起桌面端）
│
├── renderer/                ← 渲染进程（Chromium 浏览器环境）
│   ├── main.ts              Vue 应用挂载 + Element Plus 注册
│   ├── App.vue              主界面（步骤列表/日志/详情/录制回放/设置）
│   ├── index.html           HTML 壳
│   └── index.css            全局样式
│
└── composables/
    └── useTaskExecution.ts  任务状态管理（单例，连接主进程和 UI 的桥梁）
```

### 一次任务执行的完整数据流

```
① Web 控制台点击 START
   → POST /api/tasks/:id/run { clientId: "xxx" }

② Server TasksService.run()
   → 验证客户端在线 → 分配任务
   → socketGateway.assignTask(clientId, task)

③ Server SocketGateway.assignTask()
   → server.to(socketId).emit('task:assigned', task)
   → 通过 WebSocket 发给特定桌面客户端

④ 主进程 WebSocketClient 收到 'task:assigned'
   → IPC 通知渲染进程 startTask() 显示任务界面
   → 调用 runTaskWithBrowser(task)

⑤ runTaskWithBrowser()
   → 动态 import playwright + midscene
   → chromium.launch() 启动浏览器
   → 逐步骤执行，每步：
      → IPC step:complete → 渲染进程更新步骤状态
      → IPC task:status:update → 渲染进程更新进度条

⑥ 任务完成
   → page.video().path() 获取录制视频路径
   → IPC task:video → 渲染进程可播放回放
   → wsClient.sendTaskCompleted() → Server → Web 控制台

⑦ 渲染进程更新 UI
   → 状态变为 completed / failed
   → 步骤列表显示结果
   → "录制回放" Tab 可播放视频
```

---

## 五、Web 控制台代码架构

### 文件结构

```
web-console/src/
├── main.ts                  Vue 应用挂载入口
├── App.vue                  主界面：客户端列表 + 任务操作 + 执行日志
├── config.ts                前端配置（API 地址、WebSocket 地址、环境变量）
├── index.css                全局样式
│
├── components/
│   ├── MonitoringDashboard.vue   监控面板（备用）
│   ├── TaskEditor.vue            任务编辑器（备用）
│   ├── TaskHistory.vue           任务历史（备用）
│   └── TestReportViewer.vue      测试报告查看器（备用）
│
└── services/
    └── ReportService.ts          报告 API 封装（备用）
```

### 核心逻辑（App.vue）

Web 控制台的核心全部在 `App.vue` 一个文件中，职责是：

1. **WebSocket 连接**：连接 Server，实时接收客户端列表和任务状态
2. **在线客户端列表**：显示所有在线桌面客户端，点击选择目标
3. **任务创建与执行**：加载 Mock 任务 → 点击 START → POST 创建任务 → POST 运行任务（指定 clientId）
4. **执行日志**：实时显示任务状态更新

```
Web 控制台的通信方式：

┌──────────────────────┐
│     App.vue           │
│                       │
│  ┌───────────────┐    │  HTTP (fetch)
│  │ 加载 Mock 任务  │ ───┼──→ GET /api/mock
│  │ 创建任务       │ ───┼──→ POST /api/tasks
│  │ 运行任务       │ ───┼──→ POST /api/tasks/:id/run { clientId }
│  │ 获取在线客户端  │ ───┼──→ GET /api/clients/online
│  └───────────────┘    │
│                       │
│  ┌───────────────┐    │  WebSocket (socket.io-client)
│  │ 客户端列表更新  │ ←──┼── clients:list 事件
│  │ 任务状态更新   │ ←──┼── task:updated 事件
│  └───────────────┘    │
└──────────────────────┘
```

### config.ts — 前端配置

```typescript
// 支持环境变量覆盖，方便部署到不同环境
config = {
  api: {
    baseURL: 'http://localhost:3000',  // VITE_API_BASE_URL 可覆盖
  },
  websocket: {
    url: 'ws://localhost:3000',        // VITE_WS_URL 可覆盖
  },
}
```

---

## 六、Server 代码架构

### 文件结构

```
server/src/
├── main.ts                    NestJS 启动入口 (port 3000)
├── app.module.ts              根模块，注册所有子模块
│
└── modules/
    ├── tasks/                 任务模块
    │   ├── tasks.controller.ts   REST API: CRUD + run + cancel
    │   ├── tasks.service.ts      业务逻辑：创建/分配/运行任务
    │   └── dto/                   请求数据验证
    │       ├── create-task.dto.ts
    │       ├── run-task.dto.ts    { clientId?: string }
    │       └── update-task.dto.ts
    │
    ├── clients/               客户端模块
    │   ├── clients.controller.ts  GET /api/clients, /api/clients/online
    │   └── clients.service.ts
    │
    ├── reports/               报告模块
    │   ├── reports.controller.ts
    │   └── reports.service.ts
    │
    ├── websocket/             WebSocket 模块
    │   ├── socket.gateway.ts     事件处理：注册/心跳/进度/完成/失败
    │   └── websocket.module.ts
    │
    ├── storage/               内存存储层
    │   ├── task.service.ts       Task CRUD（内存 Map）
    │   ├── client.service.ts     Client CRUD（内存 Map）
    │   └── report.service.ts     Report CRUD（内存 Map）
    │
    ├── mock/                  Mock 数据
    │   ├── mock.controller.ts    GET /api/mock 返回示例任务
    │   └── mock.service.ts
    │
    └── health/                健康检查
        └── health.controller.ts  GET /health
```

### Server 的核心职责

Server 本身 **不执行测试**，它是中转调度中心：

```
任务调度流程 (tasks.service.ts → run()):

1. 收到 Web 的运行请求 { clientId? }
2. 有 clientId → 验证该客户端在线 → 分配
   无 clientId → 取第一个在线桌面客户端
3. 检查客户端是否正在执行（防重复分配）
4. 设置客户端状态为 busy
5. 通过 WebSocket 推送 task:assigned 给目标客户端
6. 返回 { taskId, clientId, clientName }

WebSocket 事件转发 (socket.gateway.ts):

client:register  → 记录客户端信息（名称/平台/用户名）
client:heartbeat → 更新 lastSeen
task:completed   → 更新任务状态，客户端恢复 online
task:failed      → 更新任务状态，客户端恢复 online
task:progress    → 广播给所有连接方
clients:list     → 广播客户端列表（Web 和桌面端都能收到）
```

---

## 七、快速对照表

| 你想做的事 | 在哪里做 | 用什么技术 |
|-----------|---------|-----------|
| 看在线客户端 | Web 控制台 | WebSocket `clients:list` 事件 |
| 发任务给指定电脑 | Web 控制台 | `POST /api/tasks/:id/run { clientId }` |
| 实际执行测试 | 桌面客户端主进程 | Playwright + Midscene AI |
| 看执行步骤和日志 | 桌面客户端 UI | Element Plus 渲染进程 |
| 看录制回放 | 桌面客户端"录制回放"Tab | `video://` 自定义协议 + `<video>` |
| 设置客户端名称 | 桌面客户端右上角齿轮 | IPC → 写 `client-config.json` |
| 网页唤起桌面端 | 浏览器点击 `midscene://run` 链接 | ProtocolHandler |

---

## 八、开发启动

```bash
# 安装依赖
pnpm install

# 配置桌面端 AI 模型（必须有视觉模型 API Key）
cp packages/desktop-client/.env.example packages/desktop-client/.env
# 编辑 .env 填入 MIDSCENE_MODEL_API_KEY

# 一键启动所有服务
pnpm dev

# 或单独启动
pnpm --filter @auto-test-agent/server dev           # Server :3000
pnpm --filter @auto-test-agent/web-console dev       # Web :5174
pnpm --filter @auto-test-agent/desktop-client dev    # Electron 窗口
```
