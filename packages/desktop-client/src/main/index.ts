/**
 * @auto-test-agent/desktop-client
 *
 * Electron 主进程入口
 *
 * 主要功能：
 * - 单实例应用管理
 * - 主窗口创建和管理
 * - 自定义协议处理 (midscene://)
 * - 任务执行和状态管理
 */

import { app, BrowserWindow, ipcMain, protocol, net, shell } from 'electron'
import path from 'path'
import fs from 'fs'
import { registerProtocol, startProtocolListening, ProtocolAction } from './ProtocolHandler.js'
import { wsClient, ConnectionState } from './WebSocketClient.js'
import { config } from '@auto-test-agent/shared'

/**
 * 全局变量
 */
let mainWindow: BrowserWindow | null = null
let currentTaskId: string | null = null
let activeBrowser: any = null

/**
 * 视频录制存储目录
 */
const VIDEOS_DIR = path.join(app.getPath('userData'), 'videos')
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true })
}

/**
 * 使用 Playwright + Midscene 视觉AI 执行任务
 * 通过截图 + 大模型识别来操作页面，不依赖 CSS 选择器
 */
async function runTaskWithBrowser(taskData: any): Promise<void> {
  const taskId = taskData.taskId || taskData.id
  const taskName = taskData.name || '未命名任务'
  const rawSteps = taskData.steps || []
  console.log(`🌐 使用视觉AI执行任务: ${taskName}, ${rawSteps.length} 步`)

  let browser: any = null
  let page: any = null
  let agent: any = null
  let videoPath: string | null = null

  const send = (channel: string, data: any) => {
    if (mainWindow) mainWindow.webContents.send(channel, data)
  }

  try {
    // 动态导入 playwright 和 midscene
    const { chromium } = await import('playwright')
    const { PlaywrightAgent } = await import('@midscene/web/playwright')

    // 启动有头浏览器
    browser = await chromium.launch({ headless: false })
    activeBrowser = browser
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      recordVideo: { dir: VIDEOS_DIR, size: { width: 1280, height: 800 } },
    })
    page = await context.newPage()

    // 初始化 Midscene 视觉AI agent
    agent = new PlaywrightAgent(page, {
      waitForNetworkIdleTimeout: 3000,
    })

    send('task:status:update', {
      taskId,
      status: 'running',
      currentStep: 0,
      totalSteps: rawSteps.length,
      progress: 0,
    })

    send('task:log', { taskId, message: `开始执行: ${taskName}` })

    // 逐步执行
    for (let i = 0; i < rawSteps.length; i++) {
      const step = rawSteps[i]
      const stepId = `step_${i + 1}`
      const stepAction = step.action
      const stepParams = step.params || []
      const stepDesc = step.description || ''
      const stepStart = Date.now()

      send('step:complete', { stepId, action: stepAction, status: 'running', duration: 0 })

      try {
        if (stepAction === 'open') {
          // 打开页面：直接用 playwright（不需要视觉识别）
          await page.goto(stepParams[0] || 'about:blank', { waitUntil: 'domcontentloaded', timeout: 30000 })
          // 等待页面稳定
          await page.waitForTimeout(2000)
        } else if (stepAction === 'aiAct') {
          // AI 自动规划执行（描述包含在 params[0] 或 description 中）
          const prompt = stepDesc || stepParams[0] || ''
          await agent.aiAct(prompt)
        } else if (stepAction === 'aiInput') {
          // 视觉AI 输入文字
          const locateText = stepParams[0] || stepDesc || '输入框'
          const value = stepParams[1] || ''
          await agent.aiInput(locateText, { value })
        } else if (stepAction === 'aiTap') {
          // 视觉AI 点击
          const locateText = stepParams[0] || stepDesc || '按钮'
          await agent.aiTap(locateText)
        } else if (stepAction === 'aiWaitFor') {
          // 视觉AI 等待条件
          const condition = stepDesc || stepParams[0] || '页面加载完成'
          await agent.aiWaitFor(condition, { timeoutMs: 15000 })
        } else if (stepAction === 'aiQuery') {
          // 视觉AI 提取数据
          const query = stepDesc || stepParams[0] || ''
          const result = await agent.aiQuery(query)
          console.log(`📊 AI查询结果:`, JSON.stringify(result))
        } else if (stepAction === 'wait') {
          await page.waitForTimeout(Number(stepParams[0]) || 1000)
        } else {
          // 其他操作：尝试用 AI 视觉方式执行
          const aiPrompt = stepDesc || `${stepAction} ${stepParams.join(' ')}`
          console.log(`🤖 尝试视觉AI执行: ${aiPrompt}`)
          await agent.aiAct(aiPrompt)
        }

        const duration = Date.now() - stepStart
        send('step:complete', { stepId, action: stepAction, status: 'success', duration })
        send('task:status:update', {
          taskId,
          status: 'running',
          currentStep: i + 1,
          totalSteps: rawSteps.length,
          progress: Math.round(((i + 1) / rawSteps.length) * 100),
        })
      } catch (stepErr: any) {
        const duration = Date.now() - stepStart
        send('step:complete', { stepId, action: stepAction, status: 'failed', duration, error: stepErr.message })
        throw new Error(`步骤 ${i + 1} (${stepAction}) 失败: ${stepErr.message}`)
      }
    }

    // 任务完成
    send('task:completed:update', { taskId, duration: Date.now() - (taskData.startTime || Date.now()) })
    wsClient.sendTaskCompleted(taskId, {})
    console.log(`✅ 任务完成: ${taskName}`)

  } catch (error: any) {
    console.error(`❌ 任务执行失败: ${taskName}`, error.message)
    send('task:failed:update', { taskId, error: error.message })
    wsClient.sendTaskFailed(taskId, { error: error.message })
  } finally {
    // 关闭浏览器前获取录制视频路径
    if (page) {
      try {
        const video = page.video()
        if (video) {
          videoPath = await video.path()
          console.log(`🎬 录制视频已保存: ${videoPath}`)
          send('task:video', { taskId, videoPath })
        }
      } catch (e) {
        console.warn('获取视频路径失败:', e)
      }
    }
    if (browser) {
      await browser.close().catch(() => {})
    }
    activeBrowser = null
  }
}

/**
 * 创建主窗口
 */
function createWindow(): BrowserWindow {
  console.log('🪟 创建主窗口...')

  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, '../../assets/icon.png'),
    title: 'Auto Test Agent',
  })

  // 开发模式加载Vite开发服务器
  if (process.env.VITE_DEV_SERVER_URL) {
    window.loadURL(process.env.VITE_DEV_SERVER_URL)
    window.webContents.openDevTools()
  } else {
    // 生产模式加载打包后的文件
    window.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // 窗口关闭事件
  window.on('closed', () => {
    console.log('🪟 主窗口已关闭')
    mainWindow = null
  })

  // 页面加载完成事件
  window.webContents.on('did-finish-load', () => {
    console.log('✅ 主窗口加载完成')

    // 如果有待处理的任务，发送给渲染进程
    if (currentTaskId) {
      window.webContents.send('task:assigned', { taskId: currentTaskId })
    }
  })

  console.log('✅ 主窗口创建成功')
  return window
}

/**
 * 处理协议调用
 * @param params 协议参数
 */
async function handleProtocolCall(params: { action: ProtocolAction; [key: string]: string | undefined }): Promise<void> {
  console.log('📞 处理协议调用:', params)

  try {
    switch (params.action) {
      case ProtocolAction.RUN:
        // 运行任务
        if (params.taskId) {
          await handleRunTask(params.taskId, params.server)
        } else {
          console.warn('⚠️ 缺少任务ID参数')
        }
        break

      case ProtocolAction.VIEW:
        // 查看任务
        if (params.taskId) {
          await handleViewTask(params.taskId, params.server)
        } else {
          console.warn('⚠️ 缺少任务ID参数')
        }
        break

      case ProtocolAction.CONFIG:
        // 打开配置页面
        handleOpenConfig()
        break

      case ProtocolAction.HEALTH:
        // 健康检查
        await handleHealthCheck()
        break

      default:
        console.warn('⚠️ 未知的协议操作:', params.action)
    }
  } catch (error) {
    console.error('❌ 处理协议调用失败:', error)
  }
}

/**
 * 处理运行任务
 * @param taskId 任务ID
 * @param server 服务器地址
 */
async function handleRunTask(taskId: string, server?: string): Promise<void> {
  console.log(`🚀 开始执行任务: ${taskId}`)

  // 保存当前任务ID
  currentTaskId = taskId

  // 显示主窗口
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()

    // 发送任务执行命令到渲染进程
    mainWindow.webContents.send('task:start', {
      taskId,
      server: server || config.getHTTPURL(),
    })

    console.log(`📤 任务执行命令已发送到渲染进程: ${taskId}`)
  } else {
    console.warn('⚠️ 主窗口未创建，无法执行任务')
  }
}

/**
 * 处理查看任务
 * @param taskId 任务ID
 * @param server 服务器地址
 */
async function handleViewTask(taskId: string, server?: string): Promise<void> {
  console.log(`👀 查看任务: ${taskId}`)

  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()

    // 发送查看任务命令到渲染进程
    mainWindow.webContents.send('task:view', {
      taskId,
      server: server || config.getHTTPURL(),
    })
  }
}

/**
 * 处理打开配置
 */
function handleOpenConfig(): void {
  console.log('⚙️ 打开配置页面')

  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()

    // 发送打开配置命令到渲染进程
    mainWindow.webContents.send('config:open', {})
  }
}

/**
 * 处理健康检查
 */
async function handleHealthCheck(): Promise<void> {
  console.log('🏥 执行健康检查')

  try {
    const health = {
      status: 'ok',
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
    }

    console.log('✅ 健康检查通过:', health)

    if (mainWindow) {
      mainWindow.webContents.send('health:check', health)
    }
  } catch (error) {
    console.error('❌ 健康检查失败:', error)
  }
}

/**
 * 设置IPC通信处理
 */
function setupIpcHandlers(): void {
  // 获取应用信息
  ipcMain.handle('app:getInfo', async () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
    }
  })

  // 获取配置信息
  ipcMain.handle('config:get', async () => {
    return config.getConfig()
  })

  // 任务状态更新
  ipcMain.on('task:status', (event, data) => {
    console.log('📊 任务状态更新:', data)

    // 通过WebSocket实时同步到服务器
    wsClient.sendTaskProgress(data.taskId, data)

    // 广播到所有窗口
    if (mainWindow) {
      mainWindow.webContents.send('task:status:update', data)
    }
  })

  // 任务完成
  ipcMain.on('task:completed', (event, data) => {
    console.log('✅ 任务完成:', data)
    currentTaskId = null

    // 通过WebSocket发送到服务器
    wsClient.sendTaskCompleted(data.taskId, data)

    // 广播到所有窗口
    if (mainWindow) {
      mainWindow.webContents.send('task:completed:update', data)
    }
  })

  // 任务失败
  ipcMain.on('task:failed', (event, data) => {
    console.error('❌ 任务失败:', data)
    currentTaskId = null

    // 通过WebSocket发送到服务器
    wsClient.sendTaskFailed(data.taskId, data)

    // 广播到所有窗口
    if (mainWindow) {
      mainWindow.webContents.send('task:failed:update', data)
    }
  })

  // 获取WebSocket连接状态
  ipcMain.handle('ws:getState', async () => {
    return wsClient.getConnectionState()
  })

  // 手动连接WebSocket
  ipcMain.on('ws:connect', () => {
    wsClient.connect()
  })

  // 手动断开WebSocket
  ipcMain.on('ws:disconnect', () => {
    wsClient.disconnect()
  })

  // 获取任务录制视频路径
  ipcMain.handle('video:getPath', async (_event, taskId: string) => {
    const files = fs.readdirSync(VIDEOS_DIR).filter(f => f.endsWith('.webm')).sort().reverse()
    // 返回最新的视频文件路径（Playwright 自动命名）
    if (files.length > 0) {
      return path.join(VIDEOS_DIR, files[0])
    }
    return null
  })

  // 获取所有录制视频列表
  ipcMain.handle('video:list', async () => {
    if (!fs.existsSync(VIDEOS_DIR)) return []
    return fs.readdirSync(VIDEOS_DIR)
      .filter(f => f.endsWith('.webm'))
      .map(f => {
        const fullPath = path.join(VIDEOS_DIR, f)
        const stat = fs.statSync(fullPath)
        return { name: f, path: fullPath, size: stat.size, createdAt: stat.birthtimeMs }
      })
      .sort((a, b) => b.createdAt - a.createdAt)
  })

  // 用系统播放器打开视频文件
  ipcMain.handle('video:openExternal', async (_event, filePath: string) => {
    await shell.openPath(filePath)
  })

  // 获取客户端名称
  ipcMain.handle('client:getName', async () => {
    return wsClient.loadClientName()
  })

  // 保存客户端名称并重新注册
  ipcMain.handle('client:setName', async (_event, name: string) => {
    wsClient.saveClientName(name)
    return true
  })

  // 获取客户端完整注册信息
  ipcMain.handle('client:getInfo', async () => {
    const customName = wsClient.loadClientName()
    return {
      clientName: customName,
      hostname: require('os').hostname(),
      username: require('os').userInfo().username,
      platform: process.platform,
      arch: process.arch,
      version: app.getVersion(),
    }
  })

  console.log('📡 IPC通信处理器已设置')
}

/**
 * 设置WebSocket事件处理
 */
function setupWebSocketHandlers(): void {
  // 任务分配
  wsClient.on('task:assigned', (data) => {
    console.log('📋 收到任务分配:', data)

    // 先通知渲染进程显示任务信息
    if (mainWindow) {
      mainWindow.webContents.send('task:assigned', data)
    }

    // 启动真实浏览器执行
    runTaskWithBrowser(data).catch((err) => {
      console.error('❌ 浏览器任务执行失败:', err)
    })
  })

  // 任务开始
  wsClient.on('task:start', (data) => {
    console.log('🚀 收到任务开始指令:', data)

    if (mainWindow) {
      mainWindow.webContents.send('task:start', data)
    }
  })

  // 任务进度
  wsClient.on('step:complete', (data) => {
    console.log('✅ 步骤完成:', data)

    if (mainWindow) {
      mainWindow.webContents.send('step:complete', data)
    }
  })

  // 步骤失败
  wsClient.on('step:failed', (data) => {
    console.log('❌ 步骤失败:', data)

    if (mainWindow) {
      mainWindow.webContents.send('step:failed', data)
    }
  })

  console.log('📡 WebSocket事件处理器已设置')
}

/**
 * 应用就绪事件处理
 */
app.whenReady().then(() => {
  console.log('🚀 应用已就绪')

  // 注册 video:// 协议用于本地视频播放
  protocol.handle('video', (request) => {
    const filePath = decodeURIComponent(request.url.replace('video://', ''))
    if (!fs.existsSync(filePath)) {
      return new Response('Not found', { status: 404 })
    }
    return net.fetch(`file://${filePath}`)
  })

  // 创建主窗口
  mainWindow = createWindow()

  // 设置IPC通信
  setupIpcHandlers()

  // 连接WebSocket服务器
  wsClient.connect()

  // 设置WebSocket事件处理
  setupWebSocketHandlers()

  // 启动协议监听
  startProtocolListening(handleProtocolCall)

  console.log('✅ 应用初始化完成')
})

/**
 * 激活事件处理（macOS）
 */
app.on('activate', () => {
  if (mainWindow === null) {
    console.log('🔄 重新创建主窗口（macOS）')
    mainWindow = createWindow()
  }
})

/**
 * 所有窗口关闭事件处理
 */
app.on('window-all-closed', () => {
  console.log('🪟 所有窗口已关闭')

  // 在macOS上，除非用户用Cmd+Q明确退出，否则应用保持活动状态
  if (process.platform !== 'darwin') {
    console.log('👋 退出应用')
    app.quit()
  }
})

/**
 * 应用退出前事件处理
 */
app.on('before-quit', () => {
  console.log('👋 应用即将退出')
  // 清理资源和保存状态
})

/**
 * 单实例锁处理
 */
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  console.log('🔒 已有实例运行，退出当前实例')
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.log('🔄 收到第二个实例启动请求')

    // 当运行第二个实例时，聚焦到主窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
      console.log('🪟 主窗口已聚焦')
    }

    // 处理协议参数
    const protocolArgs = commandLine.find(arg => arg.startsWith('midscene://'))
    if (protocolArgs) {
      console.log('📞 检测到协议参数:', protocolArgs)
      // 协议处理由startProtocolListening自动处理
    }
  })
}

/**
 * 注册自定义协议（必须在app.ready()之前调用）
 */
registerProtocol()

/**
 * 未捕获异常处理
 */
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error)
})

/**
 * 未处理的Promise拒绝处理
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason)
})

console.log(`
╔════════════════════════════════════════════════════════════╗
║              Auto Test Agent - Desktop Client              ║
║                                                              ║
║  Version: ${app.getVersion().padEnd(46)}║
║  Platform: ${process.platform.padEnd(45)}║
║  Arch: ${process.arch.padEnd(52)}║
╚════════════════════════════════════════════════════════════╝
`)
