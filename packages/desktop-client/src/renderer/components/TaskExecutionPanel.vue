<template>
  <div class="space-y-6">
    <!-- 任务信息卡片 -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900">任务执行</h2>
          <p class="text-sm text-gray-600 mt-1">{{ currentTask?.name || '等待任务分配...' }}</p>
        </div>
        <div class="flex items-center gap-2">
          <div
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium',
              {
                'bg-green-100 text-green-800': taskStatus === 'completed',
                'bg-blue-100 text-blue-800': taskStatus === 'running',
                'bg-yellow-100 text-yellow-800': taskStatus === 'pending',
                'bg-red-100 text-red-800': taskStatus === 'failed',
              }
            ]"
          >
            {{ taskStatusText }}
          </div>
        </div>
      </div>

      <!-- 任务描述 -->
      <div v-if="currentTask" class="mb-4">
        <p class="text-gray-700">{{ currentTask.description }}</p>
      </div>

      <!-- 进度条 -->
      <div v-if="currentTask" class="mb-4">
        <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>执行进度</span>
          <span>{{ progressPercentage }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- 任务统计 -->
      <div v-if="currentTask" class="grid grid-cols-4 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-gray-900">{{ totalSteps }}</div>
          <div class="text-xs text-gray-600">总步骤</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-green-600">{{ completedSteps }}</div>
          <div class="text-xs text-gray-600">已完成</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-blue-600">{{ runningSteps }}</div>
          <div class="text-xs text-gray-600">执行中</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-red-600">{{ failedSteps }}</div>
          <div class="text-xs text-gray-600">失败</div>
        </div>
      </div>
    </div>

    <!-- 步骤时间线和日志 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左侧：步骤时间线 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">📋 执行步骤</h3>

        <div v-if="steps.length === 0" class="text-center text-gray-500 py-8">
          暂无执行步骤
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="border-l-4 pl-4 py-2 transition-all duration-200"
            :class="{
              'border-gray-300 bg-gray-50': step.status === 'pending',
              'border-blue-500 bg-blue-50': step.status === 'running',
              'border-green-500 bg-green-50': step.status === 'success',
              'border-red-500 bg-red-50': step.status === 'failed',
            }"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-gray-900">{{ index + 1 }}. {{ step.action }}</span>
                  <span v-if="step.retryCount && step.retryCount > 0" class="text-xs text-yellow-600">
                    (重试 {{ step.retryCount }}次)
                  </span>
                </div>
                <div v-if="step.description" class="text-xs text-gray-600 mt-1">
                  {{ step.description }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500">{{ step.duration }}ms</span>
                <div
                  :class="[
                    'w-2 h-2 rounded-full',
                    {
                      'bg-gray-400': step.status === 'pending',
                      'bg-blue-500 animate-pulse': step.status === 'running',
                      'bg-green-500': step.status === 'success',
                      'bg-red-500': step.status === 'failed',
                    }
                  ]"
                ></div>
              </div>
            </div>

            <!-- 错误信息 - 显著展示 -->
            <div v-if="step.error" class="mt-2 p-3 bg-red-100 rounded-lg border-2 border-red-300">
              <div class="flex items-start gap-2">
                <span class="text-red-500 text-lg">⚠️</span>
                <div class="flex-1">
                  <div class="font-bold text-red-700 text-sm">错误: {{ step.error }}</div>
                  <div v-if="step.stack" class="mt-1 text-xs text-red-600 cursor-pointer hover:text-red-800" @click="toggleErrorDetails(step)">
                    {{ showFullError[step.id] ? step.stack : `${step.stack.substring(0, 100)}...` }}
                    <span class="text-red-500 underline">{{ showFullError[step.id] ? '收起' : '展开详情' }}</span>
                  </div>

                  <!-- 错误分析和建议 -->
                  <div v-if="step.errorAnalysis" class="mt-2 p-2 bg-red-50 rounded border border-red-200">
                    <div class="text-xs font-semibold text-red-700">🔍 错误分析:</div>
                    <div class="text-xs text-red-600 mt-1">{{ step.errorAnalysis.possibleCause }}</div>
                    <div class="text-xs text-red-600 mt-1">💡 建议: {{ step.errorAnalysis.suggestion }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：执行日志 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">📜 执行日志</h3>
          <div class="flex items-center gap-2">
            <button
              @click="toggleFullscreen"
              class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              全屏
            </button>
            <button
              @click="clearLogs"
              class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              清空
            </button>
          </div>
        </div>

        <div ref="logContainer" class="h-96 overflow-y-auto space-y-2 p-4 bg-gray-900 rounded-lg text-sm font-mono">
          <div
            v-for="(log, index) in logs"
            :key="index"
            class="flex items-start gap-2"
            :class="{
              'text-green-400': log.level === 'info',
              'text-yellow-400': log.level === 'warn',
              'text-red-400': log.level === 'error',
            }"
          >
            <span class="text-gray-500 flex-shrink-0">{{ log.timestamp }}</span>
            <span class="flex-shrink-0">[{{ log.level.toUpperCase() }}]</span>
            <span class="flex-1 break-all">{{ log.message }}</span>
          </div>

          <div v-if="logs.length === 0" class="text-gray-500 text-center py-8">
            等待日志输出...
          </div>
        </div>
      </div>
    </div>

    <!-- 性能分析图表 -->
    <div v-if="showPerformance && currentTask" class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold mb-4">⚡ 性能分析</h3>

      <div class="grid grid-cols-3 gap-6">
        <div>
          <div class="text-sm text-gray-600 mb-1">浏览器启动</div>
          <div class="text-2xl font-bold text-blue-600">
            {{ performanceData.browserLaunchTime }}ms
          </div>
        </div>
        <div>
          <div class="text-sm text-gray-600 mb-1">页面加载</div>
          <div class="text-2xl font-bold text-green-600">
            {{ performanceData.totalPageLoadTime }}ms
          </div>
        </div>
        <div>
          <div class="text-sm text-gray-600 mb-1">AI操作</div>
          <div class="text-2xl font-bold text-purple-600">
            {{ performanceData.totalActionTime }}ms
          </div>
        </div>
      </div>
    </div>

    <!-- 截图画廊 -->
    <div v-if="screenshots.length > 0" class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold mb-4">📸 截图画廊</h3>

      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="(screenshot, index) in screenshots"
          :key="index"
          class="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div class="p-2 bg-gray-50 text-xs text-gray-600">
            {{ screenshot.stepId }}
          </div>
          <img
            :src="screenshot.path"
            :alt="screenshot.stepId"
            class="w-full h-32 object-cover cursor-pointer"
            @click="viewScreenshot(screenshot)"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useTaskExecution } from '../../composables/useTaskExecution'

// 使用任务执行 composable
const {
  currentTask,
  taskStatus,
  steps,
  logs,
  screenshots,
  performanceData,
  startTask,
  cancelTask
} = useTaskExecution()

// 性能数据
const showPerformance = ref(false)

// 计算属性
const progressPercentage = computed(() => {
  if (!currentTask.value || !steps.value.length) return 0
  const completed = steps.value.filter(s => s.status === 'success').length
  return Math.round((completed / steps.value.length) * 100)
})

const taskStatusText = computed(() => {
  const statusTexts = {
    pending: '等待中',
    running: '执行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  }
  return statusTexts[taskStatus.value] || '未知状态'
})

const totalSteps = computed(() => steps.value.length)
const completedSteps = computed(() => steps.value.filter(s => s.status === 'success').length)
const runningSteps = computed(() => steps.value.filter(s => s.status === 'running').length)
const failedSteps = computed(() => steps.value.filter(s => s.status === 'failed').length)

// 日志容器引用
const logContainer = ref<HTMLElement | null>(null)

// 错误详情展开状态
const showFullError = ref<Record<string, boolean>>({})

// 方法
const toggleFullscreen = () => {
  if (logContainer.value) {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      logContainer.value.requestFullscreen()
    }
  }
}

const clearLogs = () => {
  logs.value = []
}

const toggleErrorDetails = (step: any) => {
  showFullError.value[step.id] = !showFullError.value[step.id]
}

const viewScreenshot = (screenshot: any) => {
  // 在新窗口中打开截图
  window.open(screenshot.path, '_blank')
}

// 生命周期
onMounted(() => {
  console.log('📊 任务执行面板已挂载')
})

onUnmounted(() => {
  console.log('📊 任务执行面板已卸载')
})
</script>

<style scoped>
/* 自定义滚动条 */
.space-y-6 > div::-webkit-scrollbar {
  width: 6px;
}

.space-y-6 > div::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.space-y-6 > div::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.space-y-6 > div::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
