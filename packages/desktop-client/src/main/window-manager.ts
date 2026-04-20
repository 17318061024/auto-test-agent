/**
 * 窗口管理器
 *
 * 功能：
 * 1. 管理主窗口
 * 2. 管理任务进度窗口
 * 3. 窗口状态管理
 */

import { BrowserWindow, app } from 'electron'
import path from 'path'

export class WindowManager {
  private mainWindow: BrowserWindow | null = null
  private progressWindow: BrowserWindow | null = null
  private isDevelopment: boolean

  constructor(isDevelopment = false) {
    this.isDevelopment = isDevelopment
  }

  /**
   * 创建主窗口
   */
  createMainWindow(): BrowserWindow {
    if (this.mainWindow) {
      this.mainWindow.focus()
      return this.mainWindow
    }

    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      icon: path.join(__dirname, '../../assets/icon.png'),
    })

    // 加载页面
    if (this.isDevelopment) {
      this.mainWindow.loadURL('http://localhost:5174')
      this.mainWindow.webContents.openDevTools()
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }

    // 窗口关闭事件
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })

    console.log('✅ 主窗口已创建')

    return this.mainWindow
  }

  /**
   * 创建任务进度窗口
   */
  createProgressWindow(): BrowserWindow {
    if (this.progressWindow) {
      this.progressWindow.focus()
      return this.progressWindow
    }

    this.progressWindow = new BrowserWindow({
      width: 600,
      height: 400,
      resizable: false,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      title: '任务执行中',
    })

    // 加载进度页面
    const progressPage = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background: #f5f5f5;
            }
            .container {
              background: white;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h2 {
              margin-top: 0;
              color: #333;
            }
            .progress-bar {
              width: 100%;
              height: 30px;
              background: #e0e0e0;
              border-radius: 15px;
              overflow: hidden;
              margin: 20px 0;
            }
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #4CAF50, #8BC34A);
              width: 0%;
              transition: width 0.3s ease;
            }
            .status {
              text-align: center;
              color: #666;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 id="title">正在执行任务...</h2>
            <div class="progress-bar">
              <div class="progress-fill" id="progress"></div>
            </div>
            <div class="status" id="status">准备中...</div>
          </div>
          <script>
            const ipc = require('electron').ipcRenderer;

            let progress = 0;
            const progressBar = document.getElementById('progress');
            const statusText = document.getElementById('status');

            ipc.on('task:progress:update', (event, data) => {
              progress = data.progress || 0;
              progressBar.style.width = progress + '%';
              statusText.textContent = data.status || '执行中...';
            });

            ipc.on('task:completed', (event, data) => {
              progressBar.style.width = '100%';
              progressBar.style.background = '#4CAF50';
              document.getElementById('title').textContent = '任务完成！';
              statusText.textContent = '总耗时: ' + (data.duration / 1000).toFixed(2) + 's';

              setTimeout(() => {
                window.close();
              }, 3000);
            });

            ipc.on('task:failed', (event, data) => {
              progressBar.style.background = '#f44336';
              document.getElementById('title').textContent = '任务失败';
              statusText.textContent = '错误: ' + data.error;
            });
          </script>
        </body>
      </html>
    `

    this.progressWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(progressPage))

    this.progressWindow.on('closed', () => {
      this.progressWindow = null
    })

    console.log('✅ 进度窗口已创建')

    return this.progressWindow
  }

  /**
   * 更新任务进度
   */
  updateProgress(progress: number, status: string): void {
    if (!this.progressWindow) {
      this.createProgressWindow()
    }

    this.progressWindow?.webContents.send('task:progress:update', {
      progress,
      status,
    })
  }

  /**
   * 任务完成
   */
  taskCompleted(data: { duration: number }): void {
    if (!this.progressWindow) return

    this.progressWindow.webContents.send('task:completed', data)
  }

  /**
   * 任务失败
   */
  taskFailed(data: { error: string }): void {
    if (!this.progressWindow) return

    this.progressWindow.webContents.send('task:failed', data)
  }

  /**
   * 关闭进度窗口
   */
  closeProgressWindow(): void {
    if (this.progressWindow) {
      this.progressWindow.close()
      this.progressWindow = null
    }
  }

  /**
   * 获取主窗口
   */
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  /**
   * 获取进度窗口
   */
  getProgressWindow(): BrowserWindow | null {
    return this.progressWindow
  }

  /**
   * 关闭所有窗口
   */
  closeAllWindows(): void {
    if (this.mainWindow) {
      this.mainWindow.close()
      this.mainWindow = null
    }

    if (this.progressWindow) {
      this.progressWindow.close()
      this.progressWindow = null
    }
  }
}
