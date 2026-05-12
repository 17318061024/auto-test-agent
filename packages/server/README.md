# @auto-test-agent/server

后端服务，基于 NestJS。提供 HTTP REST API + WebSocket 中转调度。

**本服务不执行测试**，负责：接收 Web 控制台请求、管理任务/客户端状态、通过 WebSocket 把任务分发给桌面客户端。

## 技术栈

- NestJS + Express (HTTP)
- Socket.IO (WebSocket)
- 内存存储（Map）

## 启动步骤

```bash
# 在项目根目录
pnpm install

# 启动（开发模式，自动热重载）
pnpm --filter @auto-test-agent/server dev
```

启动成功后会看到：

```
Auto Test Agent Server
HTTP Server: http://localhost:3000
WebSocket:   ws://localhost:3000
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发模式启动（tsx watch，代码改动自动重启） |
| `pnpm build` | 编译 TypeScript |
| `pnpm start` | 运行编译后的代码 |
| `pnpm typecheck` | 类型检查 |

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /health | 健康检查 |
| GET | /api/mock | 获取示例任务数据 |
| GET | /api/clients | 所有客户端列表 |
| GET | /api/clients/online | 在线客户端列表 |
| POST | /api/tasks | 创建任务 |
| GET | /api/tasks | 任务列表 |
| GET | /api/tasks/:id | 任务详情 |
| PUT | /api/tasks/:id | 更新任务 |
| DELETE | /api/tasks/:id | 删除任务 |
| POST | /api/tasks/:id/run | 运行任务（body: `{ clientId? }`） |
| POST | /api/tasks/:id/cancel | 取消任务 |

## 目录结构

```
server/src/
├── main.ts                 入口
├── app.module.ts           根模块
└── modules/
    ├── tasks/              任务 CRUD + 运行调度
    ├── clients/            客户端查询
    ├── reports/            报告查询
    ├── websocket/          WebSocket 事件处理（注册/心跳/进度/完成/失败）
    ├── storage/            内存存储（Task/Client/Report 的 Map 操作）
    ├── mock/               Mock 数据
    └── health/             健康检查
```

## 环境变量

默认无需配置。可选：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 3000 | HTTP 和 WebSocket 端口 |
| CORS_ORIGIN | * | CORS 允许的来源 |
