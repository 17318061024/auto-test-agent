<template>
  <div class="space-y-6">
    <!-- 任务完成/失败横幅 -->
    <div
      v-if="hasError"
      class="rounded-lg p-4 border-2 border-red-300 bg-red-50"
    >
      <div class="flex items-center gap-3">
        <span class="text-3xl">&#x274C;</span>
        <div class="flex-1">
          <div class="text-lg font-bold text-red-800">任务失败</div>
          <div v-if="currentTask.error" class="text-sm text-red-600 mt-1">{{ currentTask.error }}</div>
          <div class="text-sm text-red-500 mt-1">耗时: {{ formattedDuration }}</div>
        </div>
        <button
          @click="resetTask"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          重置
        </button>
      </div>
    </div>

    <div
      v-if="currentTask.status === 'completed'"
      class="rounded-lg p-4 border-2 border-green-300 bg-green-50"
    >
      <div class="flex items-center gap-3">
        <span class="text-3xl">&#x2705;</span>
        <div class="flex-1">
          <div class="text-lg font-bold text-green-800">任务完成</div>
          <div class="text-sm text-green-600 mt-1">总耗时: {{ formattedDuration }}</div>
        </div>
        <button
          @click="resetTask"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          重置
        </button>
      </div>
    </div>

    <div
      v-if="currentTask.status === 'cancelled'"
      class="rounded-lg p-4 border-2 border-yellow-300 bg-yellow-50"
    >
      <div class="flex items-center gap-3">
        <span class="text-3xl">&#x26A0;&#xFE0F;</span>
        <div class="flex-1">
          <div class="text-lg font-bold text-yellow-800">任务已取消</div>
          <div class="text-sm text-yellow-600 mt-1">耗时: {{ formattedDuration }}</div>
        </div>
        <button
          @click="resetTask"
          class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
        >
          重置
        </button>
      </div>
    </div>

    <!-- 任务信息卡片 -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900">任务执行</h2>
          <p class="text-sm text-gray-600 mt-1">{{ currentTask.name || '等待任务分配...' }}</p>
        </div>
        <div class="flex items-center gap-2">
          <div
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium',
              {
                'bg-green-100 text-green-800': currentTask.status === 'completed',
                'bg-blue-100 text-blue-800': currentTask.status === 'running',
                'bg-yellow-100 text-yellow-800': currentTask.status === 'pending',
                'bg-red-100 text-red-800': currentTask.status === 'failed',
                'bg-orange-100 text-orange-800': currentTask.status === 'cancelled',
              }
            ]"
          >
            {{ taskStatusText }}
          </div>
          <button
            v-if="isExecuting"
            @click="cancelTask"
            class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            取消
          </button>
        </div>
      </div>

      <!-- 任务描述 -->
      <div v-if="currentTask.description" class="mb-4">
        <p class="text-gray-700">{{ currentTask.description }}</p>
      </div>

      <!-- 进度条 -->
      <div v-if="currentTask.id" class="mb-4">
        <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>执行进度</span>
          <span>{{ currentTask.progress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div
            :class="['h-2.5 rounded-full transition-all duration-300', progressColor]"
            :style="{ width: `${currentTask.progress}%` }"
          ></div>
        </div>
      </div>

      <!-- 任务统计 -->
      <div v-if="currentTask.id" class="grid grid-cols-4 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-gray-900">{{ currentTask.totalSteps }}</div>
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
        <h3 class="text-lg font-semibold mb-4">执行步骤</h3>

        <div v-if="steps.length === 0" class="text-center text-gray-400 py-8">
          <div class="text-4xl mb-2">&#x1F4CB;</div>
          <div>暂无执行步骤</div>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="border-l-4 pl-4 py-2 transition-all duration-200 relative"
            :class="{
              'border-gray-300 bg-gray-50': step.status === 'pending',
              'border-blue-500 bg-blue-50': step.status === 'running',
              'border-green-500 bg-green-50': step.status === 'success',
              'border-red-500 bg-red-50 animate-pulse': step.status === 'failed',
            }"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-gray-900">{{ index + 1 }}. {{ step.action }}</span>
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

            <!-- 错误信息 -->
            <div v-if="step.error" class="mt-2 p-2 bg-red-100 rounded border border-red-300">
              <div class="text-sm text-red-700">{{ step.error }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：执行日志 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-semibold">执行日志</h3>
            <div class="flex items-center gap-1 text-xs">
              <span v-if="errorCount > 0" class="px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                {{ errorCount }} 错误
              </span>
              <span v-if="warningCount > 0" class="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                {{ warningCount }} 警告
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <select v-model="logFilter" class="px-2 py-1 text-sm border rounded">
              <option value="all">全部</option>
              <option value="error">仅错误</option>
              <option value="warning">警告</option>
              <option value="info">信息</option>
            </select>
            <button
              @click="clearLogs"
              class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              清空
            </button>
          </div>
        </div>

        <div class="log-container h-96 overflow-y-auto space-y-1 p-4 bg-gray-900 rounded-lg text-sm font-mono">
          <div
            v-for="log in filteredLogs"
            :key="log.id"
            class="flex items-start gap-2"
            :class="{
              'text-green-400': log.level === 'success' || log.level === 'info',
              'text-blue-300': log.level === 'debug',
              'text-yellow-400': log.level === 'warning',
              'text-red-400 font-bold bg-red-900/30 -mx-2 px-2 py-1 rounded': log.level === 'error',
            }"
          >
            <span class="text-gray-500 flex-shrink-0 text-xs">{{ formatTime(log.timestamp) }}</span>
            <span class="flex-shrink-0 font-bold text-xs">[{{ log.level.toUpperCase() }}]</span>
            <span class="flex-1 break-all">{{ log.message }}</span>
            <button
              v-if="log.details"
              @click="toggleLogExpand(log.id)"
              class="flex-shrink-0 text-gray-500 hover:text-gray-300 text-xs"
            >
              {{ log.expanded ? '收起' : '详情' }}
            </button>
          </div>

          <div v-if="filteredLogs.length === 0" class="text-gray-500 text-center py-8">
            {{ currentTask.logs.length === 0 ? '等待日志输出...' : '没有符合筛选条件的日志' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTaskExecution } from '../../composables/useTaskExecution'

const {
  currentTask,
  steps,
  isExecuting,
  hasError,
  formattedDuration,
  progressColor,
  cancelTask,
  resetTask,
  clearLogs,
  toggleLogExpand,
} = useTaskExecution()

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

// 步骤统计
const completedSteps = computed(() => steps.value.filter((s: any) => s.status === 'success').length)
const runningSteps = computed(() => steps.value.filter((s: any) => s.status === 'running').length)
const failedSteps = computed(() => steps.value.filter((s: any) => s.status === 'failed').length)

// 日志过滤
const logFilter = ref<'all' | 'error' | 'warning' | 'info'>('all')

const filteredLogs = computed(() => {
  if (logFilter.value === 'all') return currentTask.logs
  return currentTask.logs.filter(log => log.level === logFilter.value)
})

const errorCount = computed(() => currentTask.logs.filter(log => log.level === 'error').length)
const warningCount = computed(() => currentTask.logs.filter(log => log.level === 'warning').length)

// 格式化时间
const formatTime = (ts: number) => {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

// 当新任务开始时，重置过滤器
watch(() => currentTask.status, (newStatus) => {
  if (newStatus === 'running') {
    logFilter.value = 'all'
  }
})
</script>
