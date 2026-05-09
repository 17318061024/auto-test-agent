<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">🤖 auto-test-agent</h1>
            <p class="text-sm text-gray-600">桌面客户端 v0.2.0</p>
          </div>
          <div class="flex items-center gap-4">
            <!-- 连接状态 -->
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'w-3 h-3 rounded-full',
                  {
                    'bg-green-500': connectionState === 'connected',
                    'bg-yellow-500': connectionState === 'connecting' || connectionState === 'reconnecting',
                    'bg-red-500': connectionState === 'failed' || connectionState === 'disconnected',
                  }
                ]"
              ></div>
              <span class="text-sm text-gray-600">
                {{ connectionText }}
              </span>
            </div>

            <!-- 客户端信息 -->
            <div class="text-sm text-gray-600">
              {{ clientInfo.name }} ({{ clientInfo.platform }})
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="container mx-auto px-4 py-8">
      <!-- 任务执行面板 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：任务执行区域 -->
        <div class="lg:col-span-2">
          <TaskExecutionPanel />
        </div>

        <!-- 右侧：系统状态和信息 -->
        <div class="lg:col-span-1">
          <!-- 系统状态卡片 -->
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">💻 系统状态</h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">平台</span>
                <span class="font-medium">{{ systemInfo.platform }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">架构</span>
                <span class="font-medium">{{ systemInfo.arch }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Node.js</span>
                <span class="font-medium">{{ systemInfo.nodeVersion }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Electron</span>
                <span class="font-medium">{{ systemInfo.electronVersion }}</span>
              </div>
            </div>
          </div>

          <!-- 配置信息卡片 -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">⚙️ 配置信息</h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">服务器</span>
                <span class="font-medium text-sm">{{ config.server.host }}:{{ config.server.port }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">WebSocket</span>
                <span class="font-medium text-sm">:{{ config.server.wsPort }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">最大重试</span>
                <span class="font-medium">{{ config.taskExecutor.maxRetries }} 次</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">步骤超时</span>
                <span class="font-medium">{{ config.taskExecutor.stepTimeout }}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能特性展示 -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-3xl mb-2">🔄</div>
          <h3 class="font-semibold mb-2">智能重试</h3>
          <p class="text-sm text-gray-600">
            失败自动重试，使用补偿策略提高成功率
          </p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-3xl mb-2">⚡</div>
          <h3 class="font-semibold mb-2">性能监控</h3>
          <p class="text-sm text-gray-600">
            详细记录每个环节的耗时，识别性能瓶颈
          </p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-3xl mb-2">🔍</div>
          <h3 class="font-semibold mb-2">错误诊断</h3>
          <p class="text-sm text-gray-600">
            智能分析错误原因，提供解决方案建议
          </p>
        </div>
      </div>
    </main>

    <!-- 底部状态栏 -->
    <footer class="bg-white border-t border-gray-200 mt-8">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between text-sm text-gray-600">
          <div>
            内存使用: {{ memoryUsage }} | CPU: {{ cpuUsage }}
          </div>
          <div>
            运行时间: {{ uptime }}
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTaskExecution } from '../composables/useTaskExecution'
import { config as sharedConfig } from '@auto-test-agent/shared'
import TaskExecutionPanel from './components/TaskExecutionPanel.vue'

// 使用任务执行 composable
const { connectionState, currentTask } = useTaskExecution()

// 客户端信息
const clientInfo = ref({
  name: 'auto-test-agent',
  platform: process.platform,
})

// 系统信息
const systemInfo = ref({
  platform: process.platform,
  arch: process.arch,
  nodeVersion: process.version,
  electronVersion: process.versions.electron,
})

// 配置信息
const config = ref(sharedConfig.getConfig())

// 性能监控
const memoryUsage = ref('0 MB')
const cpuUsage = ref('0%')
const uptime = ref('0:00:00')

let performanceTimer: NodeJS.Timeout | null = null

// 更新性能数据
const updatePerformance = () => {
  const usage = process.memoryUsage()
  memoryUsage.value = `${Math.round(usage.heapUsed / 1024 / 1024)} MB`

  const cpus = require('os').cpus()
  const avgLoad = require('os').loadavg()[0]
  cpuUsage.value = `${avgLoad.toFixed(2)} (${cpus.length} 核心)`

  const uptimeSeconds = Math.floor(process.uptime())
  const hours = Math.floor(uptimeSeconds / 3600)
  const minutes = Math.floor((uptimeSeconds % 3600) / 60)
  const seconds = uptimeSeconds % 60
  uptime.value = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// 连接状态文本
const connectionText = computed(() => {
  const stateTexts = {
    disconnected: '未连接',
    connecting: '连接中...',
    connected: '已连接',
    reconnecting: '重连中...',
    failed: '连接失败',
  }
  return stateTexts[connectionState.value] || '未知状态'
})

// 组件挂载
onMounted(() => {
  console.log('🚀 桌面客户端启动')

  // 启动性能监控
  updatePerformance()
  performanceTimer = setInterval(updatePerformance, 5000)

  // 监听来自主进程的消息
  window.addEventListener('message', handleMainProcessMessage)
})

// 组件卸载
onUnmounted(() => {
  if (performanceTimer) {
    clearInterval(performanceTimer)
  }
  window.removeEventListener('message', handleMainProcessMessage)
})

// 处理主进程消息
const handleMainProcessMessage = (event: MessageEvent) => {
  const { type, data } = event.data

  switch (type) {
    case 'task:start':
      console.log('📋 收到任务启动消息:', data)
      break
    case 'task:status':
      console.log('📊 收到任务状态更新:', data)
      break
    case 'health:check':
      console.log('🏥 收到健康检查结果:', data)
      break
    default:
      console.log('📩 收到未知消息类型:', type)
  }
}
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 文本选择颜色 */
::selection {
  background: #3b82f6;
  color: white;
}
</style>
