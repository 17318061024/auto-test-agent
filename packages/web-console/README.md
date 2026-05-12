# @auto-test-agent/web-console

Web 控制台，基于 Vite + Vue3。操作界面，用于查看在线客户端、创建和下发测试任务。

## 技术栈

- Vue3
- Socket.IO Client（WebSocket 实时通信）
- Vite（开发服务器）

## 启动步骤

### 1. 前置条件：先启动 Server

```bash
pnpm --filter @auto-test-agent/server dev
```

### 2. 启动 Web 控制台

```bash
pnpm --filter @auto-test-agent/web-console dev
```

启动后访问 http://localhost:5174

### 3. 使用

1. 确保至少有一台桌面客户端在线（左侧"在线客户端"列表有显示）
2. 点击目标客户端选中它
3. 点击 **START** 按钮下发任务
4. 右侧日志面板实时查看执行状态

## 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发模式启动（端口 5174） |
| `pnpm build` | 构建生产包 |
| `pnpm preview` | 预览构建产物 |
| `pnpm typecheck` | 类型检查 |

## 目录结构

```
web-console/src/
├── main.ts              Vue 挂载入口
├── App.vue              主界面：客户端列表 + 任务操作 + 执行日志
├── config.ts            前端配置（支持环境变量覆盖）
├── index.css            全局样式
├── components/          备用组件
└── services/            备用服务
```

## 配置

通过环境变量覆盖默认配置（创建 `.env` 文件）：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| VITE_API_BASE_URL | http://localhost:3000 | Server API 地址 |
| VITE_WS_URL | ws://localhost:3000 | Server WebSocket 地址 |

部署到其他环境时修改这两个值即可。
