# 🧪 auto-test-agent 测试指南

## 📋 测试概述

本项目建立了完整的自动化测试体系，包括：
- **单元测试**: 测试各个模块的核心功能
- **集成测试**: 测试模块间的协作
- **端到端测试**: 测试完整的用户工作流程
- **性能测试**: 验证系统性能和稳定性

## 🚀 快速开始

### 安装测试依赖
```bash
pnpm install
```

### 运行所有测试
```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行端到端测试
npm run test:e2e

# 运行性能测试
npm run test:performance

# 生成覆盖率报告
npm run test:coverage
```

## 📁 测试文件结构

```
tests/
├── __tests__/              # 单元测试
│   ├── ChromeManager.test.ts
│   ├── MidsceneAutomationAdapter.test.ts
│   └── TaskExecutor.test.ts
├── e2e/                   # 端到端测试
│   └── complete-workflow.test.ts
├── performance/           # 性能测试
│   └── benchmark.ts
└── helpers/               # 测试辅助工具
    └── test-utils.ts
```

## 🔧 测试工具

### 测试辅助函数
```typescript
import {
  createTestTask,
  executeTestTask,
  validateTaskResult,
  TestDataCleaner,
  TestPerformanceMonitor
} from '../tests/helpers/test-utils'

// 创建测试任务
const task = createTestTask({
  name: '我的测试任务',
  steps: [/* ... */]
})

// 执行测试任务并自动清理
const result = await executeTestTask(task)

// 验证结果
validateTaskResult(result, 'completed')
```

### 性能监控
```typescript
import { TestPerformanceMonitor } from '../tests/helpers/test-utils'

const monitor = new TestPerformanceMonitor()
const stopMeasure = monitor.start('my-operation')

// 执行操作
await myOperation()

stopMeasure()
console.log(monitor.getStats('my-operation'))
```

## 📊 测试覆盖率

当前测试覆盖率目标：
- **分支覆盖**: ≥ 70%
- **函数覆盖**: ≥ 70%
- **行覆盖**: ≥ 70%
- **语句覆盖**: ≥ 70%

生成覆盖率报告：
```bash
npm run test:coverage
```

报告将生成在 `coverage/` 目录中。

## 🧪 编写测试

### 单元测试示例
```typescript
describe('MyModule', () => {
  beforeEach(() => {
    // 每个测试前的设置
  })

  afterEach(() => {
    // 每个测试后的清理
  })

  it('应该能够执行某功能', async () => {
    // 准备测试数据
    const input = createTestData()

    // 执行被测试的功能
    const result = await myFunction(input)

    // 验证结果
    expect(result).toBeDefined()
    expect(result.success).toBe(true)
  })
})
```

### 集成测试示例
```typescript
describe('集成测试', () => {
  let executor: TaskExecutor

  beforeEach(async () => {
    executor = new TaskExecutor()
  })

  afterEach(async () => {
    await executor.cleanup()
  })

  it('应该能够完成完整的工作流程', async () => {
    const task = createTestTask()
    const result = await executor.executeTask(task)

    validateTaskResult(result)
    expect(result.status).toBe('completed')
  })
})
```

## 🔍 调试测试

### 调试单个测试
```bash
# 运行特定测试文件
npm test -- ChromeManager.test.ts

# 运行特定测试用例
npm test -- -t "应该能够检测用户系统Chrome路径"
```

### 查看详细输出
```bash
# 详细模式
npm test -- --verbose

# 显示控制台输出
npm test -- --no-coverage
```

## 📈 性能基准

性能测试验证：
- **浏览器启动时间**: < 5秒
- **页面加载时间**: < 10秒
- **并发任务处理**: 支持10个并发任务
- **内存使用**: 20个任务后内存增长 < 100MB
- **长时间运行稳定性**: 1分钟内成功率 > 95%

运行性能测试：
```bash
npm run test:performance
```

## 🚨 CI/CD 集成

### GitHub Actions 工作流
```yaml
name: 测试
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v2
      - run: pnpm install
      - run: npm test
      - run: npm run test:coverage
```

## 📝 测试最佳实践

1. **独立性**: 每个测试应该独立运行，不依赖其他测试
2. **清理**: 使用 `afterEach` 确保资源正确清理
3. **超时**: 为异步操作设置合理的超时时间
4. **断言**: 使用具体的断言，避免过于宽泛的测试
5. **Mock**: 对外部依赖使用mock，避免副作用
6. **性能**: 监控测试执行时间，避免测试过慢

## 🐛 常见问题

### 测试超时
- 增加测试超时时间：`jest.setTimeout(30000)`
- 检查异步操作是否正确等待

### 内存泄漏
- 使用 `TestDataCleaner` 确保资源清理
- 在测试后验证内存使用

### 浏览器启动失败
- 检查浏览器路径是否正确
- 确保Chrome/Chromium已安装

## 📚 相关文档

- [Jest文档](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright文档](https://playwright.dev/)

---

**记住**: 好的测试不仅验证功能正确性，更是文档和规范的一部分！
