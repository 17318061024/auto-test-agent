/**
 * @auto-test-agent/desktop-client
 *
 * Electron 主进程入口
 */

import { app, BrowserWindow } from 'electron'
import { ProtocolHandler } from './protocol.js'
import { WindowManager } from './window-manager.js'

let mainWindow: BrowserWindow | null = null
let protocolHandler: ProtocolHandler
let windowManager: WindowManager

function createWindow() {
  windowManager = new WindowManager(process.env.NODE_ENV === 'development')
  mainWindow = windowManager.createMainWindow()

  // 初始化协议处理器
  protocolHandler = new ProtocolHandler({
    onTaskReceived: (taskId, params) => {
      console.log('收到任务:', taskId, params)
      // TODO: 实现任务执行逻辑
    },
  })

  protocolHandler.setMainWindow(mainWindow)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 单实例锁
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时，聚焦到主窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
      if (mainWindow === null) {
        createWindow()
      }
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}
