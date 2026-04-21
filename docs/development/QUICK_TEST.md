# 🧪 快速测试脚本

## 方式 1: 通过网页界面（推荐）

1. **打开网页控制台**
   ```
   浏览器访问: http://localhost:5173
   ```

2. **点击 START 按钮**
   - 查看任务详情
   - 点击绿色 START 按钮
   - 观察日志输出

3. **观察浏览器自动化**
   - Chrome 自动打开
   - 自动执行搜索
   - 实时进度显示

---

## 方式 2: 通过 API 测试

### 1. 查看 Mock 任务
```bash
curl http://localhost:3000/api/mock
```

### 2. 执行任务
```bash
curl -X POST http://localhost:3000/api/mock/task_mock_001/execute
```

### 3. 查看结果
```bash
curl http://localhost:3000/api/tasks
```

---

## 方式 3: 浏览器控制台

在网页控制台的浏览器控制台 (F12) 中执行：

```javascript
// 获取任务列表
fetch('http://localhost:3000/api/mock')
  .then(res => res.json())
  .then(tasks => console.log('任务列表:', tasks))

// 执行任务
fetch('http://localhost:3000/api/mock/task_mock_001/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
  .then(res => res.json())
  .then(result => console.log('执行结果:', result))
```

---

## 预期输出

### 后端控制台
```
🚀 初始化浏览器...
✅ 浏览器初始化完成

⏳ 步骤 1/4: 打开页面 https://www.google.com/webhp
   ✓ 已导航到: https://www.google.com/webhp
✅ 步骤 1 完成 (耗时: 2341ms)

⏳ 步骤 2/4: 在搜索框中输入"华为"
   ✓ 已输入: "华为"
✅ 步骤 2 完成 (耗时: 1023ms)

⏳ 步骤 3/4: 点击搜索按钮
   ✓ 已点击: textarea[name="q"]
✅ 步骤 3 完成 (耗时: 1876ms)

⏳ 步骤 4/4: 等待结果加载
   ✓ 已等待: 2000ms
✅ 步骤 4 完成 (耗时: 2000ms)

✅ 任务执行完成！
⏱️  总耗时: 7240ms
📊 结果: {...}

🧹 浏览器已关闭
```

### 网页控制台日志
```
[时间] ✅ Mock 任务已加载
[时间] 🚀 开始执行任务...
[时间] 📋 任务: Google 搜索华为
[时间] 📝 描述: 打开 Google 页面，搜索"华为"，点击 AI 模式按钮
[时间] 1️⃣  创建任务...
[时间] ✅ 任务已创建: task_xxx
[时间] 2️⃣  运行任务...
[时间] ✅ 任务已分配给客户端: client_xxx
[时间] ⏳ 步骤 1/4: 打开页面 https://www.google.com/webhp - 完成
[时间] ⏳ 步骤 2/4: 在搜索框中输入"华为" - 完成
[时间] ⏳ 步骤 3/4: 点击搜索按钮 - 完成
[时间] ⏳ 步骤 4/4: 等待结果加载 - 完成
[时间] ✅ 任务执行完成！
[时间] 📊 结果已返回给服务端
```

---

## 🎯 完整流程验证

### ✅ 检查清单

- [ ] 后端服务器运行 (http://localhost:3000)
- [ ] 网页控制台可访问 (http://localhost:5173)
- [ ] Mock API 可访问
- [ ] Playwright 浏览器已安装
- [ ] START 按钮可点击
- [ ] 日志正常显示
- [ ] 浏览器自动化正常执行
- [ ] 结果正确返回

### 🎉 成功标志

看到以下输出表示成功：

1. ✅ 浏览器自动打开
2. ✅ Google 页面加载
3. ✅ "华为" 自动输入
4. ✅ 搜索按钮自动点击
5. ✅ 搜索结果显示
6. ✅ 浏览器自动关闭
7. ✅ 网页端显示完成日志
8. ✅ 后端控制台显示结果

---

**现在就试试吧！** 🚀
