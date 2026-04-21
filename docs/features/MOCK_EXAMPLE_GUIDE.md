# 🎯 Mock 示例完整使用指南

## 📖 功能概述

这是一个完整的端到端 Mock 示例，演示了从网页点击到自动执行的完整流程：

### 🔄 完整流程

```
┌─────────────────┐      1. 点击 START      ┌──────────────────┐
│   网页控制台      │ ───────────────────────►│   后端服务器      │
│  (Web Console)   │                        │   (Server)        │
└────────┬────────┘                        └────────┬─────────┘
         │                                          │
         │ 2. 调用 API                                │ 3. 执行任务
         │                                          │
         ▼                                          ▼
┌─────────────────┐                      ┌──────────────────┐
│   浏览器窗口      │ ◄─────────────────────►│   Playwright      │
│  (实时显示)       │      指令执行          │   (自动化引擎)    │
└─────────────────┘                      └──────────────────┘
```

### 🎬 任务内容

**任务名称**: Google 搜索华为

**执行步骤**:
1. 打开页面 `https://www.google.com/webhp`
2. 在搜索框中输入"华为"
3. 点击搜索按钮
4. 等待结果加载

---

## 🚀 快速开始

### 1. 确保服务运行

```bash
# 后端服务器应该已经运行在
curl http://localhost:3000/health

# 应该返回: {"status":"ok","timestamp":...}
```

### 2. 打开网页控制台

在浏览器中访问: **http://localhost:5173**

### 3. 点击 START 按钮

- 页面会显示 Mock 任务详情
- 点击绿色的 **START** 按钮
- 观察右侧的执行日志

### 4. 观察浏览器自动化

- 会自动打开 Chrome 浏览器
- 自动执行 Google 搜索"华为"
- 实时显示执行进度
- 完成后自动关闭浏览器

---

## 📊 执行过程

### 阶段 1: 初始化
```
✅ Mock 任务已加载
🚀 开始执行任务...
📋 任务: Google 搜索华为
```

### 阶段 2: 任务创建
```
1️⃣  创建任务...
✅ 任务已创建: task_xxx
```

### 阶段 3: 任务执行
```
2️⃣  运行任务...
✅ 任务已分配给客户端

⏳ 步骤 1/4: 打开页面 https://www.google.com/webhp
✅ 步骤 1 完成 (耗时: 2341ms)

⏳ 步骤 2/4: 在搜索框中输入"华为"
✅ 步骤 2 完成 (耗时: 1023ms)

⏳ 步骤 3/4: 点击搜索按钮
✅ 步骤 3 完成 (耗时: 1876ms)

⏳ 步骤 4/4: 等待结果加载
✅ 步骤 4 完成 (耗时: 2134ms)
```

### 阶段 4: 完成
```
✅ 任务执行完成！
📊 结果已返回给服务端
⏱️  总耗时: 7374ms
```

---

## 🔌 API 端点

### 获取 Mock 任务
```bash
curl http://localhost:3000/api/mock
```

**响应**:
```json
[
  {
    "id": "task_mock_001",
    "name": "Google 搜索华为",
    "description": "打开 Google 页面，搜索\"华为\"，点击 AI 模式按钮",
    "steps": [...]
  }
]
```

### 执行 Mock 任务
```bash
curl -X POST http://localhost:3000/api/mock/task_mock_001/execute
```

**响应**:
```json
{
  "success": true,
  "result": {
    "taskId": "task_mock_001",
    "status": "completed",
    "duration": 7374,
    "steps": [...]
  }
}
```

---

## 🎛️ 技术细节

### 网页控制台
- **框架**: React + Vite
- **样式**: 原生 CSS
- **功能**: 
  - 显示任务详情
  - START 按钮
  - 实时执行日志
  - 进度追踪

### 后端服务器
- **框架**: Express + Socket.io
- **功能**:
  - Mock 任务管理
  - 任务执行 API
  - 实时进度广播
  - WebSocket 支持

### 自动化引擎
- **框架**: Playwright
- **浏览器**: Chromium
- **功能**:
  - 浏览器自动化
  - 步骤执行
  - 错误处理
  - 结果收集

---

## 🧪 测试命令

### 1. 手动测试 API
```bash
# 获取 Mock 任务
curl http://localhost:3000/api/mock

# 执行任务
curl -X POST http://localhost:3000/api/mock/task_mock_001/execute

# 查看结果
curl http://localhost:3000/api/tasks
```

### 2. 网页界面测试
1. 访问 http://localhost:5173
2. 查看任务详情
3. 点击 START 按钮
4. 观察日志和浏览器自动化

### 3. 自动化测试
```javascript
// 在浏览器控制台执行
fetch('http://localhost:3000/api/mock/task_mock_001/execute', {
  method: 'POST'
})
.then(res => res.json())
.then(data => console.log('结果:', data))
```

---

## 🐛 故障排除

### 问题 1: 页面无法访问
**解决**: 确保网页控制台在运行
```bash
curl http://localhost:5173
```

### 问题 2: 点击 START 无反应
**解决**: 
1. 打开浏览器开发者工具 (F12)
2. 查看控制台是否有错误
3. 确保后端服务器正在运行

### 问题 3: 浏览器无法启动
**解决**:
1. 确保 Playwright 已安装
```bash
cd packages/server
npx playwright install chromium
```

2. 检查防火墙设置

### 问题 4: 任务执行失败
**解决**:
1. 查看后端控制台日志
2. 检查网络连接
3. 尝试手动执行单个步骤

---

## 📸 预期结果

### 浏览器行为
- ✅ 自动打开 Chrome 浏览器
- ✅ 导航到 Google
- ✅ 输入"华为"
- ✅ 点击搜索按钮
- ✅ 显示搜索结果
- ✅ 自动关闭

### 网页控制台
- ✅ 实时显示执行步骤
- ✅ 显示每步耗时
- ✅ 显示最终结果
- ✅ 打印完整日志

### 后端服务器
- ✅ 接收执行请求
- ✅ 广播进度事件
- ✅ 返回执行结果
- ✅ 打印详细日志

---

## 🎓 学习要点

### 1. 完整的自动化流程
从用户点击到任务完成的端到端流程

### 2. 实时通信
网页端、服务端、自动化引擎之间的实时通信

### 3. 错误处理
各个阶段的错误处理和恢复机制

### 4. 进度追踪
实时进度更新和状态管理

---

## 🚀 下一步

### 自定义任务
您可以修改 `packages/server/src/mock/tasks.ts` 来自定义任务：

```typescript
{
  id: 'task_custom_001',
  name: '我的自定义任务',
  description: '执行我的测试流程',
  steps: [
    {
      id: 'step_1',
      action: 'navigate',
      params: { url: 'https://www.example.com' },
      description: '打开网站'
    },
    {
      id: 'step_2',
      action: 'input',
      params: { selector: '#username', value: 'test' },
      description: '输入用户名'
    },
    {
      id: 'step_3',
      action: 'click',
      params: { selector: '#submit' },
      description: '点击提交'
    }
  ]
}
```

### 添加更多功能
- 截图功能
- 数据导出
- 报告生成
- 邮件通知

---

**现在就开始体验完整的自动化测试流程吧！** 🎉

*最后更新: 2026-04-20*
