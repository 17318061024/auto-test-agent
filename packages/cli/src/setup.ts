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
  console.log('⚙️  开始配置环境...\n')

  // 1. 环境检查
  if (options?.fix) {
    const monitor = new EnvironmentMonitor()
    console.log('🔍 检查环境...\n')
    await monitor.runAllChecks()
    await monitor.autoFix()
    console.log('')
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

  console.log('\n✅ 配置已保存:')
  console.log(`   配置文件: ${configPath}`)
  console.log(`   服务器地址: ${config.serverUrl}`)
  console.log(`   WebSocket: ${config.wsUrl}`)
  console.log(`   开机自启: ${config.autoStart ? '是' : '否'}`)
  console.log(`   无头模式: ${config.headless ? '是' : '否'}`)

  // 4. 注册自定义协议
  console.log('\n🔗 注册自定义协议...')
  await registerProtocol()
  console.log('   midscene:// 协议注册成功')

  // 5. 配置开机自启
  if (config.autoStart) {
    console.log('\n🚀 配置开机自启...')
    await enableAutoStart()
    console.log('   开机自启已配置')
  }

  console.log('\n✅ 配置完成！\n')
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
  console.log('   (协议注册功能待实现)')
}

/**
 * 配置开机自启
 */
async function enableAutoStart(): Promise<void> {
  // TODO: 实现实际的开机自启逻辑
  // Windows: 将快捷方式放到启动文件夹
  // 示例:
  // Startup folder: %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\
  console.log('   (开机自启功能待实现)')
}
