#!/usr/bin/env node
/**
 * @auto-test-agent/cli
 *
 * CLI 安装工具
 */

import { Command } from 'commander'
import chalk from 'chalk'
import { install } from './install.js'
import { setup } from './setup.js'
import { EnvironmentMonitor } from './environment-monitor.js'

const program = new Command()

program
  .name('auto-test-agent')
  .description('自动化测试桌面客户端 - 一行命令安装')
  .version('0.1.0')

program
  .command('install')
  .description('安装 auto-test-agent 桌面客户端')
  .option('-f, --fix', '自动修复环境问题')
  .action(async (options) => {
    console.log(chalk.cyan('\n🚀 开始安装 auto-test-agent...\n'))
    try {
      await install(options.fix)
      console.log(chalk.green('\n✅ 安装完成！\n'))
    } catch (error) {
      console.error(chalk.red('\n❌ 安装失败:'), error)
      process.exit(1)
    }
  })

program
  .command('setup')
  .description('配置环境')
  .option('-f, --fix', '自动修复环境问题')
  .action(async (options) => {
    console.log(chalk.cyan('\n⚙️  开始配置环境...\n'))
    try {
      await setup(options)
      console.log(chalk.green('\n✅ 配置完成！\n'))
    } catch (error) {
      console.error(chalk.red('\n❌ 配置失败:'), error)
      process.exit(1)
    }
  })

program
  .command('check')
  .description('检查环境')
  .action(async () => {
    console.log(chalk.cyan('\n🔍 检查环境...\n'))
    try {
      const monitor = new EnvironmentMonitor()
      await monitor.runAllChecks()
      console.log(chalk.green('\n✅ 环境检查完成！\n'))
    } catch (error) {
      console.error(chalk.red('\n❌ 检查失败:'), error)
      process.exit(1)
    }
  })

program.parse()
