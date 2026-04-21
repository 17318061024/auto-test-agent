# 本地开发环境状态

## ✅ 服务运行状态

### 后端服务器 (http://localhost:3000)
- **状态**: ✅ 运行正常
- **Health Check**: 通过
- **API 端点**: 可用

### WebSocket 服务器 (ws://localhost:3001)
- **状态**: ✅ 运行正常
- **端口**: 3001

### 网页控制台 (http://localhost:5173)
- **状态**: ✅ 运行正常
- **热更新**: 已启用

---

## 🎯 当前可访问的端点

### 任务管理
- `GET /api/tasks` - 获取所有任务
- `POST /api/tasks` - 创建新任务
- `GET /api/tasks/:id` - 获取任务详情
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务
- `POST /api/tasks/:id/run` - 运行任务
- `POST /api/tasks/:id/cancel` - 取消任务
- `GET /api/tasks/:id/reports` - 获取任务报告

### 客户端管理
- `GET /api/clients` - 获取所有客户端
- `GET /api/clients/online` - 获取在线客户端
- `GET /api/clients/:id` - 获取客户端详情

### 报告管理
- `GET /api/reports` - 获取所有报告
- `GET /api/reports/:id` - 获取报告详情

---

## 🧪 快速测试

### 1. 创建测试任务
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试任务",
    "description": "测试 API 功能",
    "script": "打开谷歌",
    "config": {
      "timeout": 30000,
      "retries": 3
    }
  }'
```

### 2. 查看所有任务
```bash
curl http://localhost:3000/api/tasks
```

### 3. 运行任务
```bash
# 替换 {taskId} 为实际的任务 ID
curl -X POST http://localhost:3000/api/tasks/{taskId}/run
```

---

## 📱 访问应用

1. **网页控制台**: http://localhost:5173
2. **API 根路径**: http://localhost:3000
3. **WebSocket**: ws://localhost:3001

---

## 💡 开发提示

- 修改代码会自动重新编译（热更新）
- 查看控制台输出了解实时状态
- 使用 `API_TEST.md` 中的脚本进行测试
- 所有数据存储在内存中（重启后清空）

---

**最后更新**: 2026-04-20 (服务正常运行中)
