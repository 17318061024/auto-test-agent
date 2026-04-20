/**
 * 环境自检模块
 *
 * 检查：
 * - Node.js 版本
 * - Chrome 安装路径
 * - 端口 9222 占用情况
 * - 剩余内存及磁盘空间
 *
 * 自动修复：
 * - 安装 Playwright 浏览器
 */

import { spawn } from 'child_process'
import { exec } from 'child_process'
import { promisify } from 'util'
import { platform } from 'os'

const execAsync = promisify(exec)

export interface EnvironmentCheckResult {
  name: string
  status: 'pass' | 'warn' | 'fail'
  message: string
  canFix: boolean
}

export interface SystemInfo {
  nodeVersion: string
  platform: string
  arch: string
  totalMemory: number
  freeMemory: number
  chromePath?: string
  port9222Occupied: boolean
}

export class EnvironmentMonitor {
  private results: EnvironmentCheckResult[] = []

  /**
   * 运行所有环境检查
   */
  async runAllChecks(): Promise<EnvironmentCheckResult[]> {
    this.results = []

    console.log('🔍 开始环境检查...\n')

    // 1. 检查 Node.js 版本
    await this.checkNodeVersion()

    // 2. 检查操作系统
    await this.checkPlatform()

    // 3. 检查 Chrome 安装
    await this.checkChrome()

    // 4. 检查端口 9222 占用
    await this.checkPort9222()

    // 5. 检查内存
    await this.checkMemory()

    // 6. 检查磁盘空间
    await this.checkDiskSpace()

    // 7. 检查 Playwright 浏览器
    await this.checkPlaywright()

    this.printSummary()

    return this.results
  }

  /**
   * 检查 Node.js 版本
   */
  private async checkNodeVersion(): Promise<void> {
    const version = process.version
    const majorVersion = parseInt(version.slice(1).split('.')[0])

    // Node.js >= 18
    if (majorVersion >= 18) {
      this.results.push({
        name: 'Node.js 版本',
        status: 'pass',
        message: `Node.js 版本: ${version} (满足 >= 18 要求)`,
        canFix: false,
      })
    } else {
      this.results.push({
        name: 'Node.js 版本',
        status: 'fail',
        message: `Node.js 版本: ${version} (要求 >= 18)`,
        canFix: false,
      })
    }
  }

  /**
   * 检查操作系统
   */
  private async checkPlatform(): Promise<void> {
    const osPlatform = platform()
    const arch = process.arch

    if (osPlatform === 'win32') {
      this.results.push({
        name: '操作系统',
        status: 'pass',
        message: `平台: Windows (${arch})`,
        canFix: false,
      })
    } else {
      this.results.push({
        name: '操作系统',
        status: 'warn',
        message: `平台: ${osPlatform} (${arch}) (当前仅支持 Windows)`,
        canFix: false,
      })
    }
  }

  /**
   * 检查 Chrome 安装
   */
  private async checkChrome(): Promise<void> {
    try {
      let chromePath: string | undefined

      if (platform() === 'win32') {
        // Windows Chrome 路径
        const possiblePaths = [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
        ]

        for (const path of possiblePaths) {
          try {
            await execAsync(`test -f "${path}"`).catch(() => {
              throw new Error('File not found')
            })
            chromePath = path
            break
          } catch {
            continue
          }
        }

        if (chromePath) {
          this.results.push({
            name: 'Chrome 安装',
            status: 'pass',
            message: `Chrome 路径: ${chromePath}`,
            canFix: false,
          })
        } else {
          this.results.push({
            name: 'Chrome 安装',
            status: 'warn',
            message: '未找到 Chrome 浏览器',
            canFix: false,
          })
        }
      } else {
        this.results.push({
          name: 'Chrome 安装',
          status: 'warn',
          message: '跳过检查（非 Windows 平台）',
          canFix: false,
        })
      }
    } catch (error) {
      this.results.push({
        name: 'Chrome 安装',
        status: 'fail',
        message: `检查失败: ${error}`,
        canFix: false,
      })
    }
  }

  /**
   * 检查端口 9222 占用
   */
  private async checkPort9222(): Promise<void> {
    try {
      if (platform() === 'win32') {
        // Windows 检查端口
        const { stdout } = await execAsync('netstat -ano | findstr :9222')
        const occupied = stdout.trim().length > 0

        if (occupied) {
          this.results.push({
            name: '端口 9222',
            status: 'warn',
            message: '端口 9222 已被占用',
            canFix: false,
          })
        } else {
          this.results.push({
            name: '端口 9222',
            status: 'pass',
            message: '端口 9222 可用',
            canFix: false,
          })
        }
      }
    } catch (error) {
      // 端口未被占用
      this.results.push({
        name: '端口 9222',
        status: 'pass',
        message: '端口 9222 可用',
        canFix: false,
      })
    }
  }

  /**
   * 检查内存
   */
  private async checkMemory(): Promise<void> {
    const totalMemory = Math.round((process.memoryUsage().heapTotal / 1024 / 1024 / 1024) * 100) / 100
    const freeMemoryPercent = Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)

    if (freeMemoryPercent < 80) {
      this.results.push({
        name: '内存',
        status: 'pass',
        message: `可用内存充足 (已使用 ${freeMemoryPercent}%)`,
        canFix: false,
      })
    } else {
      this.results.push({
        name: '内存',
        status: 'warn',
        message: `内存使用率较高 (${freeMemoryPercent}%)`,
        canFix: false,
      })
    }
  }

  /**
   * 检查磁盘空间
   */
  private async checkDiskSpace(): Promise<void> {
    try {
      if (platform() === 'win32') {
        const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption')
        const lines = stdout.split('\n').slice(1)

        let systemDriveSpace = 0
        for (const line of lines) {
          const parts = line.trim().split(/\s+/)
          if (parts.length >= 3 && parts[0].includes('C:')) {
            const freeSpace = parseInt(parts[1]) / 1024 / 1024 / 1024 // GB
            systemDriveSpace = freeSpace
            break
          }
        }

        if (systemDriveSpace > 5) {
          this.results.push({
            name: '磁盘空间',
            status: 'pass',
            message: `C 盘可用空间: ${systemDriveSpace.toFixed(2)} GB`,
            canFix: false,
          })
        } else {
          this.results.push({
            name: '磁盘空间',
            status: 'warn',
            message: `C 盘可用空间不足: ${systemDriveSpace.toFixed(2)} GB (建议 >= 5 GB)`,
            canFix: false,
          })
        }
      }
    } catch (error) {
      this.results.push({
        name: '磁盘空间',
        status: 'fail',
        message: `检查失败: ${error}`,
        canFix: false,
      })
    }
  }

  /**
   * 检查 Playwright 浏览器
   */
  private async checkPlaywright(): Promise<void> {
    try {
      // 检查 node_modules/@playwright/test 是否存在
      const { stdout } = await execAsync('test -d node_modules/@playwright/test && echo "exists" || echo "not found"')
      const playwrightExists = stdout.trim() === 'exists'

      if (playwrightExists) {
        this.results.push({
          name: 'Playwright',
          status: 'pass',
          message: 'Playwright 已安装',
          canFix: false,
        })
      } else {
        this.results.push({
          name: 'Playwright',
          status: 'fail',
          message: 'Playwright 未安装',
          canFix: true,
        })
      }
    } catch (error) {
      this.results.push({
        name: 'Playwright',
        status: 'fail',
        message: 'Playwright 未安装',
        canFix: true,
      })
    }
  }

  /**
   * 自动修复问题
   */
  async autoFix(): Promise<void> {
    console.log('\n🔧 开始自动修复...\n')

    for (const result of this.results) {
      if (result.canFix && result.status === 'fail') {
        console.log(`修复: ${result.name}`)

        if (result.name === 'Playwright') {
          await this.installPlaywright()
        }
      }
    }

    console.log('\n✅ 自动修复完成！\n')
  }

  /**
   * 安装 Playwright 浏览器
   */
  private async installPlaywright(): Promise<void> {
    console.log('正在安装 Playwright 浏览器...')

    return new Promise((resolve, reject) => {
      const child = spawn('npx', ['playwright', 'install', 'chromium'], {
        stdio: 'inherit',
        shell: true,
      })

      child.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Playwright 浏览器安装成功')
          resolve()
        } else {
          console.log('❌ Playwright 浏览器安装失败')
          reject(new Error('安装失败'))
        }
      })
    })
  }

  /**
   * 打印检查摘要
   */
  private printSummary(): void {
    const pass = this.results.filter((r) => r.status === 'pass').length
    const warn = this.results.filter((r) => r.status === 'warn').length
    const fail = this.results.filter((r) => r.status === 'fail').length

    console.log('\n📊 环境检查摘要:')
    console.log(`   ✅ 通过: ${pass}`)
    console.log(`   ⚠️  警告: ${warn}`)
    console.log(`   ❌ 失败: ${fail}`)

    if (fail > 0) {
      const canFix = this.results.filter((r) => r.canFix && r.status === 'fail')
      if (canFix.length > 0) {
        console.log(`\n💡 提示: 可以自动修复 ${canFix.length} 个问题`)
        console.log('   运行: npx auto-test-agent setup --fix')
      }
    }

    console.log('')
  }

  /**
   * 获取系统信息
   */
  getSystemInfo(): SystemInfo {
    return {
      nodeVersion: process.version,
      platform: platform(),
      arch: process.arch,
      totalMemory: process.memoryUsage().heapTotal,
      freeMemory: process.memoryUsage().heapUsed,
      port9222Occupied: false, // TODO: 实现
    }
  }
}
