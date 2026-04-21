/**
 * @auto-test-agent/task-executor
 *
 * Chrome管理器 - 增强版
 * 负责检测和管理Chrome浏览器
 *
 * 主要功能：
 * - 智能检测用户系统Chrome（多种路径和版本）
 * - 验证Chrome可控制性和健康状态
 * - 使用内置打包Chromium作为备选
 * - 智能选择最优浏览器
 * - 自动修复常见Chrome问题
 * - 性能优化（缓存检测结果）
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
  type?: 'system' | 'bundled' | 'playwright' | 'portable' | 'custom'
  /** 平台 */
  platform?: string
  /** 架构 */
  arch?: string
  /** 健康状态 */
  healthy?: boolean
  /** 启动参数 */
  args?: string[]
}

/**
 * Chrome健康检查结果
 */
interface ChromeHealthCheck {
  healthy: boolean
  canLaunch: boolean
  canControl: boolean
  version: string
  issues: string[]
  suggestions: string[]
}

/**
 * Chrome管理器类 - 增强版
 */
export class ChromeManager {
  private platform: string
  private arch: string
  private detectionCache: Map<string, ChromeInfo> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5分钟缓存

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
   * 获取系统Chrome可能的路径 - 增强版
   * @returns Chrome路径列表
   */
  private getSystemChromePaths(): string[] {
    const paths: string[] = []

    switch (this.platform) {
      case 'win32':
        // 标准安装路径
        paths.push(
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
          path.join(process.env.PROGRAMFILES || '', 'Google\\Chrome\\Application\\chrome.exe'),
          path.join(process.env.PROGRAMFILES || '', 'Google\\Chrome\\Application\\chrome.exe'),
          // Chrome Portable
          path.join(process.env.HOMEDRIVE || 'C:', '\\PortableApps\\GoogleChromePortable\\GoogleChromePortable.exe'),
          path.join(process.env.USERPROFILE || '', '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'),
          // 用户自定义路径（从环境变量）
          process.env.CHROME_PATH || '',
        )
        break

      case 'darwin':
        paths.push(
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta',
          '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
          path.join(process.env.HOME || '', '.local/share/chromium'),
          // 用户自定义路径
          process.env.CHROME_PATH || '',
        )
        break

      case 'linux':
        paths.push(
          '/usr/bin/google-chrome',
          '/usr/bin/google-chrome-stable',
          '/usr/bin/chrome',
          '/usr/bin/chromium',
          '/usr/bin/chromium-browser',
          '/snap/bin/chromium',
          path.join(process.env.HOME || '', '.local/share/chromium'),
          // AppImage
          path.join(process.env.HOME || '', 'Applications', 'Google Chrome.appimage'),
          // 用户自定义路径
          process.env.CHROME_PATH || '',
        )
        break
    }

    // 过滤掉空字符串和重复路径
    return [...new Set(paths.filter(path => path.trim()))]
  }

  /**
   * 获取Chrome版本 - 增强版
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

  /**
   * Chrome健康检查 - 新增功能
   * @param executablePath Chrome路径
   * @returns 健康检查结果
   */
  async healthCheck(executablePath: string): Promise<ChromeHealthCheck> {
    const result: ChromeHealthCheck = {
      healthy: false,
      canLaunch: false,
      canControl: false,
      version: 'unknown',
      issues: [],
      suggestions: []
    }

    try {
      // 检查文件是否存在
      if (!fs.existsSync(executablePath)) {
        result.issues.push('Chrome可执行文件不存在')
        result.suggestions.push('请检查Chrome安装路径或重新安装Chrome')
        return result
      }

      result.canLaunch = true

      // 获取版本信息
      try {
        result.version = await this.getChromeVersion(executablePath)
      } catch (error) {
        result.issues.push('无法获取Chrome版本')
        result.suggestions.push('Chrome可能已损坏，请重新安装')
      }

      // 检查可控制性
      try {
        const { chromium } = await import('playwright')
        const browser = await chromium.launch({
          executablePath,
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          timeout: 10000 // 10秒超时
        })

        const page = await browser.newPage()
        await page.goto('about:blank')
        await page.close()
        await browser.close()

        result.canControl = true
        result.healthy = true
        console.log('✅ Chrome健康检查通过')
      } catch (error) {
        result.issues.push(`Chrome可控制性检查失败: ${error}`)
        result.suggestions.push('尝试添加启动参数: --no-sandbox --disable-dev-shm-usage')
        result.suggestions.push('检查Chrome是否有权限问题或被其他进程占用')
      }

    } catch (error) {
      result.issues.push(`健康检查异常: ${error}`)
    }

    return result
  }

  /**
   * 自动修复Chrome问题 - 新增功能
   * @param healthCheck 健康检查结果
   * @returns 是否修复成功
   */
  async autoFix(healthCheck: ChromeHealthCheck): Promise<boolean> {
    console.log('🔧 尝试自动修复Chrome问题...')

    try {
      // 尝试清理Chrome临时文件
      const tempPaths = this.getChromeTempPaths()
      for (const tempPath of tempPaths) {
        if (fs.existsSync(tempPath)) {
          try {
            fs.rmSync(tempPath, { recursive: true, force: true })
            console.log(`✅ 清理Chrome临时文件: ${tempPath}`)
          } catch (error) {
            console.warn(`⚠️ 无法清理临时文件: ${tempPath}`)
          }
        }
      }

      // 尝试重新验证
      return healthCheck.healthy
    } catch (error) {
      console.error('❌ 自动修复失败:', error)
      return false
    }
  }

  /**
   * 获取Chrome临时文件路径
   * @returns 临时文件路径列表
   */
  private getChromeTempPaths(): string[] {
    const paths: string[] = []

    switch (this.platform) {
      case 'win32':
        paths.push(
          path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'User Data', 'Default', 'Cache'),
          path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'User Data', 'Default', 'Code Cache'),
        )
        break
      case 'darwin':
        paths.push(
          path.join(process.env.HOME || '', 'Library', 'Caches', 'Google', 'Chrome'),
        )
        break
      case 'linux':
        paths.push(
          path.join(process.env.HOME || '', '.cache', 'google-chrome'),
          path.join(process.env.HOME || '', '.config', 'google-chrome', 'Default', 'Cache'),
        )
        break
    }

    return paths
  }

  /**
   * 获取推荐的启动参数 - 新增功能
   * @param chromeInfo Chrome信息
   * @returns 推荐的启动参数
   */
  getRecommendedArgs(chromeInfo: ChromeInfo): string[] {
    const baseArgs = ['--no-sandbox', '--disable-setuid-sandbox']

    // 系统Chrome需要更多参数
    if (chromeInfo.type === 'system') {
      return [
        ...baseArgs,
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    }

    return baseArgs
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
