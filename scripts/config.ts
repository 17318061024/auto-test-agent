/**
 * 配置管理工具
 * 用于初始化、验证和管理配置
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { config, validateConfig, getConfigSummary } from '../packages/shared/src/config.js'

/**
 * 创建必要的目录
 */
function createDirectories(): void {
  const dirs = [
    config.paths.dataDir,
    config.paths.logsDir,
    config.paths.tempDir,
    config.paths.screenshotsDir,
    config.paths.reportsDir,
    config.paths.tasksDir,
  ]

  console.log('📁 创建必要的目录...')

  dirs.forEach((dir) => {
    const fullPath = resolve(process.cwd(), dir)
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true })
      console.log(`✅ 创建目录: ${fullPath}`)
    } else {
      console.log(`ℹ️  目录已存在: ${fullPath}`)
    }
  })
}

/**
 * 验证配置
 */
function validateConfiguration(): void {
  console.log('🔍 验证配置...')

  const validation = validateConfig()

  if (validation.valid) {
    console.log('✅ 配置验证通过')
  } else {
    console.log('❌ 配置验证失败:')
    validation.errors.forEach((error) => {
      console.log(`  - ${error}`)
    })
    process.exit(1)
  }
}

/**
 * 显示配置摘要
 */
function showConfiguration(): void {
  console.log('📋 当前配置:')
  console.log(JSON.stringify(getConfigSummary(), null, 2))
}

/**
 * 初始化环境配置
 */
function initializeEnvironment(): void {
  console.log('🚀 初始化环境配置...')

  // 创建目录
  createDirectories()

  // 验证配置
  validateConfiguration()

  // 显示配置
  showConfiguration()

  console.log('✅ 环境初始化完成')
}

/**
 * 检查环境文件
 */
function checkEnvironmentFile(): void {
  const envFiles = [
    '.env',
    '.env.development',
    '.env.production',
  ]

  console.log('🔍 检查环境文件...')

  envFiles.forEach((file) => {
    const fullPath = resolve(process.cwd(), file)
    if (existsSync(fullPath)) {
      console.log(`✅ ${file} 存在`)
    } else {
      console.log(`❌ ${file} 不存在`)
    }
  })
}

/**
 * 主函数
 */
function main(): void {
  const command = process.argv[2]

  switch (command) {
    case 'init':
      initializeEnvironment()
      break
    case 'validate':
      validateConfiguration()
      break
    case 'show':
      showConfiguration()
      break
    case 'check':
      checkEnvironmentFile()
      break
    default:
      console.log(`
配置管理工具

用法:
  pnpm config <command>

命令:
  init     - 初始化环境配置（创建目录）
  validate - 验证配置
  show     - 显示当前配置
  check    - 检查环境文件

示例:
  pnpm config init
  pnpm config validate
  pnpm config show
  pnpm config check
      `)
  }
}

main()
