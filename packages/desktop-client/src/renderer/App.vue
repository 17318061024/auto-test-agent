<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">auto-test-agent</h1>
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
              <span class="text-sm text-gray-600">{{ connectionText }}</span>
            </div>

            <!-- 当前任务状态 -->
            <div
              v-if="currentTask.id"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                {
                  'bg-green-100 text-green-800': currentTask.status === 'completed',
                  'bg-blue-100 text-blue-800 animate-pulse': currentTask.status === 'running',
                  'bg-red-100 text-red-800': currentTask.status === 'failed',
                  'bg-yellow-100 text-yellow-800': currentTask.status === 'pending' || currentTask.status === 'cancelled',
                }
              ]"
            >
              {{ currentTask.name }} - {{ taskStatusText }}
            </div>

            <!-- 客户端信息 -->
            <div class="text-sm text-gray-600">
              {{ clientInfo.platform }}
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
            <h2 class="text-lg font-semibold mb-4">系统状态</h2>
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
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">配置信息</h2>
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

          <!-- 任务快速信息 -->
          <div v-if="currentTask.id" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">当前任务</h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">任务名称</span>
                <span class="font-medium text-sm">{{ currentTask.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">进度</span>
                <span class="font-medium">{{ currentTask.progress }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">耗时</span>
                <span class="font-medium">{{ formattedDuration }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">步骤</span>
                <span class="font-medium">{{ currentTask.currentStep }} / {{ currentTask.totalSteps }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部状态栏 -->
    <footer class="bg-white border-t border-gray-200 mt-8">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between text-sm text-gray-600">
          <div>内存: {{ memoryUsage }}</div>
          <div>运行时间: {{ uptime }}</div>
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

const {
  connectionState,
  currentTask,
  formattedDuration,
  initTaskExecution,
  destroyTaskExecution,
} = useTaskExecution()

// 客户端信息
const clientInfo = ref({
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
const uptime = ref('0:00:00')

let performanceTimer: ReturnType<typeof setInterval> | null = null

const updatePerformance = () => {
  const usage = process.memoryUsage()
  memoryUsage.value = `${Math.round(usage.heapUsed / 1024 / 1024)} MB`

  const uptimeSeconds = Math.floor(process.uptime())
  const hours = Math.floor(uptimeSeconds / 3600)
  const minutes = Math.floor((uptimeSeconds % 3600) / 60)
  const seconds = uptimeSeconds % 60
  uptime.value = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// 连接状态文本
const connectionText = computed(() => {
  const map: Record<string, string> = {
    disconnected: '未连接',
    connecting: '连接中...',
    connected: '已连接',
    reconnecting: '重连中...',
    failed: '连接失败',
  }
  return map[connectionState.value] || '未知状态'
})

// 任务状态文本
const taskStatusText = computed(() => {
  const map: Record<string, string> = {
    pending: '等待中',
    running: '执行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  }
  return map[currentTask.status] || '未知状态'
})

onMounted(() => {
  initTaskExecution()
  updatePerformance()
  performanceTimer = setInterval(updatePerformance, 5000)
})

onUnmounted(() => {
  if (performanceTimer) clearInterval(performanceTimer)
  destroyTaskExecution()
})
</script>
