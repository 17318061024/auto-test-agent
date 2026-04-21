# 新功能实现文档

本文档记录了 auto-test-agent 项目最新实现的核心功能和代码改进。

## 📋 目录

- [统一配置管理系统](#统一配置管理系统)
- [环境自检模块](#环境自检模块)
- [增强的任务执行器](#增强的任务执行器)
- [协议处理系统](#协议处理系统)
- [性能监控系统](#性能监控系统)

---

## 统一配置管理系统

### 🎯 功能概述
创建了一个集中化的配置管理系统，将所有可配置变量统一管理，方便快速配置和部署。

### 📁 文件位置
`packages/shared/src/config.ts`

### 🔧 主要特性

1. **类型安全**: 使用TypeScript接口定义所有配置项
2. **环境变量支持**: 所有配置都可以通过环境变量覆盖
3. **默认值**: 每个配置项都有合理的默认值
4. **配置验证**: 自动验证配置的有效性
5. **向后兼容**: 保留旧的配置接口

### 💡 使用示例

```typescript
import { config, ConfigManager } from '@auto-test-agent/shared'

// 使用全局配置实例
const serverConfig = config.getServerConfig()
const taskConfig = config.getTaskExecutorConfig()

// 或创建自定义配置实例
const customConfig = new ConfigManager({
  taskExecutor: {
    maxRetries: 5,
    stepTimeout: 60000,
  }
})

// 获取服务器URL
const serverUrl = config.getHTTPURL() // http://localhost:3000
const wsUrl = config.getWebSocketURL() // ws://localhost:3001
const apiUrl = config.getAPIBaseURL() // http://localhost:3000/api
```

### 🌍 环境变量配置

```bash
# 服务器配置
SERVER_HOST=localhost
SERVER_PORT=3000
WS_PORT=3001
API_BASE_PATH=/api

# 任务执行配置
MAX_RETRIES=3
RETRY_DELAY=2000
STEP_TIMEOUT=30000
HEADLESS=false
PERFORMANCE_THRESHOLD=10000

# Chrome配置
PREFER_SYSTEM_CHROME=true
CHROME_PATH=/path/to/chrome
CHROME_DEBUG_PORT=9222

# 日志配置
LOG_LEVEL=info
ENABLE_FILE_LOGGING=true
LOG_FILE_PATH=./logs
```

---

## 环境自检模块

### 🎯 功能概述
自动检查运行环境是否满足要求，包括Node.js版本、Chrome安装、端口占用、系统资源等。

### 📁 文件位置
`packages/task-executor/src/EnvironmentMonitor.ts`

### 🔧 主要特性

1. **Node.js版本检查**: 确保版本 >= 18.0.0
2. **系统资源检查**: 检查内存和磁盘空间
3. **Chrome检测**: 优先使用系统Chrome，自动安装Playwright Chromium
4. **端口占用检查**: 检查关键端口是否可用
5. **目录结构检查**: 自动创建必要目录
6. **详细报告**: 生成清晰的环境检查报告

### 💡 使用示例

```typescript
import { EnvironmentMonitor, printEnvironmentReport } from '@auto-test-agent/task-executor'

// 执行完整检查并打印报告
await printEnvironmentReport()

// 或手动控制
const monitor = new EnvironmentMonitor()
const results = await monitor.performFullCheck()

// 获取系统信息
const systemInfo = monitor.getSystemInfo()
console.log(`系统: ${systemInfo.platform} ${systemInfo.arch}`)
console.log(`内存: ${systemInfo.freeMemory}MB / ${systemInfo.totalMemory}MB`)

// 获取Chrome信息
const chromeInfo = monitor.getChromeInfo()
if (chromeInfo?.installed) {
  console.log(`使用Chrome: ${chromeInfo.executablePath}`)
}
```

### 📊 检查报告示例

```
╔════════════════════════════════════════════════════════════╗
║              环境自检报告                                    ║
╚════════════════════════════════════════════════════════════╝

系统信息:
  Node.js:    v18.0.0
  操作系统:   win32 x64
  内存:       8192MB / 16384MB
  CPU:        8 核心

检查结果:

  ✅ Node.js 版本检查
  ✅ 系统资源检查
     警告: 可用内存较少: 900MB，建议至少保留 1GB
  ✅ Chrome 安装检查
     警告: 使用系统 Chrome: 119.0.0.0
  ✅ 端口 9222 检查
  ✅ 目录结构检查

摘要: 5/5 项通过
      0 项失败
      2 项警告
```

---

## 增强的任务执行器

### 🎯 功能概述
基于@midscene/web封装的任务执行器，提供智能重试、自动优化、性能监控等功能。

### 📁 文件位置
`packages/task-executor/src/TaskRunner.ts`

### 🔧 主要特性

1. **智能重试机制**: 失败时自动重试，可配置重试次数和延迟
2. **自动优化**: 执行前等待页面网络空闲
3. **性能监控**: 详细记录每步执行时间，识别性能瓶颈
4. **影子执行模式**: 支持headful模式显示浏览器UI
5. **错误恢复**: 提供多种错误恢复策略
6. **系统Chrome支持**: 优先使用客户端已安装的Chrome

### 💡 使用示例

```typescript
import { TaskRunner, Task } from '@auto-test-agent/task-executor'

// 定义任务
const task: Task = {
  id: 'task-1',
  name: '搜索华为',
  description: '在Google上搜索华为',
  script: '// 任务脚本',
  steps: [
    {
      id: 'step-1',
      action: 'goto',
      params: { url: 'https://www.google.com' },
      description: '打开Google首页'
    },
    {
      id: 'step-2',
      action: 'fill',
      params: { selector: 'input[name="q"]', value: '华为' },
      description: '输入搜索关键词'
    }
  ],
  config: {
    timeout: 30000,
    retries: 3,
    headless: false,
    screenshots: 'only-on-failure'
  },
  status: 'pending',
  createdAt: Date.now(),
  updatedAt: Date.now()
}

// 创建执行器
const runner = new TaskRunner({
  config: {
    maxRetries: 3,
    stepTimeout: 30000,
    headless: false,
  },
  onProgress: (progress) => {
    console.log(`进度: ${progress.current}/${progress.total}`)
  },
  onStepComplete: (result) => {
    console.log(`步骤完成: ${result.stepId} - ${result.status}`)
  }
})

// 执行任务
const result = await runner.run(task)
console.log(`任务完成: ${result.status}, 耗时: ${result.duration}ms`)

// 获取性能报告
const report = runner.getFormattedPerformanceReport()
console.log(report)
```

---

## 协议处理系统

### 🎯 功能概述
实现midscene://自定义协议，支持从网页端一键唤起桌面客户端并执行任务。

### 📁 文件位置
`packages/desktop-client/src/main/ProtocolHandler.ts`

### 🔧 主要特性

1. **自定义协议注册**: 注册midscene://协议
2. **参数解析**: 自动解析协议URL和参数
3. **单实例管理**: 确保只运行一个应用实例
4. **窗口管理**: 自动显示和聚焦主窗口
5. **多种操作类型**: 支持运行、查看、配置等操作

### 💡 使用示例

```typescript
import { ProtocolAction, generateProtocolUrl } from './ProtocolHandler'

// 生成协议URL
const runUrl = generateProtocolUrl(ProtocolAction.RUN, {
  taskId: 'task-123',
  server: 'http://localhost:3000'
})
// 结果: midscene://run?taskId=task-123&server=http://localhost:3000

// 在网页端使用
const link = document.createElement('a')
link.href = runUrl
link.textContent = '在客户端中打开'
document.body.appendChild(link)
```

### 🌐 网页端集成

```html
<!-- 在网页控制台中添加唤起链接 -->
<a href="midscene://run?taskId=123" class="btn-launch">
  🚀 在客户端中执行
</a>

<!-- 或使用JavaScript -->
<script>
function launchInClient(taskId) {
  const url = `midscene://run?taskId=${taskId}`
  window.location.href = url
}

// 点击按钮唤起客户端
document.getElementById('launchBtn').addEventListener('click', () => {
  launchInClient('task-123')
})
</script>
```

---

## 性能监控系统

### 🎯 功能概述
使用performance.now()对关键环节进行详细测速，提供性能分析和自动优化建议。

### 📁 文件位置
`packages/task-executor/src/PerformanceMonitor.ts`

### 🔧 主要特性

1. **标记和测量**: 支持性能标记点和时间测量
2. **步骤追踪**: 详细记录每个步骤的执行情况
3. **瓶颈分析**: 自动识别性能瓶颈并提供优化建议
4. **报告生成**: 生成详细的性能报告
5. **可配置阈值**: 支持自定义性能阈值

### 💡 使用示例

```typescript
import { PerformanceMonitor, MetricType } from '@auto-test-agent/task-executor'

const monitor = new PerformanceMonitor()

// 开始监控
monitor.startTask()

// 添加标记点
monitor.mark('browser:start', '浏览器启动开始')
// ... 执行浏览器启动操作
monitor.mark('browser:end', '浏览器启动结束')

// 测量时间间隔
const launchTime = monitor.measure('browserLaunch', 'browser:start', 'browser:end', MetricType.BROWSER_LAUNCH)

// 追踪步骤执行
monitor.traceStep('step-1', '打开页面', 'success', 0, {
  pageLoadTime: 1500,
  networkIdleTime: 800,
  elementLookupTime: 200
})

// 结束监控
monitor.endTask()

// 生成报告
const report = monitor.getReport()
console.log('性能报告:', report)

// 获取格式化的文本报告
const textReport = monitor.formatReport()
console.log(textReport)

// 分析瓶颈
const bottlenecks = monitor.analyzeBottlenecks(10000) // 10秒阈值
bottlenecks.forEach(bottleneck => {
  console.log(`瓶颈: ${bottleneck.name} - ${bottleneck.duration}ms`)
  bottleneck.suggestions.forEach(suggestion => {
    console.log(`  建议: ${suggestion}`)
  })
})
```

### 📊 性能报告示例

```
╔════════════════════════════════════════════════════════════╗
║                    性 能 监 控 报 告                        ║
╚════════════════════════════════════════════════════════════╝

📊 总耗时: 15.23s
🕐 开始时间: 14:30:15
🕐 结束时间: 14:30:30

📈 详细指标:
  • browserLaunch: 1.20s (7.9%)
  • pageLoad: 8.50s (55.8%)
  • aiInference: 3.20s (21.0%)
  • elementLookup: 1.80s (11.8%)
  • visualRender: 0.53s (3.5%)

📝 步骤执行追踪:
  1. ✅ 打开Google首页: 2.10s
     └─ 页面加载: 1.50s, 网络空闲: 0.40s
  2. ✅ 输入搜索关键词: 0.80s
     └─ 元素查找: 0.30s
  3. ✅ 点击搜索按钮: 12.33s
     └─ 页面加载: 11.50s, 网络空闲: 0.60s

⚠️  性能瓶颈分析:
  1. 🟠 步骤: 点击搜索按钮: 12.33s (81.0%)
     💡 页面加载时间较长，建议检查网络或页面优化
  2. 🟡 页面加载 (总计): 8.50s (55.8%)
     💡 检查网络连接速度
     💡 优化页面资源加载

💬 优化建议:
  1. 发现 1 个高级性能瓶颈，建议尽快优化
  2. 多个页面加载环节存在瓶颈，建议检查网络环境或页面性能
```

---

## 🔄 集成使用示例

### 完整的任务执行流程

```typescript
import { TaskRunner } from '@auto-test-agent/task-executor'
import { EnvironmentMonitor } from '@auto-test-agent/task-executor'
import { config } from '@auto-test-agent/shared'

async function executeTaskWithMonitoring(task: Task) {
  // 1. 环境检查
  console.log('🔍 执行环境检查...')
  const monitor = new EnvironmentMonitor()
  await monitor.performFullCheck()

  // 2. 创建任务执行器
  const runner = new TaskRunner({
    config: {
      maxRetries: config.getTaskExecutorConfig().maxRetries,
      stepTimeout: config.getTaskExecutorConfig().stepTimeout,
      headless: false, // 显示浏览器UI
    },
    onProgress: (progress) => {
      console.log(`📊 进度: ${progress.current}/${progress.total}`)
    },
    onStepComplete: (result) => {
      const statusIcon = result.status === 'success' ? '✅' : '❌'
      console.log(`${statusIcon} 步骤: ${result.stepId} (${result.duration}ms)`)
    }
  })

  // 3. 执行任务
  console.log('🚀 开始执行任务...')
  const result = await runner.run(task)

  // 4. 输出结果
  console.log('📊 任务执行结果:', {
    status: result.status,
    duration: result.duration,
    successSteps: result.stepResults.filter(r => r.status === 'success').length,
    failedSteps: result.stepResults.filter(r => r.status === 'failed').length,
  })

  // 5. 性能报告
  if (config.getTaskExecutorConfig().performanceMonitoring) {
    const performanceReport = runner.getFormattedPerformanceReport()
    console.log('⏱️  性能报告:\n', performanceReport)
  }

  return result
}

// 使用示例
const task: Task = {
  id: 'demo-task',
  name: '演示任务',
  description: '这是一个演示任务',
  script: 'console.log("Hello, World!")',
  steps: [
    {
      id: 'step-1',
      action: 'goto',
      params: { url: 'https://www.google.com' },
      description: '打开Google'
    }
  ],
  config: {
    timeout: 30000,
    retries: 3,
    headless: false,
  },
  status: 'pending',
  createdAt: Date.now(),
  updatedAt: Date.now()
}

executeTaskWithMonitoring(task)
  .then(result => {
    console.log('✅ 任务执行完成:', result.status)
  })
  .catch(error => {
    console.error('❌ 任务执行失败:', error)
  })
```

---

## 📝 代码注释规范

所有新增代码都遵循详细的注释规范：

1. **文件级注释**: 说明文件用途和主要功能
2. **类级注释**: 描述类的职责和使用场景
3. **方法级注释**: 包含参数说明、返回值、使用示例
4. **行级注释**: 解释复杂逻辑和关键步骤
5. **类型注释**: 详细的接口和类型定义

```typescript
/**
 * 任务执行器类
 * 核心任务执行逻辑，提供智能重试、自动优化、性能监控等功能
 *
 * @example
 * ```typescript
 * const runner = new TaskRunner()
 * const result = await runner.run(task)
 * ```
 */
export class TaskRunner {
  /**
   * 执行任务
   * @param task 要执行的任务
   * @returns 任务执行结果
   */
  async run(task: Task): Promise<TaskResult> {
    // 实现细节...
  }
}
```

---

## 🚀 后续开发计划

基于当前实现，后续可以继续开发以下功能：

1. **真实AI集成**: 集成@midscene/web的真实AI能力
2. **WebSocket实时通信**: 实现任务状态的实时推送
3. **错误诊断助手**: 智能分析和建议解决方案
4. **自动化测试**: 添加元测试和鲁棒性检查
5. **报告生成**: 生成详细的HTML报告
6. **数据库集成**: 持久化存储任务历史和执行记录

---

## 📞 技术支持

如有问题或建议，请查阅相关文档或联系开发团队。

- [项目README](../../README.md)
- [开发文档](../development/)
- [API文档](../api/)
