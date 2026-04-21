# Chromium集成指南

本项目使用提前下载的Chromium浏览器，集成到客户端内部，避免用户需要自行下载。

## 📦 什么是Chromium集成？

Chromium集成意味着：
- ✅ **提前准备**：开发时下载Chromium，作为项目资源
- ✅ **内置打包**：Chromium包含在客户端安装包中
- ✅ **开箱即用**：用户无需额外下载，直接使用
- ✅ **稳定可靠**：避免网络问题和下载失败

## 🚀 快速开始

### 1. 下载Chromium

使用提供的脚本自动下载对应平台的Chromium：

```bash
# 下载Chromium（自动检测平台）
pnpm download:chromium

# 或直接运行脚本
node scripts/download-chromium.js
```

### 2. 验证安装

下载完成后，检查Chromium是否正确安装：

```bash
# Windows
ls packages/desktop-client/chromium/chrome-win32

# macOS
ls packages/desktop-client/chromium/chrome-mac

# Linux
ls packages/desktop-client/chromium/chrome-linux
```

### 3. 构建和打包

构建项目时，Chromium会自动包含在内：

```bash
# 开发环境
pnpm build

# 生产打包
pnpm build:electron
```

## 📋 详细说明

### 支持的平台

- **Windows**: win64/chromium-win32.zip
- **macOS**: mac-arm64/chromium-mac-arm64.zip (ARM架构)
- **Linux**: ubuntu22.04/chromium-linux.zip

### 目录结构

```
packages/desktop-client/
└── chromium/
    ├── chrome-win32/          # Windows可执行文件
    │   └── chrome.exe
    ├── chrome-mac/            # macOS可执行文件
    │   └── Chromium.app
    └── chrome-linux/          # Linux可执行文件
        └── chrome
```

### 版本信息

- **Chromium版本**: 142.0.7444.162
- **来源**: [Playwright Chromium for Testing](https://playwright.dev/)
- **稳定性**: 生产级别，经过充分测试

## 🔧 工作原理

### ChromeManager智能选择策略

1. **优先用户Chrome**：使用用户系统安装的Chrome浏览器
2. **内置Chromium**：如果用户Chrome不可用，使用内置的Chromium
3. **Playwright Chromium**：最后尝试使用Playwright安装的Chromium

### 跨平台路径解析

ChromeManager会自动检测多个可能的Chromium路径：

```typescript
// 开发环境路径
path.join(process.cwd(), './chromium', platformDir)

// 生产环境路径（相对于可执行文件）
path.join(process.resourcesPath, './chromium', platformDir)

// 备用路径
path.join(__dirname, '../../..', './chromium', platformDir)
```

## 🛠️ 故障排除

### 问题1：下载失败

**症状**：运行`pnpm download:chromium`时下载失败

**解决方案**：
1. 检查网络连接
2. 手动下载对应平台的压缩包：
   - Windows: [下载链接](https://playwright.azureedge.net/chromium-for-testing/142.0.7444.162/win64/chromium-win32.zip)
   - macOS: [下载链接](https://playwright.azureedge.net/chromium-for-testing/142.0.7444.162/mac-arm64/chromium-mac-arm64.zip)
   - Linux: [下载链接](https://playwright.azureedge.net/chromium-for-testing/142.0.7444.162/ubuntu22.04/chromium-linux.zip)
3. 手动解压到`packages/desktop-client/chromium/`目录

### 问题2：打包后Chromium找不到

**症状**：开发环境正常，但打包后的客户端无法找到Chromium

**解决方案**：
1. 检查Electron打包配置，确保Chromium被包含
2. 验证`process.resourcesPath`路径
3. 检查文件权限

### 问题3：Chromium版本不兼容

**症状**：Chromium启动失败或功能异常

**解决方案**：
1. 确保下载的Chromium版本为142.0.7444.162
2. 重新下载：`rm -rf packages/desktop-client/chromium && pnpm download:chromium`
3. 检查Playwright兼容性

## 📊 文件大小

- **Windows**: ~350MB（解压后）
- **macOS**: ~380MB（解压后）
- **Linux**: ~360MB（解压后）

## 🔄 更新Chromium

如需更新Chromium版本：

1. 修改`scripts/download-chromium.js`中的版本号
2. 修改`packages/task-executor/src/ChromeManager.ts`中的版本号
3. 重新下载：`pnpm download:chromium`

## 📝 相关文件

- `scripts/download-chromium.js` - 下载脚本
- `packages/task-executor/src/ChromeManager.ts` - Chrome管理器
- `packages/desktop-client/chromium/` - Chromium存储目录

## ⚠️ 注意事项

1. **不运行时下载**：Chromium在开发时准备，不在用户电脑运行时下载
2. **平台匹配**：确保下载的Chromium与目标平台匹配
3. **文件权限**：确保Chromium可执行文件有执行权限
4. **版本固定**：使用特定版本以确保稳定性

## 🎯 优势

相比运行时下载，内置Chromium的优势：

- ✅ **用户体验**：无需等待下载，开箱即用
- ✅ **稳定性**：避免网络问题和下载失败
- ✅ **可控性**：版本固定，行为可预测
- ✅ **离线支持**：完全离线环境也能使用
- ✅ **安全性**：使用官方验证的Chromium版本

---

**需要帮助？** 请查看项目README或提交Issue。
