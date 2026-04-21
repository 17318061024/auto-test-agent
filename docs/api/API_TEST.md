# API 测试脚本

## 1. 健康检查
```bash
curl http://localhost:3000/health
```

## 2. 创建任务
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试任务",
    "description": "测试自动化功能",
    "script": "打开谷歌并搜索 Hello World",
    "steps": [
      {
        "id": "1",
        "action": "open_url",
        "params": {"url": "https://www.google.com"}
      },
      {
        "id": "2", 
        "action": "search",
        "params": {"query": "Hello World"}
      }
    ],
    "config": {
      "timeout": 30000,
      "retries": 3
    }
  }'
```

## 3. 查看所有任务
```bash
curl http://localhost:3000/api/tasks
```

## 4. 查看特定任务
```bash
curl http://localhost:3000/api/tasks/{taskId}
```

## 5. 运行任务
```bash
curl -X POST http://localhost:3000/api/tasks/{taskId}/run
```

## 6. 查看所有客户端
```bash
curl http://localhost:3000/api/clients
```

## 7. 查看在线客户端
```bash
curl http://localhost:3000/api/clients/online
```

## 8. 查看所有报告
```bash
curl http://localhost:3000/api/reports
```

## 9. 查看任务的报告
```bash
curl http://localhost:3000/api/tasks/{taskId}/reports
```

## 10. 删除任务
```bash
curl -X DELETE http://localhost:3000/api/tasks/{taskId}
```

---

## 完整示例

### 创建并运行任务
```bash
# 1. 创建任务
TASK_RESPONSE=$(curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"name":"完整测试","script":"测试脚本","config":{}}')

# 2. 提取 taskId
TASK_ID=$(echo $TASK_RESPONSE | jq -r '.id')

# 3. 运行任务
curl -X POST http://localhost:3000/api/tasks/$TASK_ID/run

# 4. 查看结果
curl http://localhost:3000/api/tasks/$TASK_ID
```

---

## WebSocket 连接测试

使用 WebSocket 客户端连接到 `ws://localhost:3001`

### 事件监听
- `client:register` - 注册客户端
- `heartbeat` - 心跳
- `task:progress` - 任务进度
- `task:completed` - 任务完成
- `task:failed` - 任务失败
