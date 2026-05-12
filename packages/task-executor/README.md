# @auto-test-agent/task-executor

任务执行引擎库，封装 Playwright + Midscene 的自动化执行逻辑。

## 说明

当前桌面客户端（desktop-client）直接在主进程中执行任务，本包作为备用/独立库保留。

## 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm build` | 编译 TypeScript |
| `pnpm dev` | 监听模式编译 |
| `pnpm typecheck` | 类型检查 |

## 依赖

- `playwright` — 浏览器自动化
- `@midscene/web` — AI 视觉定位
- `@auto-test-agent/shared` — 共享配置
