# @auto-test-agent/shared

共享配置包，提供各包统一使用的配置常量（Server 地址、WebSocket 地址等）。

## 启动步骤

```bash
# 编译（其他包依赖此包的类型定义）
pnpm --filter @auto-test-agent/shared build
```

开发时一般不需要单独启动，`pnpm dev` 会自动通过 workspace 依赖处理。

## 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm build` | 编译 TypeScript |
| `pnpm dev` | 监听模式编译 |
| `pnpm typecheck` | 类型检查 |

## 导出内容

- `config` — 统一配置对象（HTTP URL、WebSocket URL 等）
- `getConfig()` / `getHTTPURL()` / `getWebSocketURL()` — 获取配置
