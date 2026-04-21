/**
 * 环境配置
 */

import inquirer from 'inquirer'
import { EnvironmentMonitor } from './environment-monitor.js'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface Config {
  serverUrl: string
  wsUrl: string
  autoStart: boolean
  headless: boolean
}

export async function setup(options?: { fix?: boolean }): Promise<void> {

  // 1. 环境检查
  if (options?.fix) {
    const monitor = new EnvironmentMonitor()
    await monitor.runAllChecks()
    await monitor.autoFix()
  }

  // 2. 询问配置
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'serverUrl',
      message: '请输入服务器地址:',
      default: 'http://localhost:3000',
    },
    {
      type: 'input',
      name: 'wsUrl',
      message: '请输入 WebSocket 地址:',
      default: 'ws://localhost:3001',
    },
    {
      type: 'confirm',
      name: 'autoStart',
      message: '是否开机自动启动?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'headless',
      message: '是否使用无头模式（不显示浏览器）?',
      default: false,
    },
  ])

  const config: Config = {
    serverUrl: answers.serverUrl,
    wsUrl: answers.wsUrl,
    autoStart: answers.autoStart,
    headless: answers.headless,
  }

  // 3. 保存配置
  const configDir = join(process.env.APPDATA || '', 'auto-test-agent')
  if (!existsSync(configDir)) {
    await mkdir(configDir, { recursive: true })
  }

  const configPath = join(configDir, 'config.json')
  await writeFile(configPath, JSON.stringify(config, null, 2))


  // 4. 注册自定义协议
  await registerProtocol()

  // 5. 配置开机自启
  if (config.autoStart) {
    await enableAutoStart()
  }

}

/**
 * 注册自定义协议
 */
async function registerProtocol(): Promise<void> {
  // TODO: 实现实际的协议注册逻辑
  // Windows: 使用 reg add 注册表
  // 示例:
  // reg add "HKCR\midscene" /ve /d "URL:midscene Protocol" /f
  // reg add "HKCR\midscene" /v "URL Protocol" /d "" /f
  // reg add "HKCR\midscene\shell\open\command" /ve /d "\"C:\path\to\client.exe\" \"%1\"" /f
}

/**
 * 配置开机自启
 */
async function enableAutoStart(): Promise<void> {
  // TODO: 实现实际的开机自启逻辑
  // Windows: 将快捷方式放到启动文件夹
  // 示例:
  // Startup folder: %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\
}
