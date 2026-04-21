# 快速开始指南

## 前置要求

- Node.js >= 18.0.0
- PNPM >= 8.0.0

## 安装依赖

```bash
pnpm install
```

## 开发模式

### 启动后端服务器

```bash
pnpm dev:server
```

服务器将在 http://localhost:3000 启动

### 启动网页控制台

```bash
pnpm dev:web
```

网页控制台将在 http://localhost:5173 启动

## 项目结构

```
auto-test-agent/
├── packages/
│   ├── cli/                 # CLI 安装工具
│   ├── desktop-client/      # Electron 桌面客户端
│   ├── web-console/         # 网页控制台
│   ├── task-executor/       # 任务执行引擎
│   ├── server/              # 后端服务器
│   └── shared/              # 共享类型和工具
├── README.md
├── QUICKSTART.md
└── package.json
```

## 下一步

1. 查看完整架构: 架构计划保存在 `C:\Users\96425\.claude\plans\wild-churning-island.md`
2. 开始开发: 根据 Phase 计划逐步实现功能
3. 查看文档: 阅读 README.md 了解项目详情

## 常用命令

```bash
# 安装依赖
pnpm install

# 启动所有开发服务器
pnpm dev

# 启动特定包的开发服务器
pnpm --filter @auto-test-agent/server dev
pnpm --filter @auto-test-agent/web-console dev

# 构建所有包
pnpm build

# 构建特定包
pnpm --filter @auto-test-agent/server build

# 代码检查
pnpm lint
pnpm typecheck

# 代码格式化
pnpm format

# 清理所有依赖和构建产物
pnpm clean
```
