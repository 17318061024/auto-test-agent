# 🚀 部署指南

## 📖 概述

本文档详细说明了如何部署 Auto Test Agent 系统，包括开发环境、测试环境和生产环境的部署步骤。

## 📋 目录

- [环境要求](#环境要求)
- [开发环境部署](#开发环境部署)
- [生产环境部署](#生产环境部署)
- [Docker部署](#docker部署)
- [配置管理](#配置管理)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)

---

## 🔧 环境要求

### 系统要求

**开发环境**:
- Node.js >= 18.0.0
- PNPM >= 8.0.0
- Git
- Chrome/Chromium (用于浏览器自动化)

**生产环境**:
- Node.js >= 18.0.0
- PNPM >= 8.0.0
- 不少于 2GB RAM
- 不少于 10GB 磁盘空间
- Chrome/Chromium 或系统浏览器

### 操作系统支持

- ✅ Windows 10/11
- ✅ macOS 12+
- ✅ Linux (Ubuntu 20.04+, Debian 11+)

---

## 💻 开发环境部署

### 1. 克隆项目

```bash
git clone https://github.com/liuxiaochuan111/auto-test-agent.git
cd auto-test-agent
```

### 2. 安装依赖

```bash
# 安装 PNPM (如果未安装)
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 3. 配置环境变量

```bash
# 复制开发环境配置
cp .env.development .env

# 根据需要修改配置
nano .env
```

### 4. 初始化环境

```bash
# 创建必要的目录
pnpm config:init

# 验证配置
pnpm config:validate
```

### 5. 安装 Playwright 浏览器

```bash
# 安装 Chromium 浏览器
npx playwright install chromium

# 如果需要其他浏览器
npx playwright install firefox webkit
```

### 6. 启动开发服务器

```bash
# 启动后端服务器 (http://localhost:3000)
pnpm dev:server

# 新开终端，启动网页控制台 (http://localhost:5173)
pnpm dev:web

# 或者同时启动所有服务
pnpm dev
```

### 7. 验证部署

```bash
# 检查服务器健康状态
curl http://localhost:3000/health

# 在浏览器中访问
# 网页控制台: http://localhost:5173
# 后端API: http://localhost:3000/api/mock
```

---

## 🌍 生产环境部署

### 1. 准备服务器

**推荐配置**:
- CPU: 2核+
- 内存: 4GB+
- 磁盘: 20GB+
- 操作系统: Ubuntu 20.04 LTS 或 Windows Server 2019+

### 2. 安装系统依赖

**Ubuntu/Debian**:
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PNPM
npm install -g pnpm

# 安装 Chrome
sudo apt install -y chromium-browser

# 安装构建工具
sudo apt install -y build-essential
```

**Windows Server**:
```powershell
# 下载并安装 Node.js
# https://nodejs.org/

# 安装 PNPM
npm install -g pnpm

# Chrome 会自动安装或使用系统默认浏览器
```

### 3. 部署应用

```bash
# 克隆项目
git clone https://github.com/liuxiaochuan111/auto-test-agent.git
cd auto-test-agent

# 安装依赖
pnpm install

# 安装 Playwright 浏览器
npx playwright install chromium --with-deps

# 复制生产环境配置
cp .env.production .env

# 编辑配置文件
nano .env
```

### 4. 配置生产环境

编辑 `.env` 文件，修改关键配置：

```bash
# 服务器配置
NODE_ENV=production
SERVER_HOST=0.0.0.0  # 监听所有网络接口
PORT=3000
WS_PORT=3001

# HTTPS 配置 (推荐)
HTTPS=true
WSS=true

# CORS 配置 (修改为你的域名)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# 数据路径 (使用绝对路径)
DATA_DIR=/var/lib/auto-test-agent/data
LOGS_DIR=/var/log/auto-test-agent
SCREENSHOTS_DIR=/var/lib/auto-test-agent/screenshots
REPORTS_DIR=/var/lib/auto-test-agent/reports
DATABASE_URL=/var/lib/auto-test-agent/tasks.db

# 任务配置
TASK_TIMEOUT=120000
MAX_RETRIES=3
DEFAULT_HEADLESS=true
SCREENSHOT_ON_FAILURE=true

# 日志配置
LOG_LEVEL=info
LOG_FILE=/var/log/auto-test-agent/server.log
```

### 5. 创建必要的目录

```bash
# 创建数据目录
sudo mkdir -p /var/lib/auto-test-agent/{data,screenshots,reports}
sudo mkdir -p /var/log/auto-test-agent

# 设置权限
sudo chown -R $USER:$USER /var/lib/auto-test-agent
sudo chown -R $USER:$USER /var/log/auto-test-agent
```

### 6. 构建应用

```bash
# 构建所有包
pnpm build

# 验证构建
pnpm config:validate
```

### 7. 设置进程管理

**使用 PM2 (推荐)**:

```bash
# 安装 PM2
npm install -g pm2

# 创建 ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'auto-test-server',
      script: 'packages/server/dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
}
EOF

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

**使用 Systemd (Linux)**:

```bash
# 创建服务文件
sudo nano /etc/systemd/system/auto-test-agent.service
```

```ini
[Unit]
Description=Auto Test Agent Server
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/auto-test-agent
Environment=NODE_ENV=production
ExecStart=/usr/bin/node packages/server/dist/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 重载 systemd 并启动服务
sudo systemctl daemon-reload
sudo systemctl enable auto-test-agent
sudo systemctl start auto-test-agent

# 检查状态
sudo systemctl status auto-test-agent
```

### 8. 配置反向代理 (可选)

**使用 Nginx**:

```bash
# 安装 Nginx
sudo apt install -y nginx

# 创建配置文件
sudo nano /etc/nginx/sites-available/auto-test-agent
```

```nginx
# HTTP 服务器配置
server {
    listen 80;
    server_name yourdomain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS 服务器配置
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL 证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket 代理
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 前端静态文件
    location / {
        root /path/to/auto-test-agent/packages/web-console/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/auto-test-agent /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9. 配置防火墙

```bash
# Ubuntu UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### 10. 验证部署

```bash
# 检查服务器状态
curl http://localhost:3000/health

# 检查进程状态
pm2 status

# 检查日志
pm2 logs auto-test-server
tail -f /var/log/auto-test-agent/server.log
```

---

## 🐳 Docker 部署

### 1. 创建 Dockerfile

**Dockerfile (后端)**:
```dockerfile
FROM node:18-alpine

# 安装 Chrome 依赖
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# 设置 Chromium 环境变量
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/packages/shared ./packages/shared
COPY packages/server ./packages/server

# 安装 PNPM 和依赖
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 构建应用
RUN pnpm build

# 暴露端口
EXPOSE 3000 3001

# 启动命令
CMD ["node", "packages/server/dist/index.js"]
```

**Dockerfile (前端)**:
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared ./packages/shared
COPY packages/web-console ./packages/web-console

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @auto-test-agent/web-console build

FROM nginx:alpine
COPY --from=builder /app/packages/web-console/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  server:
    build:
      context: .
      dockerfile: Dockerfile.server
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - SERVER_HOST=0.0.0.0
      - PORT=3000
      - WS_PORT=3001
    volumes:
      - ./data:/var/lib/auto-test-agent/data
      - ./logs:/var/log/auto-test-agent
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    ports:
      - "80:80"
    depends_on:
      - server
    restart: unless-stopped
```

### 3. 启动容器

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down
```

---

## 🔨 配置管理

### 环境变量配置

使用 `.env` 文件管理配置：

```bash
# 开发环境
cp .env.development .env

# 生产环境
cp .env.production .env
```

### 配置验证

```bash
# 验证配置
pnpm config:validate

# 查看配置
pnpm config:show
```

### 配置更新

```bash
# 修改配置后重启服务
pm2 restart auto-test-server

# 或使用 systemd
sudo systemctl restart auto-test-agent
```

---

## 📊 监控和维护

### 日志管理

```bash
# PM2 日志
pm2 logs auto-test-server

# 系统日志
tail -f /var/log/auto-test-agent/server.log

# 日志轮转 (logrotate)
sudo nano /etc/logrotate.d/auto-test-agent
```

```
/var/log/auto-test-agent/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reload auto-test-server
    endscript
}
```

### 性能监控

```bash
# PM2 监控
pm2 monit

# 系统资源
htop
iostat -x 1

# 磁盘空间
df -h
du -sh /var/lib/auto-test-agent
```

### 数据备份

```bash
# 备份脚本
#!/bin/bash
BACKUP_DIR="/backup/auto-test-agent"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
cp /var/lib/auto-test-agent/tasks.db $BACKUP_DIR/tasks_$DATE.db

# 备份配置
cp .env $BACKUP_DIR/.env_$DATE

# 压缩备份
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/*_$DATE.*

# 删除7天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### 定期维护

```bash
# 清理旧日志
find /var/log/auto-test-agent -name "*.log" -mtime +30 -delete

# 清理临时文件
find /tmp/auto-test-agent -type f -mtime +7 -delete

# 清理截图 (保留最近30天)
find /var/lib/auto-test-agent/screenshots -type f -mtime +30 -delete
```

---

## 🔧 故障排除

### 常见问题

**1. 端口被占用**
```bash
# 查找占用端口的进程
lsof -i :3000
netstat -tulpn | grep :3000

# 终止进程
kill -9 <PID>
```

**2. Chrome 无法启动**
```bash
# 检查 Chrome 安装
which chromium-browser
google-chrome --version

# 重新安装 Chrome
sudo apt install --reinstall chromium-browser
```

**3. 权限问题**
```bash
# 修复文件权限
sudo chown -R $USER:$USER /var/lib/auto-test-agent
sudo chmod -R 755 /var/lib/auto-test-agent
```

**4. 内存不足**
```bash
# 检查内存使用
free -h

# 创建交换空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 日志分析

```bash
# 错误日志
grep "ERROR" /var/log/auto-test-agent/server.log

# 最近1小时的日志
find /var/log/auto-test-agent -name "*.log" -mmin -60 -exec tail -f {} \;

# 统计错误类型
grep "ERROR" /var/log/auto-test-agent/server.log | awk '{print $5}' | sort | uniq -c
```

---

## 🔄 更新部署

```bash
# 1. 备份当前版本
cp -r /path/to/auto-test-agent /path/to/auto-test-agent.backup

# 2. 拉取最新代码
git pull origin main

# 3. 安装依赖
pnpm install

# 4. 构建应用
pnpm build

# 5. 重启服务
pm2 restart auto-test-server

# 6. 验证更新
curl http://localhost:3000/health
```

---

## 📞 支持

如有部署问题，请：
1. 查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. 检查日志文件
3. 提交 GitHub Issue

---

**文档版本**: v1.0
**最后更新**: 2026-04-20
