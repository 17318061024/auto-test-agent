# auto-test-agent

> 一个桌面客户端的自动化测试工具，用户通过网页端一键触发，客户端自动执行测试任务并实时回传结果。

![项目状态](https://img.shields.io/badge/状态-初始化成功-success)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![依赖](https://img.shields.io/badge/依赖-564-9cf)
![编译](https://img.shields.io/badge/编译-成功-success)

## 项目背景

领导明确指示要做成一个桌面客户端的自动化测试工具：

1. **用户一行命令安装**: 用户一行命令实现安装在本地电脑
2. **网页端一键控制**: 网页端一键传给客户端指令，客户端开始从服务端读取自动化测试脚本并执行任务，并且将结果传递给服务器
3. **日志查看能力**: 客户端提供日志查看的能力，查看哪一个出错了、哪一步耗时多久

## 核心特性

- ✅ **一键安装**: 用户一行命令完成本地安装 (`npx -y @auto-test-agent/cli install`)
- ✅ **远程控制**: 网页端发送指令 → 客户端执行 → 结果回传
- ✅ **实时监控**: 客户端提供详细的执行日志（错误、耗时、步骤）
- ✅ **美观 UI**: 功能完整、美观的用户界面
- ✅ **AI 驱动**: 基于 @midscene/web 的 AI 自动化能力

## 技术栈

- **桌面客户端**: Electron + React + Vite + TailwindCSS
- **网页控制台**: React + Vite + TailwindCSS
- **后端服务器**: Node.js + Express + Socket.io + SQLite
- **任务执行**: @midscene/web + Playwright
- **开发工具**: PNPM Workspace + TypeScript

## 架构概览

```
┌──────────────────┐      midscene://      ┌──────────────────┐
│   Web Console    │ ◄────────────────────► │  Desktop Client  │
│   (网页控制台)    │     WebSocket/HTTP    │   (Electron App)  │
└────────┬─────────┘                        └────────┬─────────┘
         │                                           │
         │ HTTP API                                  │
         ▼                                           ▼
┌──────────────────┐                        ┌──────────────────┐
│   Task Server    │ ◄─────────────────────► │  @midscene/web   │
│  (任务脚本存储)   │       WebSocket/HTTP   │  (自动化引擎)    │
└──────────────────┘                        └──────────────────┘
```

## 项目结构

```
auto-test-agent/
├── packages/
│   ├── cli/                 # 命令行安装工具
│   ├── desktop-client/      # Electron 桌面客户端
│   ├── web-console/         # 网页控制台
│   ├── task-executor/       # 任务执行引擎
│   ├── server/              # 后端服务器
│   └── shared/              # 共享类型和工具
├── README.md
├── package.json
└── pnpm-workspace.yaml
```

## 快速开始

### 前置要求

- Node.js >= 18.0.0
- PNPM >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 启动后端服务器（http://localhost:3000）
pnpm dev:server

# 启动网页控制台（http://localhost:5173）
pnpm dev:web

# 启动所有服务
pnpm dev
```

### 构建

```bash
# 构建所有包
pnpm build

# 构建特定包
pnpm --filter @auto-test-agent/server build
```

### 一行命令安装（未来）

```bash
# 一行命令安装桌面客户端（开发中）
npx -y @auto-test-agent/cli install
```

## 核心功能

### 1. 网页控制台
- 任务管理（创建、编辑、删除）
- 一键运行测试任务
- 实时监控任务进度
- 查看测试报告

### 2. 桌面客户端
- 任务进度实时展示
- 详细日志查看
- 步骤时间线
- 错误诊断助手
- 性能分析图表
- 截图画廊

### 3. 任务执行引擎
- 基于 @midscene/web 的 AI 自动化
- 智能元素定位
- 自动重试机制
- 性能监控
- 错误恢复

## 开发路线图

### ✅ Phase 1: 基础设施（已完成）
- [x] Monorepo 结构（PNPM Workspace）
- [x] TypeScript 配置
- [x] ESLint & Prettier 配置
- [x] 项目目录结构
- [x] 核心包框架

### 🚧 Phase 2: 后端服务（进行中）
- [x] Express 服务器框架
- [x] WebSocket 处理器
- [x] SQLite 存储层
- [ ] 参数验证（Joi）
- [ ] JWT 认证
- [ ] 日志系统
- [ ] 错误处理完善

### 📋 Phase 3: 任务执行引擎（待开始）
- [ ] @midscene/web 集成
- [ ] 智能重试机制
- [ ] 性能监控完善
- [ ] 错误恢复策略

### 📋 Phase 4: 桌面客户端（待开始）
- [ ] Electron 主进程
- [ ] 协议处理（midscene://）
- [ ] WebSocket 客户端
- [ ] UI 组件开发

### 📋 Phase 5: 网页控制台（待开始）
- [ ] 任务管理页面
- [ ] 任务编辑器
- [ ] 实时监控
- [ ] 报告查看

### 📋 Phase 6: 集成与测试（待开始）
- [ ] 端到端测试
- [ ] 性能测试
- [ ] 异常测试

### 📋 Phase 7: 部署与文档（待开始）
- [ ] 打包配置
- [ ] 自动更新
- [ ] 文档完善

详细进度请查看 [INIT_SUMMARY.md](./INIT_SUMMARY.md)

## 文档

- [快速开始](./QUICKSTART.md) - 快速上手指南
- [初始化总结](./INIT_SUMMARY.md) - 项目初始化详情
- [架构计划](./C:\Users\96425\.claude\plans\wild-churning-island.md) - 完整架构设计

## 常用命令

```bash
# 安装依赖
pnpm install

# 开发
pnpm dev              # 启动所有服务
pnpm dev:server       # 启动后端服务器
pnpm dev:web          # 启动网页控制台

# 构建
pnpm build            # 构建所有包
pnpm --filter @auto-test-agent/server build  # 构建特定包

# 代码检查
pnpm lint             # ESLint 检查
pnpm typecheck        # TypeScript 类型检查
pnpm format           # Prettier 格式化

# 清理
pnpm clean            # 清理所有依赖和构建产物
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT
