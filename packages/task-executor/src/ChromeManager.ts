/**
 * @auto-test-agent/task-executor
 *
 * Chrome管理器
 * 负责检测和管理Chrome浏览器
 *
 * 主要功能：
 * - 检测用户系统Chrome
 * - 验证Chrome可控制性
 * - 使用内置打包Chromium
 * - 智能选择最优浏览器
 *
 * 说明：Chromium需提前下载并集成到项目中，运行时不再下载
 */

import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'

const execAsync = promisify(exec)

/**
 * Chromium版本信息
 */
const CHROMIUM_VERSION = '142.0.7444.162'

/**
 * 内置Chromium相对路径（相对于项目根目录）
 */
const BUNDLED_CHROMIUM_RELATIVE_PATH = './chromium'

/**
 * 支持的Chromium平台目录名称
 */
const CHROMIUM_PLATFORM_DIRS = {
  win32: 'chrome-win32',
  darwin: 'chrome-mac',
  linux: 'chrome-linux',
}

/**
 * Chrome信息接口
 */
export interface ChromeInfo {
  /** 是否已安装 */
  installed: boolean
  /** Chrome可执行文件路径 */
  executablePath?: string
  /** Chrome版本 */
  version?: string
  /** 类型（系统Chrome/打包Chromium/Playwright） */
  type?: 'system' | 'bundled' | 'playwright'
  /** 平台 */
  platform?: string
  /** 架构 */
  arch?: string
}

/**
 * Chrome管理器类
 */
export class ChromeManager {
  private platform: string
  private arch: string

  constructor() {
    this.platform = os.platform()
    this.arch = os.arch()
  }

  /**
   * 获取最优的Chrome浏览器
   * @returns Chrome信息
   */
  async getOptimalChrome(): Promise<ChromeInfo> {
    console.log('🔍 开始查找最优Chrome浏览器...')

    // 1. 优先尝试使用用户Chrome
    const userChrome = await this.detectUserChrome()
    if (userChrome.installed && userChrome.executablePath) {
      const isValid = await this.validateChromeControl(userChrome.executablePath)
      if (isValid) {
        console.log(`✅ 将使用用户Chrome: ${userChrome.version}`)
        return userChrome
      }
    }

    // 2. 尝试使用内置打包的Chromium
    const bundledChrome = await this.detectBundledChrome()
    if (bundledChrome.installed && bundledChrome.executablePath) {
      const isValid = await this.validateChromeControl(bundledChrome.executablePath)
      if (isValid) {
        console.log(`✅ 将使用内置打包Chromium: ${bundledChrome.version}`)
        return bundledChrome
      }
    }

    // 3. 尝试使用Playwright Chromium
    const playwrightChrome = await this.detectPlaywrightChrome()
    if (playwrightChrome.installed && playwrightChrome.executablePath) {
      const isValid = await this.validateChromeControl(playwrightChrome.executablePath)
      if (isValid) {
        console.log(`✅ 将使用Playwright Chromium: ${playwrightChrome.version}`)
        return playwrightChrome
      }
    }

    // 如果都不可用，抛出错误
    throw new Error('无法找到可用的Chrome浏览器。请确保已安装Chrome或将Chromium集成到项目中')
  }

  /**
   * 检测用户系统Chrome
   * @returns Chrome信息
   */
  private async detectUserChrome(): Promise<ChromeInfo> {
    console.log('🔍 检测用户系统Chrome...')

    const chromePaths = this.getSystemChromePaths()

    for (const chromePath of chromePaths) {
      if (fs.existsSync(chromePath)) {
        try {
          const version = await this.getChromeVersion(chromePath)
          console.log(`✅ 找到系统Chrome: ${version}`)

          return {
            installed: true,
            executablePath: chromePath,
            version,
            type: 'system',
            platform: this.platform,
            arch: this.arch,
          }
        } catch (error) {
          console.warn(`⚠️ 系统Chrome不可用: ${error}`)
          continue
        }
      }
    }

    return { installed: false }
  }

  /**
   * 验证Chrome是否可以被Playwright控制
   * @param executablePath Chrome路径
   * @returns 是否可用
   */
  private async validateChromeControl(executablePath: string): Promise<boolean> {
    try {
      console.log(`🔍 验证Chrome可控制性: ${executablePath}`)

      // 尝试使用Playwright连接Chrome
      const { chromium } = await import('playwright')

      const browser = await chromium.launch({
        executablePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })

      // 测试基本功能
      const page = await browser.newPage()
      await page.goto('about:blank')
      await page.close()

      await browser.close()

      console.log('✅ Chrome可控制性验证通过')
      return true

    } catch (error) {
      console.warn(`⚠️ Chrome可控制性验证失败: ${error}`)
      return false
    }
  }

  /**
   * 检测内置打包的Chromium
   * @returns Chrome信息
   */
  private async detectBundledChrome(): Promise<ChromeInfo> {
    console.log('🔍 检测内置打包的Chromium...')

    const platformDir = CHROMIUM_PLATFORM_DIRS[this.platform as keyof typeof CHROMIUM_PLATFORM_DIRS]
    if (!platformDir) {
      return { installed: false }
    }

    // 检查多个可能的位置
    const possiblePaths = [
      // 开发环境路径
      path.join(process.cwd(), BUNDLED_CHROMIUM_RELATIVE_PATH, platformDir),
      // 生产环境路径（相对于可执行文件）
      path.join(process.resourcesPath || '', BUNDLED_CHROMIUM_RELATIVE_PATH, platformDir),
      // 备用路径
      path.join(__dirname, '..', '..', '..', BUNDLED_CHROMIUM_RELATIVE_PATH, platformDir),
    ]

    for (const basePath of possiblePaths) {
      let chromePath = path.join(basePath, 'chrome')
      if (this.platform === 'win32') {
        chromePath += '.exe'
      }

      if (fs.existsSync(chromePath)) {
        console.log(`✅ 找到内置Chromium: ${chromePath}`)
        return {
          installed: true,
          executablePath: chromePath,
          version: CHROMIUM_VERSION,
          type: 'bundled',
          platform: this.platform,
          arch: this.arch,
        }
      }
    }

    console.warn('⚠️ 未找到内置打包的Chromium')
    return { installed: false }
  }

  /**
   * 检测Playwright Chromium
   * @returns Chrome信息
   */
  private async detectPlaywrightChrome(): Promise<ChromeInfo> {
    try {
      const { chromium } = await import('playwright')
      const chromiumPath = chromium.executablePath()

      if (fs.existsSync(chromiumPath)) {
        return {
          installed: true,
          executablePath: chromiumPath,
          version: 'Playwright Chromium',
          type: 'playwright',
          platform: this.platform,
          arch: this.arch,
        }
      }
    } catch (error) {
      console.warn('⚠️ Playwright未安装:', error)
    }

    return { installed: false }
  }

  /**
   * 获取系统Chrome可能的路径
   * @returns Chrome路径列表
   */
  private getSystemChromePaths(): string[] {
    const paths: string[] = []

    switch (this.platform) {
      case 'win32':
        paths.push(
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
          path.join(process.env.PROGRAMFILES || '', 'Google\\Chrome\\Application\\chrome.exe'),
          path.join(process.env.PROGRAMFILES || '', 'Google\\Chrome\\Application\\chrome.exe'),
        )
        break

      case 'darwin':
        paths.push(
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          path.join(process.env.HOME || '', '.local/share/chromium'),
        )
        break

      case 'linux':
        paths.push(
          '/usr/bin/google-chrome',
          '/usr/bin/chrome',
          '/usr/bin/chromium',
          '/snap/bin/chromium',
          path.join(process.env.HOME || '', '.local/share/chromium'),
        )
        break
    }

    return paths
  }

  /**
   * 获取Chrome版本
   * @param executablePath Chrome路径
   * @returns 版本字符串
   */
  private async getChromeVersion(executablePath: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`"${executablePath}" --version`)
      const version = stdout.trim()
      console.log(`📌 Chrome版本: ${version}`)
      return version
    } catch (error) {
      throw new Error(`无法获取Chrome版本: ${error}`)
    }
  }
}

/**
 * 导出便捷函数
 */

/**
 * 获取最优Chrome浏览器
 * @returns Chrome信息
 */
export async function getOptimalChrome(): Promise<ChromeInfo> {
  const manager = new ChromeManager()
  return await manager.getOptimalChrome()
}

/**
 * 创建全局Chrome管理器实例
 */
export const chromeManager = new ChromeManager()
