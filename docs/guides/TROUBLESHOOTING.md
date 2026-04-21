# 🔧 故障排除指南

## 📖 概述

本文档提供了 Auto Test Agent 常见问题的解决方案和调试技巧。

## 📋 目录

- [快速诊断](#快速诊断)
- [安装问题](#安装问题)
- [运行时问题](#运行时问题)
- [性能问题](#性能问题)
- [网络问题](#网络问题)
- [浏览器问题](#浏览器问题)
- [调试技巧](#调试技巧)

---

## 🚀 快速诊断

### 系统健康检查

```bash
# 1. 检查服务器状态
curl http://localhost:3000/health

# 2. 检查进程状态
pm2 status
# 或
systemctl status auto-test-agent

# 3. 检查端口占用
netstat -tulpn | grep -E ':(3000|3001|5173)'

# 4. 检查磁盘空间
df -h

# 5. 检查内存使用
free -h

# 6. 检查最近的错误
tail -50 /var/log/auto-test-agent/server.log | grep ERROR
```

### 配置验证

```bash
# 验证配置文件
pnpm config:validate

# 查看当前配置
pnpm config:show

# 检查环境文件
pnpm config:check
```

---

## 🔧 安装问题

### 问题 1: PNPM 安装失败

**症状**:
```
Error: Cannot find module 'pnpm'
```

**解决方案**:
```bash
# 方法 1: 使用 npm 安装
npm install -g pnpm

# 方法 2: 使用安装脚本
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 验证安装
pnpm --version
```

---

### 问题 2: 依赖安装失败

**症状**:
```
Error: Cannot resolve dependency
```

**解决方案**:
```bash
# 清理缓存
pnpm store prune

# 删除 node_modules
rm -rf node_modules **/node_modules

# 重新安装
pnpm install

# 如果仍然失败，尝试
pnpm install --force
```

---

### 问题 3: Playwright 浏览器安装失败

**症状**:
```
Error: Executable doesn't exist at ...
```

**解决方案**:
```bash
# 手动安装 Chromium
npx playwright install chromium

# 如果下载失败，使用镜像
export PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright/
npx playwright install chromium

# 验证安装
npx playwright --version
```

---

### 问题 4: TypeScript 编译错误

**症状**:
```
Error: Cannot find module '@/...'
```

**解决方案**:
```bash
# 检查 TypeScript 配置
cat tsconfig.json

# 清理构建缓存
rm -rf **/dist

# 重新构建
pnpm build

# 如果路径别名问题，检查 tsconfig.json 的 paths 配置
```

---

## 🚨 运行时问题

### 问题 1: 服务器启动失败

**症状**:
```
Error: Port 3000 is already in use
```

**诊断**:
```bash
# 查找占用端口的进程
lsof -i :3000
# 或
netstat -tulpn | grep :3000
```

**解决方案**:
```bash
# 方法 1: 终止占用端口的进程
kill -9 <PID>

# 方法 2: 更改端口
# 编辑 .env 文件
PORT=3001

# 方法 3: 查找并终止相关进程
pkill -f "node.*server"
```

---

### 问题 2: WebSocket 连接失败

**症状**:
```
Error: WebSocket connection failed
```

**诊断**:
```bash
# 检查 WebSocket 服务
curl http://localhost:3001/health

# 检查防火墙
sudo ufw status
```

**解决方案**:
```bash
# 1. 检查 WebSocket 服务是否启动
pm2 logs auto-test-server

# 2. 检查端口配置
# 确认 .env 中的 WS_PORT 正确

# 3. 检查 CORS 配置
# 确认 ALLOWED_ORIGINS 包含前端地址

# 4. 重启服务
pm2 restart auto-test-server
```

---

### 问题 3: 数据库连接失败

**症状**:
```
Error: Database is locked
Error: Unable to open database file
```

**诊断**:
```bash
# 检查数据库文件
ls -la /var/lib/auto-test-agent/tasks.db

# 检查文件权限
stat /var/lib/auto-test-agent/tasks.db
```

**解决方案**:
```bash
# 1. 修复权限
sudo chown -R $USER:$USER /var/lib/auto-test-agent
sudo chmod 644 /var/lib/auto-test-agent/tasks.db

# 2. 检查磁盘空间
df -h

# 3. 删除锁文件
rm -f /var/lib/auto-test-agent/tasks.db-lock
```

---

### 问题 4: 任务执行失败

**症状**:
```
Error: Task execution timeout
Error: Element not found
```

**诊断**:
```bash
# 查看任务日志
pm2 logs auto-test-server --lines 100

# 检查超时配置
grep TASK_TIMEOUT .env
```

**解决方案**:
```bash
# 1. 增加超时时间
# 编辑 .env
TASK_TIMEOUT=60000

# 2. 检查网络连接
ping google.com

# 3. 查看详细错误
# 在网页控制台查看错误日志
```

---

## ⚡ 性能问题

### 问题 1: 内存占用过高

**症状**:
- 应用占用内存超过 1GB
- 系统变慢

**诊断**:
```bash
# 检查内存使用
pm2 monit

# 检查内存泄漏
# 多次执行任务，观察内存是否持续增长
```

**解决方案**:
```bash
# 1. 设置内存限制
pm2 start ecosystem.config.js --max-memory-restart 1G

# 2. 定期重启
pm2 restart auto-test-server

# 3. 清理旧日志
find /var/log/auto-test-agent -name "*.log" -mtime +7 -delete

# 4. 优化配置
# 在 .env 中设置
DATABASE_POOL_SIZE=5
```

---

### 问题 2: CPU 占用过高

**症状**:
- CPU 使用率持续超过 80%
- 系统响应慢

**诊断**:
```bash
# 检查 CPU 使用
top -p $(pgrep -f auto-test)

# 检查进程线程
ps -eLf | grep auto-test
```

**解决方案**:
```bash
# 1. 限制并发任务数量
# 在代码中设置任务队列大小

# 2. 启用无头模式
DEFAULT_HEADLESS=true

# 3. 减少截图频率
SCREENSHOT_ON_FAILURE=false

# 4. 优化 Playwright 配置
SLOW_MO=0
```

---

### 问题 3: 响应时间过长

**症状**:
- API 响应时间 > 5秒
- 任务执行缓慢

**诊断**:
```bash
# 检查网络延迟
ping -c 10 google.com

# 检查磁盘 I/O
iostat -x 1

# 查看性能日志
grep "performance" /var/log/auto-test-agent/server.log
```

**解决方案**:
```bash
# 1. 优化网络
# 使用更快的 DNS 服务器

# 2. 优化数据库
# 定期清理和优化数据库

# 3. 启用缓存
# 在应用中启用 Redis 缓存

# 4. 优化配置
TASK_TIMEOUT=120000
DATABASE_POOL_SIZE=10
```

---

## 🌐 网络问题

### 问题 1: CORS 错误

**症状**:
```
Error: CORS policy blocked request
```

**诊断**:
```bash
# 检查 CORS 配置
grep ALLOWED_ORIGINS .env
```

**解决方案**:
```bash
# 1. 添加前端地址到允许列表
# 编辑 .env
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com

# 2. 重启服务器
pm2 restart auto-test-server

# 3. 如果使用代理，配置代理 CORS
```

---

### 问题 2: 网络超时

**症状**:
```
Error: Network timeout
Error: ETIMEDOUT
```

**诊断**:
```bash
# 检查网络连接
ping -c 10 8.8.8.8

# 检查 DNS 解析
nslookup google.com

# 检查防火墙
sudo ufw status
```

**解决方案**:
```bash
# 1. 增加超时时间
# 在 .env 中设置
TASK_TIMEOUT=120000

# 2. 检查防火墙规则
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp

# 3. 配置代理 (如果需要)
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
```

---

### 问题 3: WebSocket 连接不稳定

**症状**:
- WebSocket 频繁断开重连
- 实时更新延迟

**诊断**:
```bash
# 检查 WebSocket 日志
tail -f /var/log/auto-test-agent/server.log | grep -i websocket

# 检查网络稳定性
ping -i 1 -c 100 8.8.8.8
```

**解决方案**:
```bash
# 1. 增加心跳间隔
# 在 .env 中设置
CLIENT_HEARTBEAT_INTERVAL=60000

# 2. 启用自动重连
# 在客户端配置中启用

# 3. 优化网络配置
# 使用更稳定的网络连接
```

---

## 🌍 浏览器问题

### 问题 1: Chrome 无法启动

**症状**:
```
Error: Chrome failed to start
Error: Executable doesn't exist
```

**诊断**:
```bash
# 检查 Chrome 安装
which chromium-browser
google-chrome --version

# 检查 Playwright 浏览器
npx playwright --version
```

**解决方案**:
```bash
# 1. 重新安装 Playwright 浏览器
npx playwright install chromium --with-deps

# 2. 使用系统 Chrome
# 在 .env 中设置
PLAYWRIGHT_BROWSERS_PATH=/usr/bin/chromium-browser

# 3. 检查依赖
sudo apt install -y libnss3 libxss1 libasound2
```

---

### 问题 2: 元素定位失败

**症状**:
```
Error: Element not found
Error: Timeout waiting for selector
```

**诊断**:
```bash
# 查看任务日志
pm2 logs auto-test-server --lines 50

# 检查选择器
# 在网页控制台测试选择器
document.querySelector('selector')
```

**解决方案**:
```bash
# 1. 增加等待时间
# 在任务脚本中添加等待步骤

# 2. 使用更稳定的选择器
# 使用 ID 或 data 属性而非 class

# 3. 启用智能重试
# 确保 AutoOptimization 已启用

# 4. 查看截图
# 检查失败时的截图，分析页面状态
```

---

### 问题 3: 页面加载超时

**症状**:
```
Error: Navigation timeout
Error: Page load timeout
```

**诊断**:
```bash
# 检查网络速度
speedtest-cli

# 检查页面大小
curl -I https://example.com
```

**解决方案**:
```bash
# 1. 增加页面加载超时
# 在任务配置中设置
{
  "timeout": 60000,
  "waitUntil": "networkidle0"
}

# 2. 使用更快的网络
# 或在更快的网络环境下执行

# 3. 优化页面加载
# 等待关键元素而非整个页面
```

---

## 🐛 调试技巧

### 启用调试模式

```bash
# 1. 启用调试日志
# 编辑 .env
DEBUG=true
LOG_LEVEL=debug

# 2. 重启服务
pm2 restart auto-test-server

# 3. 查看详细日志
pm2 logs auto-test-server
```

### 使用开发者工具

```bash
# 1. 启用 headful 模式
# 在 .env 中设置
DEFAULT_HEADLESS=false

# 2. 启用 Playwright 调试
PLAYWRIGHT_DEVTOOLS=true

# 3. 慢速模式
SLOW_MO=1000
```

### 日志分析

```bash
# 查看错误日志
grep "ERROR" /var/log/auto-test-agent/server.log | tail -20

# 统计错误类型
grep "ERROR" /var/log/auto-test-agent/server.log | awk '{print $5}' | sort | uniq -c | sort -rn

# 查找特定时间段日志
grep "2024-04-20 14:" /var/log/auto-test-agent/server.log

# 实时监控日志
tail -f /var/log/auto-test-agent/server.log | grep --line-buffered "ERROR\|WARN"
```

### 性能分析

```bash
# 1. 启用性能分析
# 在 .env 中设置
ENABLE_PROFILING=true

# 2. 查看性能报告
grep "performance" /var/log/auto-test-agent/server.log

# 3. 分析慢查询
grep "duration" /var/log/auto-test-agent/server.log | awk -F'duration: ' '{print $2}' | sort -rn | head -10
```

### 内存分析

```bash
# 1. 检查内存使用
pm2 monit

# 2. 生成内存快照
pm2 save auto-test-server

# 3. 分析内存泄漏
# 多次执行任务，观察内存变化
```

---

## 📞 获取帮助

### 日志收集

在报告问题时，请提供以下信息：

```bash
# 1. 系统信息
uname -a
node --version
pnpm --version

# 2. 配置信息
pnpm config:show

# 3. 错误日志
pm2 logs auto-test-server --lines 100 --nostream

# 4. 系统资源
free -h
df -h
```

### 报告问题

1. **检查已有 Issues**: 在 GitHub 搜索类似问题
2. **创建新 Issue**: 提供详细的错误信息和复现步骤
3. **附上日志**: 包含相关的错误日志

---

## 📚 相关文档

- [API 文档](./API_REFERENCE.md)
- [部署指南](./DEPLOYMENT.md)
- [配置管理](./CONFIGURATION.md)

---

**文档版本**: v1.0
**最后更新**: 2026-04-20
