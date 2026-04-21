/**
 * @auto-test-agent/task-executor
 *
 * 环境自检模块 (Environment Monitor)
 * 自动检查运行环境，确保系统能够正常执行自动化任务
 */

import os from 'os'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { ChromeInfo } from './ChromeManager.js'

const execAsync = promisify(exec)

/**
 * 环境检查结果接口
 */
export interface EnvironmentCheckResult {
  /** 检查项目名称 */
  name: string
  /** 是否通过检查 */
  passed: boolean
  /** 错误信息 */
  error?: string
  /** 警告信息 */
  warning?: string
  /** 修复建议 */
  suggestion?: string
}

/**
 * 系统信息接口
 */
export interface SystemInfo {
  /** Node.js 版本 */
  nodeVersion: string
  /** 操作系统类型 */
  platform: string
  /** CPU 架构 */
  arch: string
  /** 总内存（MB） */
  totalMemory: number
  /** 可用内存（MB） */
  freeMemory: number
  /** CPU 核心数 */
  cpuCount: number
  /** 用户目录 */
  homeDir: string
}

/**
 * 端口占用信息接口
 */
export interface PortInfo {
  /** 端口号 */
  port: number
  /** 是否被占用 */
  inUse: boolean
  /** 占用进程（如果被占用） */
  process?: string
}

/**
 * 环境自检类
 * 负责检查和验证运行环境是否满足要求
 */
export class EnvironmentMonitor {
  private results: EnvironmentCheckResult[] = []
  private systemInfo: SystemInfo
  private chromeInfo: ChromeInfo | null = null

  constructor() {
    this.systemInfo = this.getSystemInfo()
  }

  /**
   * 执行完整的环境检查
   * @returns 检查结果列表
   */
  async performFullCheck(): Promise<EnvironmentCheckResult[]> {
    this.results = []

    // 执行各项检查
    await this.checkNodeVersion()
    await this.checkSystemResources()
    await this.checkChromeInstallation()
    await this.checkPortAvailability(9222)
    await this.checkDirectoryStructure()

    return this.results
  }

  /**
   * 获取系统信息
   */
  getSystemInfo(): SystemInfo {
    return {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      totalMemory: Math.round(os.totalmem() / (1024 * 1024)),
      freeMemory: Math.round(os.freemem() / (1024 * 1024)),
      cpuCount: os.cpus().length,
      homeDir: os.homedir(),
    }
  }

  /**
   * 检查 Node.js 版本
   * 要求：Node.js >= 18.0.0
   */
  async checkNodeVersion(): Promise<void> {
    const minVersion = '18.0.0'
    const currentVersion = process.version.slice(1) // 移除 'v' 前缀

    const result: EnvironmentCheckResult = {
      name: 'Node.js 版本检查',
      passed: false,
    }

    try {
      const isVersionValid = this.compareVersions(currentVersion, minVersion) >= 0

      if (isVersionValid) {
        result.passed = true
      } else {
        result.passed = false
        result.error = `当前 Node.js 版本: ${currentVersion}, 要求: >= ${minVersion}`
        result.suggestion = '请升级 Node.js 版本到 18.0.0 或更高'
      }
    } catch (error) {
      result.passed = false
      result.error = `版本检查失败: ${error}`
    }

    this.results.push(result)
  }

  /**
   * 检查系统资源（内存和磁盘空间）
   * 要求：至少 512MB 可用内存，100MB 可用磁盘空间
   */
  async checkSystemResources(): Promise<void> {
    const minFreeMemory = 512 // MB
    const minFreeDiskSpace = 100 // MB

    const result: EnvironmentCheckResult = {
      name: '系统资源检查',
      passed: false,
    }

    try {
      const freeMemoryMB = this.systemInfo.freeMemory
      const freeDiskSpaceMB = await this.getFreeDiskSpace()

      const memoryOK = freeMemoryMB >= minFreeMemory
      const diskOK = freeDiskSpaceMB >= minFreeDiskSpace

      if (memoryOK && diskOK) {
        result.passed = true
      } else {
        result.passed = false
        const issues: string[] = []

        if (!memoryOK) {
          issues.push(`可用内存不足: ${freeMemoryMB}MB (要求: >= ${minFreeMemory}MB)`)
        }
        if (!diskOK) {
          issues.push(`可用磁盘空间不足: ${freeDiskSpaceMB}MB (要求: >= ${minFreeDiskSpace}MB)`)
        }

        result.error = issues.join('; ')
        result.suggestion = '请关闭不必要的应用程序或清理磁盘空间'
      }

      // 添加警告信息
      if (freeMemoryMB < 1024) {
        result.warning = `可用内存较少: ${freeMemoryMB}MB，建议至少保留 1GB`
      }
    } catch (error) {
      result.passed = false
      result.error = `系统资源检查失败: ${error}`
    }

    this.results.push(result)
  }

  /**
   * 检查 Chrome 安装情况
   * 使用 ChromeManager 检测和管理 Chrome 浏览器
   */
  async checkChromeInstallation(): Promise<void> {
    const result: EnvironmentCheckResult = {
      name: 'Chrome 安装检查',
      passed: false,
    }

    try {
      // 使用 ChromeManager 检测 Chrome
      const { ChromeManager } = await import('./ChromeManager.js')
      const chromeManager = new ChromeManager()

      this.chromeInfo = await chromeManager.getOptimalChrome()

      if (this.chromeInfo.installed) {
        result.passed = true
        const chromeType = this.chromeInfo.type === 'system' ? '用户系统' :
                          this.chromeInfo.type === 'bundled' ? '打包' : 'Playwright'
        result.warning = `使用 ${chromeType} Chrome: ${this.chromeInfo.version}`
        console.log(`✅ 将使用 ${chromeType} Chrome: ${this.chromeInfo.executablePath}`)
      } else {
        result.passed = false
        result.error = '未找到可用的Chrome浏览器'
        result.suggestion = 'ChromeManager 将自动下载并打包 Chromium 浏览器'
      }
    } catch (error) {
      result.passed = false
      result.error = `Chrome 检查失败: ${error}`
      result.suggestion = 'ChromeManager 将自动下载并打包 Chromium 浏览器'
    }

    this.results.push(result)
  }

  /**
   * 检查指定端口是否可用
   * @param port 要检查的端口号
   */
  async checkPortAvailability(port: number): Promise<void> {
    const result: EnvironmentCheckResult = {
      name: `端口 ${port} 检查`,
      passed: false,
    }

    try {
      const portInfo = await this.getPortInfo(port)

      if (!portInfo.inUse) {
        result.passed = true
      } else {
        result.passed = false
        result.error = `端口 ${port} 已被占用`
        result.suggestion = `请关闭占用端口的进程或使用其他端口。占用进程: ${portInfo.process || '未知'}`
      }
    } catch (error) {
      result.passed = false
      result.error = `端口检查失败: ${error}`
    }

    this.results.push(result)
  }

  /**
   * 检查必要的目录结构
   */
  async checkDirectoryStructure(): Promise<void> {
    const result: EnvironmentCheckResult = {
      name: '目录结构检查',
      passed: false,
    }

    try {
      const requiredDirs = ['./data', './logs', './temp']
      const missingDirs: string[] = []

      for (const dir of requiredDirs) {
        if (!fs.existsSync(dir)) {
          missingDirs.push(dir)
        }
      }

      if (missingDirs.length === 0) {
        result.passed = true
      } else {
        // 自动创建缺失的目录
        for (const dir of missingDirs) {
          fs.mkdirSync(dir, { recursive: true })
        }
        result.passed = true
        result.warning = `已自动创建缺失目录: ${missingDirs.join(', ')}`
      }
    } catch (error) {
      result.passed = false
      result.error = `目录结构检查失败: ${error}`
      result.suggestion = '请检查文件系统权限'
    }

    this.results.push(result)
  }

  /**
   * 获取端口占用信息
   */
  private async getPortInfo(port: number): Promise<PortInfo> {
    try {
      const net = require('net')
      const server = net.createServer()

      return new Promise((resolve) => {
        server.once('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            resolve({ port, inUse: true, process: '未知进程' })
          } else {
            resolve({ port, inUse: false })
          }
        })

        server.once('listening', () => {
          server.close()
          resolve({ port, inUse: false })
        })

        server.listen(port)
      })
    } catch {
      return { port, inUse: false }
    }
  }

  /**
   * 获取可用磁盘空间（MB）
   */
  private async getFreeDiskSpace(): Promise<number> {
    try {
      const stats = await fs.promises.statfs('.')
      return Math.round((stats.bavail * stats.bsize) / (1024 * 1024))
    } catch {
      return 0
    }
  }

  /**
   * 比较版本号
   * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if v1 === v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0
      const part2 = parts2[i] || 0

      if (part1 > part2) return 1
      if (part1 < part2) return -1
    }

    return 0
  }

  /**
   * 获取检查结果摘要
   */
  getSummary(): {
    total: number
    passed: number
    failed: number
    warnings: number
  } {
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const warnings = this.results.filter(r => r.warning).length

    return {
      total: this.results.length,
      passed,
      failed,
      warnings,
    }
  }

  /**
   * 打印环境检查报告
   */
  printReport(): void {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║              环境自检报告                                    ║
╚════════════════════════════════════════════════════════════╝

系统信息:
  Node.js:    ${this.systemInfo.nodeVersion}
  操作系统:   ${this.systemInfo.platform} ${this.systemInfo.arch}
  内存:       ${this.systemInfo.freeMemory}MB / ${this.systemInfo.totalMemory}MB
  CPU:        ${this.systemInfo.cpuCount} 核心

检查结果:
`)

    for (const result of this.results) {
      const icon = result.passed ? '✅' : '❌'
      console.log(`  ${icon} ${result.name}`)

      if (result.error) {
        console.log(`     错误: ${result.error}`)
      }
      if (result.warning) {
        console.log(`     警告: ${result.warning}`)
      }
      if (result.suggestion) {
        console.log(`     建议: ${result.suggestion}`)
      }
      console.log()
    }

    const summary = this.getSummary()
    console.log(`
摘要: ${summary.passed}/${summary.total} 项通过
      ${summary.failed} 项失败
      ${summary.warnings} 项警告
`)
  }

  /**
   * 获取 Chrome 信息
   */
  getChromeInfo(): ChromeInfo | null {
    return this.chromeInfo
  }
}

/**
 * 导出便捷函数
 */
export async function performEnvironmentCheck(): Promise<EnvironmentCheckResult[]> {
  const monitor = new EnvironmentMonitor()
  return await monitor.performFullCheck()
}

export async function printEnvironmentReport(): Promise<void> {
  const monitor = new EnvironmentMonitor()
  await monitor.performFullCheck()
  monitor.printReport()
}

// 重新导出 ChromeInfo 以保持向后兼容
export type { ChromeInfo } from './ChromeManager.js'
