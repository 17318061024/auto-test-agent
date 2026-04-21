<template>
  <div class="task-execution-panel">
    <!-- 连接状态指示器 -->
    <div class="connection-indicator">
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
    </div>

    <!-- 任务信息 -->
    <div v-if="currentTask.id" class="task-info">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold">{{ currentTask.name }}</h3>
          <p class="text-sm text-gray-600">任务ID: {{ currentTask.id }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-600">耗时: {{ formattedDuration }}</p>
          <p class="text-sm text-gray-600">
            步骤: {{ currentTask.currentStep }}/{{ currentTask.totalSteps }}
          </p>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="mb-4">
        <div class="flex justify-between text-sm mb-1">
          <span>执行进度</span>
          <span>{{ currentTask.progress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            :class="['h-2 rounded-full transition-all duration-300', progressColor]"
            :style="{ width: `${currentTask.progress}%` }"
          ></div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="flex gap-2 mb-4">
        <button
          v-if="isExecuting"
          @click="cancelTask"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          🛑 取消任务
        </button>
        <button
          v-if="isCompleted"
          @click="resetTask"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          🔄 新任务
        </button>
        <button
          @click="clearLogs"
          :disabled="isExecuting"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🗑️ 清空日志
        </button>
      </div>
    </div>

    <!-- 执行日志 -->
    <div class="logs-container">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-semibold">执行日志</h4>
        <span class="text-sm text-gray-600">{{ currentTask.logs.length }} 条</span>
      </div>

      <div class="log-container bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
        <div v-if="currentTask.logs.length === 0" class="text-gray-500 text-center py-8">
          等待任务开始...
        </div>

        <div
          v-for="log in currentTask.logs"
          :key="log.id"
          :class="[
            'mb-2 p-2 rounded cursor-pointer transition-colors',
            {
              'hover:bg-gray-800': log.level === 'error',
              'bg-red-900/20': log.level === 'error',
            }
          ]"
          @click="log.level === 'error' && toggleLogExpand(log.id)"
        >
          <div class="flex items-start gap-2">
            <span class="flex-shrink-0">
              {{ getLogIcon(log.level) }}
            </span>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-gray-400">{{ formatTimestamp(log.timestamp) }}</span>
                <span :class="getLogColor(log.level)">{{ log.message }}</span>
              </div>

              <!-- 错误详情 -->
              <div
                v-if="log.level === 'error' && log.expanded && log.details"
                class="mt-2 p-2 bg-red-900/30 rounded border border-red-700"
              >
                <div class="text-red-300 text-sm mb-2">🔍 错误分析</div>
                <div v-if="log.details.length > 0" class="text-xs space-y-1">
                  <div v-for="(solution, index) in log.details" :key="index" class="text-gray-300">
                    💡 {{ solution.title || solution }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!currentTask.id" class="empty-state">
      <div class="text-center py-12">
        <div class="text-6xl mb-4">📋</div>
        <h3 class="text-xl font-semibold mb-2">等待任务分配</h3>
        <p class="text-gray-600">
          {{ connectionState === 'connected' ? '已连接到服务器，等待接收任务...' : '正在连接服务器...' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTaskExecution } from '../composables/useTaskExecution.js'

// 使用任务执行 composable
const {
  currentTask,
  connectionState,
  isExecuting,
  isCompleted,
  formattedDuration,
  progressColor,
  cancelTask,
  resetTask,
  clearLogs,
  toggleLogExpand,
} = useTaskExecution()

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

// 获取日志图标
const getLogIcon = (level: string) => {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    debug: '🔍',
  }
  return icons[level as keyof typeof icons] || '•'
}

// 获取日志颜色
const getLogColor = (level: string) => {
  const colors = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    debug: 'text-gray-400',
  }
  return colors[level as keyof typeof colors] || 'text-gray-400'
}

// 格式化时间戳
const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}
</script>

<style scoped>
.task-execution-panel {
  @apply bg-white rounded-lg shadow-lg p-6;
}

.connection-indicator {
  @apply mb-4 pb-4 border-b border-gray-200;
}

.task-info {
  @apply mb-4;
}

.logs-container {
  @apply mt-4;
}

.log-container {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  line-height: 1.6;
}

.empty-state {
  @apply flex items-center justify-center min-h-[400px];
}
</style>
