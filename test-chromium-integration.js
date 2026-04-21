#!/usr/bin/env node

/**
 * Chromium集成测试脚本
 * 用于验证ChromeManager是否能正确检测内置Chromium
 */

const path = require('path')
const fs = require('fs')

console.log('🧪 Chromium集成测试\n')

// 检查Chromium目录是否存在
const chromiumBaseDir = path.join(__dirname, 'packages', 'desktop-client', 'chromium')
const platform = process.platform
const platformDirs = {
  win32: 'chrome-win32',
  darwin: 'chrome-mac',
  linux: 'chrome-linux',
}

const platformDir = platformDirs[platform]
const chromiumPath = path.join(chromiumBaseDir, platformDir)

console.log(`📁 平台: ${platform}`)
console.log(`📁 Chromium目录: ${chromiumPath}`)
console.log(`📁 平台目录: ${platformDir}\n`)

// 检查目录是否存在
if (fs.existsSync(chromiumPath)) {
  console.log('✅ Chromium目录存在')

  // 检查可执行文件
  let exeName = 'chrome'
  if (platform === 'win32') {
    exeName = 'chrome.exe'
  }

  const chromeExe = path.join(chromiumPath, exeName)
  console.log(`📁 可执行文件: ${chromeExe}`)

  if (fs.existsSync(chromeExe)) {
    console.log('✅ Chrome可执行文件存在')
    console.log('✅ Chromium集成成功！\n')

    console.log('🎯 下一步:')
    console.log('1. 运行: pnpm build')
    console.log('2. 运行: pnpm dev')
    console.log('3. ChromeManager会自动检测并使用内置Chromium')

  } else {
    console.log('❌ Chrome可执行文件不存在')
    console.log('\n📋 需要完成以下步骤:')
    console.log('1. 下载Chromium:')
    console.log('   pnpm download:chromium')
    console.log('2. 或手动下载并解压到:', chromiumPath)
  }

} else {
  console.log('❌ Chromium目录不存在')
  console.log('\n📋 需要完成以下步骤:')
  console.log('1. 创建目录:', chromiumPath)
  console.log('2. 下载Chromium:')
  console.log('   pnpm download:chromium')
  console.log('3. 或访问 docs/MANUAL_CHROMIUM_SETUP.md 查看手动下载说明')
}

console.log('\n📚 详细文档:')
console.log('- docs/CHROMIUM_SETUP.md - 完整设置指南')
console.log('- docs/MANUAL_CHROMIUM_SETUP.md - 快速开始指南')
