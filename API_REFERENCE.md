# 🔌 API 接口文档

## 📖 概述

本文档描述了 Auto Test Agent 的所有 API 接口，包括 REST API 和 WebSocket 事件。

## 🌐 基础信息

**基础URL**: `http://localhost:3000` (可配置)
**WebSocket URL**: `ws://localhost:3001` (可配置)
**数据格式**: JSON
**字符编码**: UTF-8

## 📋 目录

- [REST API](#rest-api)
  - [健康检查](#健康检查)
  - [任务管理](#任务管理)
  - [客户端管理](#客户端管理)
  - [报告管理](#报告管理)
  - [Mock任务](#mock任务)
- [WebSocket 事件](#websocket-事件)
  - [客户端 → 服务器](#客户端--服务器)
  - [服务器 → 客户端](#服务器--客户端)

---

## 🌐 REST API

### 健康检查

#### GET /health

检查服务器健康状态。

**请求示例**:
```bash
curl http://localhost:3000/health
```

**响应示例**:
```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": 1713576000000,
  "uptime": 3600.5,
  "environment": "development",
  "server": {
    "http": "http://localhost:3000",
    "ws": "ws://localhost:3001"
  }
}
```

**状态码**:
- `200 OK` - 服务器正常
- `500 Internal Server Error` - 服务器错误

---

### 任务管理

#### GET /api/tasks

获取所有任务列表。

**请求示例**:
```bash
curl http://localhost:3000/api/tasks
```

**响应示例**:
```json
[
  {
    "id": "task_1713576000000_abc123",
    "name": "Google 搜索测试",
    "description": "测试 Google 搜索功能",
    "script": "打开 Google 页面，搜索关键词",
    "config": {
      "timeout": 30000,
      "retries": 3,
      "headless": false
    },
    "status": "completed",
    "createdAt": 1713576000000,
    "updatedAt": 1713576100000
  }
]
```

**状态码**:
- `200 OK` - 成功获取任务列表

---

#### GET /api/tasks/:id

获取单个任务详情。

**请求参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | ✅ | 任务ID |

**请求示例**:
```bash
curl http://localhost:3000/api/tasks/task_1713576000000_abc123
```

**响应示例**:
```json
{
  "id": "task_1713576000000_abc123",
  "name": "Google 搜索测试",
  "description": "测试 Google 搜索功能",
  "script": "打开 Google 页面，搜索关键词",
  "steps": [
    {
      "id": "step_1",
      "action": "navigate",
      "params": { "url": "https://www.google.com" }
    }
  ],
  "config": {
    "timeout": 30000,
    "retries": 3,
    "headless": false
  },
  "status": "completed",
  "createdAt": 1713576000000,
  "updatedAt": 1713576100000
}
```

**状态码**:
- `200 OK` - 成功获取任务
- `404 Not Found` - 任务不存在

---

#### POST /api/tasks

创建新任务。

**请求体**:
```json
{
  "name": "Google 搜索测试",
  "description": "测试 Google 搜索功能",
  "script": "打开 Google 页面，搜索关键词",
  "steps": [
    {
      "id": "step_1",
      "action": "navigate",
      "params": { "url": "https://www.google.com" },
      "description": "打开 Google 首页"
    },
    {
      "id": "step_2",
      "action": "input",
      "params": {
        "selector": "textarea[name='q']",
        "value": "华为"
      },
      "description": "输入搜索关键词"
    },
    {
      "id": "step_3",
      "action": "click",
      "params": {
        "selector": "input[value='Google 搜索']"
      },
      "description": "点击搜索按钮"
    }
  ],
  "config": {
    "timeout": 30000,
    "retries": 3,
    "headless": false
  }
}
```

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d @task.json
```

**响应示例**:
```json
{
  "id": "task_1713576000000_xyz789",
  "name": "Google 搜索测试",
  "description": "测试 Google 搜索功能",
  "script": "打开 Google 页面，搜索关键词",
  "steps": [...],
  "config": {
    "timeout": 30000,
    "retries": 3,
    "headless": false
  },
  "status": "pending",
  "createdAt": 1713576000000,
  "updatedAt": 1713576000000
}
```

**状态码**:
- `201 Created` - 任务创建成功
- `400 Bad Request` - 请求数据无效

**验证规则**:
- `name`: 必需，非空字符串
- `script`: 必需，非空字符串
- `steps`: 可选，如果是数组则必须包含有效步骤
- `config.timeout`: 可选，数字，大于1000
- `config.retries`: 可选，数字，0-10之间
- `config.headless`: 可选，布尔值

---

#### PUT /api/tasks/:id

更新任务。

**请求参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | ✅ | 任务ID |

**请求体**:
```json
{
  "name": "Google 搜索测试 (更新)",
  "description": "更新后的描述",
  "status": "running"
}
```

**请求示例**:
```bash
curl -X PUT http://localhost:3000/api/tasks/task_1713576000000_abc123 \
  -H "Content-Type: application/json" \
  -d @update.json
```

**响应示例**:
```json
{
  "id": "task_1713576000000_abc123",
  "name": "Google 搜索测试 (更新)",
  "description": "更新后的描述",
  "status": "running",
  "updatedAt": 1713576150000
}
```

**状态码**:
- `200 OK` - 任务更新成功
- `404 Not Found` - 任务不存在
- `400 Bad Request` - 请求数据无效

---

#### DELETE /api/tasks/:id

删除任务。

**请求参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | ✅ | 任务ID |

**请求示例**:
```bash
curl -X DELETE http://localhost:3000/api/tasks/task_1713576000000_abc123
```

**状态码**:
- `204 No Content` - 任务删除成功
- `404 Not Found` - 任务不存在

---

#### POST /api/tasks/:id/run

运行任务。

**请求参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | ✅ | 任务ID |

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/tasks/task_1713576000000_abc123/run
```

**响应示例**:
```json
{
  "message": "任务已分配",
  "taskId": "task_1713576000000_abc123",
  "clientId": "client_socket_id"
}
```

**状态码**:
- `200 OK` - 任务已分配
- `404 Not Found` - 任务不存在
- `400 Bad Request` - 没有可用的客户端

---

#### POST /api/tasks/:id/cancel

取消正在运行的任务。

**请求参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | ✅ | 任务ID |

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/tasks/task_1713576000000_abc123/cancel
```

**响应示例**:
```json
{
  "message": "任务已取消"
}
```

**状态码**:
- `200 OK` - 任务已取消
- `404 Not Found` - 任务不存在
- `400 Bad Request` - 任务未在运行中

---

#### GET /api/tasks/:id/reports

获取任务的所有报告。

**请求参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | ✅ | 任务ID |

**请求示例**:
```bash
curl http://localhost:3000/api/tasks/task_1713576000000_abc123/reports
```

**响应示例**:
```json
[
  {
    "id": "report_001",
    "taskId": "task_1713576000000_abc123",
    "status": "completed",
    "duration": 15000,
    "steps": [...],
    "createdAt": 1713576100000
  }
]
```

**状态码**:
- `200 OK` - 成功获取报告列表

---

### 客户端管理

#### GET /api/clients

获取所有客户端列表。

**请求示例**:
```bash
curl http://localhost:3000/api/clients
```

**响应示例**:
```json
[
  {
    "id": "client_socket_id",
    "name": "Desktop Client",
    "version": "0.1.0",
    "platform": "win32",
    "status": "online",
    "lastSeen": 1713576000000
  }
]
```

**状态码**:
- `200 OK` - 成功获取客户端列表

---

#### GET /api/clients/online

获取在线客户端列表。

**请求示例**:
```bash
curl http://localhost:3000/api/clients/online
```

**响应示例**:
```json
[
  {
    "id": "client_socket_id",
    "name": "Desktop Client",
    "version": "0.1.0",
    "platform": "win32",
    "status": "online",
    "lastSeen": 1713576000000
  }
]
```

**状态码**:
- `200 OK` - 成功获取在线客户端

---

### 报告管理

#### GET /api/reports

获取所有报告列表。

**查询参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| taskId | string | ❌ | 过滤特定任务的报告 |
| status | string | ❌ | 过滤特定状态的报告 |
| limit | number | ❌ | 返回数量限制 |
| offset | number | ❌ | 偏移量 |

**请求示例**:
```bash
curl "http://localhost:3000/api/reports?taskId=task_123&status=completed&limit=10"
```

**响应示例**:
```json
[
  {
    "id": "report_001",
    "taskId": "task_1713576000000_abc123",
    "status": "completed",
    "duration": 15000,
    "steps": [...],
    "createdAt": 1713576100000
  }
]
```

**状态码**:
- `200 OK` - 成功获取报告列表

---

#### GET /api/reports/:id

获取单个报告详情。

**请求参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | ✅ | 报告ID |

**请求示例**:
```bash
curl http://localhost:3000/api/reports/report_001
```

**响应示例**:
```json
{
  "id": "report_001",
  "taskId": "task_1713576000000_abc123",
  "status": "completed",
  "duration": 15000,
  "steps": [
    {
      "stepId": "step_1",
      "action": "navigate",
      "status": "success",
      "duration": 2341,
      "screenshot": "base64_encoded_image",
      "timestamp": 1713576000000
    }
  ],
  "performance": {
    "browserLaunch": 1200,
    "pageLoad": 2341,
    "aiInference": 8000,
    "visualRender": 500,
    "totalDuration": 15000
  },
  "createdAt": 1713576100000
}
```

**状态码**:
- `200 OK` - 成功获取报告
- `404 Not Found` - 报告不存在

---

### Mock任务

#### GET /api/mock

获取所有 Mock 任务。

**请求示例**:
```bash
curl http://localhost:3000/api/mock
```

**响应示例**:
```json
[
  {
    "id": "task_mock_001",
    "name": "Google 搜索华为",
    "description": "打开 Google 页面，搜索\"华为\"，点击 AI 模式按钮",
    "script": "自动化测试脚本",
    "steps": [
      {
        "id": "step_1",
        "action": "navigate",
        "params": { "url": "https://www.google.com/webhp" },
        "description": "打开页面 https://www.google.com/webhp"
      },
      {
        "id": "step_2",
        "action": "input",
        "params": {
          "selector": "textarea[name='q']",
          "value": "华为"
        },
        "description": "在搜索框中输入\"华为\""
      },
      {
        "id": "step_3",
        "action": "click",
        "params": {
          "selector": "input[value='Google 搜索']"
        },
        "description": "点击搜索按钮"
      }
    ],
    "config": {
      "timeout": 30000,
      "retries": 3,
      "headless": false
    }
  }
]
```

**状态码**:
- `200 OK` - 成功获取 Mock 任务列表

---

#### GET /api/mock/:id

获取单个 Mock 任务。

**请求参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | ✅ | Mock任务ID |

**请求示例**:
```bash
curl http://localhost:3000/api/mock/task_mock_001
```

**响应示例**: 同 `GET /api/mock`

**状态码**:
- `200 OK` - 成功获取 Mock 任务
- `404 Not Found` - Mock 任务不存在

---

#### POST /api/mock/:id/execute

执行 Mock 任务。

**请求参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | ✅ | Mock任务ID |

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/mock/task_mock_001/execute
```

**响应示例**:
```json
{
  "success": true,
  "result": {
    "taskId": "task_mock_001",
    "status": "completed",
    "duration": 7240,
    "steps": [
      {
        "stepId": "step_1",
        "action": "navigate",
        "status": "success",
        "duration": 2341,
        "result": {...}
      }
    ],
    "timestamp": 1713576000000
  }
}
```

**状态码**:
- `200 OK` - 任务执行成功
- `404 Not Found` - Mock 任务不存在
- `500 Internal Server Error` - 任务执行失败

---

## 🔌 WebSocket 事件

### 客户端 → 服务器

#### client:register

客户端注册到服务器。

**发送数据**:
```json
{
  "name": "Desktop Client",
  "version": "0.1.0",
  "platform": "win32"
}
```

**响应事件**: `client:ack`
```json
{
  "clientId": "client_socket_id"
}
```

---

#### heartbeat

客户端心跳。

**发送数据**: 无

**响应事件**: `heartbeat`
```json
{
  "timestamp": 1713576000000
}
```

---

#### task:progress

任务进度更新。

**发送数据**:
```json
{
  "taskId": "task_1713576000000_abc123",
  "currentStep": 2,
  "totalSteps": 5,
  "status": "running",
  "currentAction": "输入搜索关键词"
}
```

**服务器行为**: 广播给所有监听该任务的客户端

---

#### task:completed

任务完成通知。

**发送数据**:
```json
{
  "taskId": "task_1713576000000_abc123",
  "status": "completed",
  "duration": 15000,
  "steps": [...],
  "performance": {...}
}
```

**服务器行为**:
1. 保存报告到数据库
2. 广播给所有监听该任务的客户端
3. 发送 `task:completed` 事件

---

#### task:failed

任务失败通知。

**发送数据**:
```json
{
  "taskId": "task_1713576000000_abc123",
  "error": "元素未找到: textarea[name='q']",
  "step": 2,
  "stack": "Error: Element not found..."
}
```

**服务器行为**:
1. 保存错误报告
2. 广播失败事件
3. 发送 `task:failed` 事件

---

### 服务器 → 客户端

#### client:ack

客户端注册确认。

**发送数据**:
```json
{
  "clientId": "client_socket_id"
}
```

---

#### task:assigned

任务分配通知。

**发送数据**:
```json
{
  "taskId": "task_1713576000000_abc123",
  "script": "任务脚本内容",
  "config": {
    "timeout": 30000,
    "retries": 3,
    "headless": false
  }
}
```

---

#### task:cancelled

任务取消通知。

**发送数据**:
```json
{
  "taskId": "task_1713576000000_abc123",
  "reason": "用户取消"
}
```

---

#### task:progress

任务进度更新（广播）。

**发送数据**:
```json
{
  "taskId": "task_1713576000000_abc123",
  "currentStep": 2,
  "totalSteps": 5,
  "status": "running",
  "currentAction": "输入搜索关键词",
  "duration": 5000
}
```

---

#### task:completed

任务完成通知（广播）。

**发送数据**:
```json
{
  "taskId": "task_1713576000000_abc123",
  "reportId": "report_001",
  "status": "completed",
  "duration": 15000,
  "steps": [...],
  "performance": {...}
}
```

---

#### task:failed

任务失败通知（广播）。

**发送数据**:
```json
{
  "taskId": "task_1713576000000_abc123",
  "error": "元素未找到",
  "step": 2,
  "stack": "Error:...",
  "timestamp": 1713576000000
}
```

---

## 🔒 错误处理

### 标准错误响应格式

```json
{
  "error": "错误描述",
  "fields": {
    "fieldName": "具体错误信息"
  },
  "timestamp": 1713576000000
}
```

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 OK | 请求成功 |
| 201 Created | 资源创建成功 |
| 400 Bad Request | 请求参数错误 |
| 404 Not Found | 资源不存在 |
| 500 Internal Server Error | 服务器内部错误 |

---

## 📝 使用示例

### JavaScript (前端)

```javascript
// 获取任务列表
const response = await fetch('http://localhost:3000/api/tasks');
const tasks = await response.json();

// 创建新任务
const newTask = await fetch('http://localhost:3000/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '测试任务',
    script: '测试脚本',
    steps: [...]
  })
});

// WebSocket 连接
const socket = io('ws://localhost:3001');

// 监听任务进度
socket.on('task:progress', (data) => {
  console.log(`任务进度: ${data.currentStep}/${data.totalSteps}`);
});

// 监听任务完成
socket.on('task:completed', (data) => {
  console.log('任务完成:', data);
});
```

### Python

```python
import requests
import socketio

# 创建任务
response = requests.post('http://localhost:3000/api/tasks', json={
    'name': '测试任务',
    'script': '测试脚本'
})

task = response.json()
print(f"任务ID: {task['id']}")

# WebSocket 连接
sio = socketio.Client()

@sio.on('task:progress')
def on_progress(data):
    print(f"进度: {data['currentStep']}/{data['totalSteps']}")

@sio.on('task:completed')
def on_complete(data):
    print('任务完成!')

sio.connect('http://localhost:3001')
```

### cURL

```bash
# 获取任务列表
curl http://localhost:3000/api/tasks

# 创建任务
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"name":"测试任务","script":"测试脚本"}'

# 运行任务
curl -X POST http://localhost:3000/api/tasks/task_123/run

# 获取报告
curl http://localhost:3000/api/reports/report_001
```

---

**最后更新**: 2026-04-20
**API版本**: v0.1.0
