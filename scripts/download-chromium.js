#!/usr/bin/env node

/**
 * Chromium下载脚本
 * 用于提前下载Chromium并集成到项目中
 *
 * 使用方法：
 * node scripts/download-chromium.js
 * 或
 * pnpm download:chromium
 */

const https = require('https')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const decompress = require('decompress')

/**
 * Chromium版本信息
 */
const CHROMIUM_VERSION = '142.0.7444.162'

/**
 * 下载URL配置
 */
const DOWNLOAD_URLS = {
  win32: `https://playwright.azureedge.net/chromium-for-testing/${CHROMIUM_VERSION}/win64/chromium-win32.zip`,
  darwin: `https://playwright.azureedge.net/chromium-for-testing/${CHROMIUM_VERSION}/mac-arm64/chromium-mac-arm64.zip`,
  linux: `https://playwright.azureedge.net/chromium-for-testing/${CHROMIUM_VERSION}/ubuntu22.04/chromium-linux.zip`,
}

/**
 * 目标目录配置
 */
const TARGET_DIR = path.join(__dirname, '..', 'packages', 'desktop-client', 'chromium')

/**
 * 获取当前平台
 */
function getPlatform() {
  return process.platform
}

/**
 * 下载文件
 */
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`📥 开始下载: ${url}`)
    console.log(`📁 保存到: ${destination}`)

    const file = fs.createWriteStream(destination)

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败: ${response.statusCode}`))
        response.resume()
        return
      }

      const totalSize = parseInt(response.headers['content-length'] || '0', 10)
      let downloadedSize = 0

      response.pipe(file)

      file.on('finish', () => {
        file.close()
        console.log('✅ 文件下载完成')
        resolve()
      })

      file.on('error', (error) => {
        fs.unlink(destination, () => {}) // 删除不完整的文件
        reject(error)
      })

      response.on('data', (chunk) => {
        downloadedSize += chunk.length
        if (totalSize > 0) {
          const progress = ((downloadedSize / totalSize) * 100).toFixed(1)
          process.stdout.write(`\r📊 下载进度: ${progress}%`)
        }
      })
    }).on('error', (error) => {
      fs.unlink(destination, () => {}) // 删除不完整的文件
      reject(error)
    })
  })
}

/**
 * 主函数
 */
async function main() {
  try {
    const platform = getPlatform()
    const downloadUrl = DOWNLOAD_URLS[platform]

    if (!downloadUrl) {
      throw new Error(`不支持的操作系统: ${platform}`)
    }

    console.log('🚀 开始下载Chromium...')
    console.log(`📦 版本: ${CHROMIUM_VERSION}`)
    console.log(`💻 平台: ${platform}`)

    // 创建目标目录
    fs.mkdirSync(TARGET_DIR, { recursive: true })

    // 下载文件
    const zipPath = path.join(TARGET_DIR, 'chromium.zip')
    await downloadFile(downloadUrl, zipPath)

    console.log('\n📦 开始解压...')

    // 解压文件
    await decompress(zipPath, TARGET_DIR)

    // 删除压缩包
    fs.unlinkSync(zipPath)

    console.log('✅ Chromium下载和解压完成!')
    console.log(`📁 安装位置: ${TARGET_DIR}`)

    // 验证安装
    const platformDirs = {
      win32: 'chrome-win32',
      darwin: 'chrome-mac',
      linux: 'chrome-linux',
    }

    const chromiumPath = path.join(TARGET_DIR, platformDirs[platform])
    if (fs.existsSync(chromiumPath)) {
      console.log('✅ Chromium验证成功!')
    } else {
      throw new Error('Chromium解压后未找到预期文件')
    }

  } catch (error) {
    console.error('❌ 下载失败:', error.message)
    process.exit(1)
  }
}

// 运行主函数
main()
