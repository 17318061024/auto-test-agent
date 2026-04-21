# 配置文件中心

这里包含了项目的所有配置文件，按用途分类整理。

## 📁 配置文件说明

### 🔧 环境配置
- `.env.example` - 环境变量示例模板
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

### 📝 代码规范
- `.eslintrc.json` - ESLint 代码检查规则
- `.prettierrc` - Prettier 代码格式化配置
- `tsconfig.json` - TypeScript 编译配置

## 🚀 使用说明

### 首次设置
1. 复制 `.env.example` 到 `.env`
2. 根据需要修改环境变量
3. 确保 `.env` 文件已添加到 `.gitignore`

### 开发环境
```bash
# 使用开发环境配置
cp config/.env.development .env
```

### 生产环境
```bash
# 使用生产环境配置
cp config/.env.production .env
```

## ⚙️ 配置说明

### 环境变量
- `PORT` - 服务器端口 (默认: 3000)
- `WS_PORT` - WebSocket 端口 (默认: 3001)
- `NODE_ENV` - 运行环境 (development/production)
- `CORS_ORIGIN` - CORS 允许的源地址

### 代码规范
- 项目使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- TypeScript 严格模式开启

## 📋 注意事项
- 不要将敏感信息提交到版本控制系统
- 生产环境配置应包含适当的安全设置
- 定期审查和更新依赖版本
