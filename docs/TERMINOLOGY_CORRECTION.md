# 🔧 项目术语修正计划

## 🎯 **问题定位**

根据用户的补充说明，本项目**不是AI工具**，而是**浏览器自动化测试脚本执行工具**。

当前代码中存在大量误导性"AI"术语，需要系统修正。

## 📋 **需要修正的术语**

### ❌ **错误术语** → ✅ **正确术语**

| 错误术语 | 正确术语 | 说明 |
|---------|---------|------|
| AI适配器 | 自动化适配器 | @midscene/web是自动化工具，不是AI |
| AI操作 | 自动化操作 | 浏览器自动化操作 |
| AI查找 | 元素查找 | DOM元素定位 |
| 智能重试 | 自动重试 | 重试机制 |
| 智能选择 | 自动选择 | 策略选择 |
| 大模型 | 脚本引擎 | @midscene/web |
| AI能力 | 自动化能力 | 浏览器控制能力 |

### 📁 **需要重命名的文件**

```
❌ MidsceneAIAdapter.ts → ✅ MidsceneAutomationAdapter.ts
❌ AIActionType → ✅ AutomationActionType
❌ AIActionParams → ✅ AutomationActionParams
❌ AIActionResult → ✅ AutomationActionResult
❌ createAIAdapter() → ✅ createAutomationAdapter()
```

### 📝 **需要修正的描述**

```typescript
// ❌ 错误描述
/**
 * @midscene/web AI 适配器
 * 集成真实的AI自动化能力
 * - 真实的AI元素定位
 * - 自然语言操作
 * - 智能断言
 */

// ✅ 正确描述
/**
 * @midscene/web 自动化适配器
 * 浏览器自动化脚本执行引擎
 * - DOM元素定位和操作
 * - 页面导航和交互
 * - 自动化断言和验证
 */
```

## 🔄 **核心流程重新定位**

### ❌ **错误理解**
```
AI生成脚本 → AI执行操作 → AI分析结果
```

### ✅ **正确流程**
```
服务器脚本 → 客户端获取 → 浏览器自动化执行 → 结果回传
```

## 🎯 **项目本质**

**这是一个**：
- ✅ 浏览器自动化测试工具
- ✅ 桌面客户端 + 网页控制台
- ✅ 协议唤醒（midscene://）
- ✅ 脚本执行引擎（@midscene/web）
- ✅ 日志收集和结果回传

**这不是**：
- ❌ AI工具
- ❌ 大模型应用
- ❌ 智能分析工具

## 📊 **影响范围**

### 需要修改的文件
1. `packages/task-executor/src/MidsceneAIAdapter.ts` → 重命名
2. `packages/task-executor/src/TaskRunner.ts` → 术语修正
3. `packages/task-executor/src/PerformanceMonitor.ts` → 移除"智能"描述
4. `packages/task-executor/src/AutoOptimization.ts` → 重命名为`AutoRetry`
5. `packages/task-executor/src/ErrorDiagnosisAssistant.ts` → 重命名
6. 所有文档和README → 更新描述

### 更新引用
- `index.ts` 导入
- `TaskRunner.ts` 中的使用
- 所有类型引用

## 🚀 **实施建议**

### 选项A：立即全面重构（推荐）
- 系统性地重命名所有文件和术语
- 更新所有文档
- 确保项目描述准确

### 选项B：渐进式修正
- 先修正核心文件和主要描述
- 逐步清理其他误导性术语
- 在后续开发中持续修正

### 选项C：文档说明优先
- 在README中明确说明项目定位
- 添加"非AI工具"声明
- 保留现有代码，只更新描述

## 📝 **项目定位声明**

应该在README顶部添加：

```markdown
> **⚠️ 重要说明**: 这是一个**浏览器自动化测试工具**，不是AI工具。
> 本项目使用 @midscene/web 作为浏览器自动化引擎，通过桌面客户端执行自动化测试脚本。
> 不涉及大模型、AI生成或AI分析功能。
```

## 🎯 **核心价值主张**

重新定义项目的核心价值：

**不是**：
- ❌ AI驱动的智能测试
- ❌ 自动生成测试用例
- ❌ 智能分析和建议

**而是**：
- ✅ **便捷安装**：一行命令安装桌面客户端
- ✅ **远程控制**：网页按钮唤醒客户端执行任务
- ✅ **脚本执行**：调用浏览器自动化能力执行预定义脚本
- ✅ **实时反馈**：显示执行日志和错误信息
- ✅ **结果回传**：自动将执行结果传回服务器

## 🔄 **工作流程（正确理解）**

```
1. 用户安装客户端
   ↓ npx -y @auto-test-agent/cli install

2. 用户打开网页控制台
   ↓ 浏览器打开 http://localhost:5173

3. 点击"执行任务"按钮
   ↓ 触发 midscene://run?taskId=xxx

4. 客户端被唤醒
   ↓ Electron主进程接收协议

5. 客户端请求服务器获取脚本
   ↓ HTTP GET /api/tasks/:id

6. 客户端执行脚本
   ↓ @midscene/web + Chrome浏览器

7. 实时显示执行日志
   ↓ 客户端UI显示步骤、耗时、错误

8. 结果回传服务器
   ↓ WebSocket实时推送 + 最终HTTP POST

9. 任务完成
   ✅
```

## 📞 **下一步**

请选择处理方式：
- **选项A**: 立即全面重构（推荐）
- **选项B**: 渐进式修正
- **选项C**: 仅更新文档说明

这将确保项目定位准确，避免用户误解。
