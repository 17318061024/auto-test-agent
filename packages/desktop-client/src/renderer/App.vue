<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- 顶部导航栏 -->
    <header class="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <div>
          <h1 class="text-base font-semibold text-slate-900">Auto Test Agent</h1>
        </div>
      </div>
      <div class="flex items-center gap-5 text-sm">
        <div class="flex items-center gap-1.5">
          <div :class="['w-2 h-2 rounded-full', { 'bg-emerald-500': connectionState === 'connected', 'bg-amber-500 animate-pulse': connectionState === 'connecting' || connectionState === 'reconnecting', 'bg-red-500': connectionState === 'failed' || connectionState === 'disconnected' }]"></div>
          <span class="text-slate-500">{{ connectionText }}</span>
        </div>
        <span class="text-slate-300">|</span>
        <span class="text-slate-400">{{ systemInfo.platform }} / {{ systemInfo.arch }}</span>
      </div>
    </header>

    <!-- 无任务时的空状态 -->
    <main v-if="!currentTask.id" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
          <svg class="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-slate-700 mb-2">等待任务分配</h2>
        <p class="text-slate-400 mb-1">客户端已就绪，等待 Web 控制台下发测试任务</p>
        <p class="text-xs text-slate-300 mt-4">桌面客户端 v0.2.0 | Electron {{ systemInfo.electronVersion }}</p>
      </div>
    </main>

    <!-- 有任务时的主界面 -->
    <main v-else class="flex-1 flex flex-col overflow-hidden">
      <!-- 任务概览条 -->
      <div class="bg-white border-b border-slate-200 px-6 py-3 flex-shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <div :class="['w-2.5 h-2.5 rounded-full', { 'bg-emerald-500': currentTask.status === 'completed', 'bg-blue-500 animate-pulse': currentTask.status === 'running', 'bg-amber-500': currentTask.status === 'pending', 'bg-red-500': currentTask.status === 'failed', 'bg-slate-400': currentTask.status === 'cancelled' }]"></div>
              <span class="font-semibold text-slate-900">{{ currentTask.name }}</span>
            </div>
            <span :class="['px-2 py-0.5 rounded text-xs font-medium', statusBadgeClass]">{{ taskStatusText }}</span>
            <span v-if="currentTask.description" class="text-sm text-slate-400 hidden lg:inline">{{ currentTask.description }}</span>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <div v-if="isExecuting || isCompleted" class="flex items-center gap-3 text-slate-500">
              <span>{{ formattedDuration }}</span>
              <span class="text-slate-200">|</span>
              <span>{{ currentTask.currentStep }}/{{ currentTask.totalSteps }} 步骤</span>
            </div>
            <button v-if="isExecuting" @click="cancelTask" class="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200">取消任务</button>
            <button v-if="isCompleted || hasError" @click="resetTask" class="px-3 py-1 text-xs bg-slate-50 text-slate-600 rounded hover:bg-slate-100 border border-slate-200">重置</button>
          </div>
        </div>

        <!-- 进度条 -->
        <div v-if="isExecuting || isCompleted" class="mt-2.5">
          <div class="w-full bg-slate-100 rounded-full h-1.5">
            <div :class="['h-1.5 rounded-full transition-all duration-500', progressColor]" :style="{ width: `${currentTask.progress}%` }"></div>
          </div>
        </div>
      </div>

      <!-- 完成状态横幅 -->
      <div v-if="currentTask.status === 'completed'" class="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-sm flex-shrink-0">
        <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span class="text-emerald-800 font-medium">任务执行完成</span>
        <span class="text-emerald-600">共 {{ currentTask.totalSteps }} 步，耗时 {{ formattedDuration }}</span>
      </div>
      <div v-if="hasError" class="bg-red-50 border-b border-red-200 px-6 py-2.5 flex items-center gap-2 text-sm flex-shrink-0">
        <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span class="text-red-800 font-medium">任务执行失败</span>
        <span v-if="currentTask.error" class="text-red-600">{{ currentTask.error }}</span>
      </div>

      <!-- 主内容区域 -->
      <div class="flex-1 flex overflow-hidden">
        <!-- 左侧：用例步骤 -->
        <div class="w-80 border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
          <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-700">测试用例</h3>
            <span class="text-xs text-slate-400">{{ steps.length }} 个步骤</span>
          </div>
          <div class="flex-1 overflow-y-auto">
            <div v-if="steps.length === 0" class="text-center text-slate-300 py-12 text-sm">加载中...</div>
            <div v-else>
              <div
                v-for="(step, index) in steps"
                :key="step.id"
                :class="['px-4 py-3 border-b border-slate-50 transition-colors', stepBgClass(step.status)]"
              >
                <div class="flex items-start gap-2.5">
                  <div class="mt-0.5 flex-shrink-0">
                    <div v-if="step.status === 'pending'" class="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-medium">{{ index + 1 }}</div>
                    <div v-else-if="step.status === 'running'" class="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                      <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    </div>
                    <div v-else-if="step.status === 'success'" class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <div v-else-if="step.status === 'failed'" class="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                      <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span :class="['text-sm font-medium', step.status === 'pending' ? 'text-slate-400' : 'text-slate-800']">{{ step.action }}</span>
                    </div>
                    <div v-if="step.description" class="text-xs text-slate-400 mt-0.5 truncate">{{ step.description }}</div>
                    <div class="flex items-center gap-2 mt-1">
                      <span v-if="step.status !== 'pending'" class="text-[11px] text-slate-400">{{ step.duration }}ms</span>
                      <span v-if="step.status === 'failed' && step.error" class="text-[11px] text-red-500 truncate">{{ step.error }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：日志 + 执行信息 -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <!-- 标签页 -->
          <div class="bg-white border-b border-slate-200 px-4 flex items-center gap-0 flex-shrink-0">
            <button @click="activeTab = 'logs'" :class="['px-4 py-2.5 text-sm font-medium border-b-2 -mb-px', activeTab === 'logs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600']">
              执行日志
              <span v-if="currentTask.logs.length" class="ml-1 text-xs text-slate-300">({{ currentTask.logs.length }})</span>
            </button>
            <button @click="activeTab = 'details'" :class="['px-4 py-2.5 text-sm font-medium border-b-2 -mb-px', activeTab === 'details' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600']">
              执行详情
            </button>
          </div>

          <!-- 日志 Tab -->
          <div v-show="activeTab === 'logs'" class="flex-1 overflow-hidden flex flex-col">
            <div class="px-4 py-2 flex items-center justify-between bg-slate-50 flex-shrink-0">
              <div class="flex items-center gap-1.5">
                <button v-for="f in logFilters" :key="f.value" @click="logFilter = f.value" :class="['px-2 py-0.5 text-xs rounded', logFilter === f.value ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:bg-slate-100']">{{ f.label }}</button>
              </div>
              <button @click="clearLogs" class="text-xs text-slate-400 hover:text-slate-600">清空</button>
            </div>
            <div class="flex-1 overflow-y-auto p-4 bg-slate-900 font-mono text-[13px] leading-5 space-y-0.5">
              <div v-if="filteredLogs.length === 0" class="text-slate-600 text-center py-12 text-sm">暂无日志</div>
              <div v-for="log in filteredLogs" :key="log.id" :class="['flex items-start gap-2 px-1 py-0.5 rounded', log.level === 'error' ? 'bg-red-950/50' : '']">
                <span class="text-slate-600 flex-shrink-0 text-[11px] mt-0.5 w-16 text-right">{{ formatTime(log.timestamp) }}</span>
                <span :class="['flex-shrink-0 text-[11px] font-bold mt-0.5 w-4 text-center', logLevelColor(log.level)]">{{ logLevelIcon(log.level) }}</span>
                <span :class="['flex-1 break-all', log.level === 'error' ? 'text-red-300' : log.level === 'success' ? 'text-emerald-300' : log.level === 'warning' ? 'text-amber-300' : 'text-slate-300']">{{ log.message }}</span>
              </div>
            </div>
          </div>

          <!-- 详情 Tab -->
          <div v-show="activeTab === 'details'" class="flex-1 overflow-y-auto p-6">
            <div class="max-w-2xl space-y-6">
              <!-- 任务基本信息 -->
              <section>
                <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">任务信息</h4>
                <div class="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
                  <div class="px-4 py-2.5 flex justify-between text-sm">
                    <span class="text-slate-500">任务名称</span>
                    <span class="text-slate-900 font-medium">{{ currentTask.name || '-' }}</span>
                  </div>
                  <div class="px-4 py-2.5 flex justify-between text-sm">
                    <span class="text-slate-500">描述</span>
                    <span class="text-slate-700">{{ currentTask.description || '-' }}</span>
                  </div>
                  <div class="px-4 py-2.5 flex justify-between text-sm">
                    <span class="text-slate-500">状态</span>
                    <span :class="statusBadgeClass + ' px-2 py-0.5 rounded text-xs font-medium'">{{ taskStatusText }}</span>
                  </div>
                  <div class="px-4 py-2.5 flex justify-between text-sm">
                    <span class="text-slate-500">进度</span>
                    <span class="text-slate-900 font-medium">{{ currentTask.progress }}%</span>
                  </div>
                  <div class="px-4 py-2.5 flex justify-between text-sm">
                    <span class="text-slate-500">步骤</span>
                    <span class="text-slate-900">{{ currentTask.currentStep }} / {{ currentTask.totalSteps }}</span>
                  </div>
                  <div class="px-4 py-2.5 flex justify-between text-sm">
                    <span class="text-slate-500">耗时</span>
                    <span class="text-slate-900 font-medium">{{ formattedDuration }}</span>
                  </div>
                </div>
              </section>

              <!-- 步骤统计 -->
              <section>
                <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">步骤执行统计</h4>
                <div class="grid grid-cols-4 gap-3">
                  <div class="bg-white rounded-lg border border-slate-200 p-3 text-center">
                    <div class="text-2xl font-bold text-slate-900">{{ currentTask.totalSteps }}</div>
                    <div class="text-[11px] text-slate-400 mt-0.5">总步骤</div>
                  </div>
                  <div class="bg-white rounded-lg border border-emerald-200 p-3 text-center">
                    <div class="text-2xl font-bold text-emerald-600">{{ completedSteps }}</div>
                    <div class="text-[11px] text-emerald-500 mt-0.5">通过</div>
                  </div>
                  <div class="bg-white rounded-lg border border-red-200 p-3 text-center">
                    <div class="text-2xl font-bold text-red-600">{{ failedSteps }}</div>
                    <div class="text-[11px] text-red-500 mt-0.5">失败</div>
                  </div>
                  <div class="bg-white rounded-lg border border-slate-200 p-3 text-center">
                    <div class="text-2xl font-bold text-slate-400">{{ currentTask.totalSteps - completedSteps - failedSteps }}</div>
                    <div class="text-[11px] text-slate-400 mt-0.5">待执行</div>
                  </div>
                </div>
              </section>

              <!-- 用例步骤详情 -->
              <section>
                <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">步骤执行明细</h4>
                <div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="bg-slate-50 text-left">
                        <th class="px-4 py-2 text-xs font-medium text-slate-500 w-12">#</th>
                        <th class="px-4 py-2 text-xs font-medium text-slate-500">操作</th>
                        <th class="px-4 py-2 text-xs font-medium text-slate-500">描述</th>
                        <th class="px-4 py-2 text-xs font-medium text-slate-500 w-20 text-center">状态</th>
                        <th class="px-4 py-2 text-xs font-medium text-slate-500 w-20 text-right">耗时</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr v-for="(step, index) in steps" :key="step.id" :class="stepTableRowClass(step.status)">
                        <td class="px-4 py-2.5 text-slate-400">{{ index + 1 }}</td>
                        <td class="px-4 py-2.5 font-medium text-slate-800">{{ step.action }}</td>
                        <td class="px-4 py-2.5 text-slate-500 max-w-xs truncate">{{ step.description || '-' }}</td>
                        <td class="px-4 py-2.5 text-center">
                          <span :class="stepStatusBadgeClass(step.status)">{{ stepStatusText(step.status) }}</span>
                        </td>
                        <td class="px-4 py-2.5 text-right text-slate-400">{{ step.status === 'pending' ? '-' : step.duration + 'ms' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <!-- 失败详情 -->
              <section v-if="failedStepDetails.length > 0">
                <h4 class="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">失败步骤详情</h4>
                <div class="space-y-3">
                  <div v-for="step in failedStepDetails" :key="step.id" class="bg-red-50 rounded-lg border border-red-200 p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-sm font-semibold text-red-800">{{ step.action }}</span>
                      <span class="text-xs text-red-500">{{ step.duration }}ms</span>
                    </div>
                    <div v-if="step.error" class="text-sm text-red-700 font-mono bg-red-100 rounded p-2 mt-2 whitespace-pre-wrap">{{ step.error }}</div>
                    <div v-if="step.description" class="text-xs text-red-400 mt-2">{{ step.description }}</div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部状态栏 -->
    <footer class="bg-white border-t border-slate-200 px-6 py-1.5 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0">
      <div class="flex items-center gap-4">
        <span>Node {{ systemInfo.nodeVersion }}</span>
        <span>Electron {{ systemInfo.electronVersion }}</span>
      </div>
      <div class="flex items-center gap-4">
        <span>{{ memoryUsage }}</span>
        <span>{{ uptime }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTaskExecution } from '../composables/useTaskExecution'

const {
  connectionState,
  currentTask,
  steps,
  isExecuting,
  isCompleted,
  hasError,
  formattedDuration,
  progressColor,
  cancelTask,
  resetTask,
  clearLogs,
  initTaskExecution,
  destroyTaskExecution,
} = useTaskExecution()

const activeTab = ref<'logs' | 'details'>('logs')
const logFilter = ref<string>('all')

const systemInfo = ref({
  platform: process.platform,
  arch: process.arch,
  nodeVersion: process.version,
  electronVersion: process.versions.electron,
})

const memoryUsage = ref('0 MB')
const uptime = ref('0:00')

let perfTimer: ReturnType<typeof setInterval> | null = null

const logFilters = [
  { label: '全部', value: 'all' },
  { label: '信息', value: 'info' },
  { label: '成功', value: 'success' },
  { label: '警告', value: 'warning' },
  { label: '错误', value: 'error' },
]

const connectionText = computed(() => {
  const m: Record<string, string> = { disconnected: '未连接', connecting: '连接中...', connected: '已连接', reconnecting: '重连中...', failed: '连接失败' }
  return m[connectionState.value] || '未知'
})

const taskStatusText = computed(() => {
  const m: Record<string, string> = { pending: '等待中', running: '执行中', completed: '已完成', failed: '失败', cancelled: '已取消' }
  return m[currentTask.status] || '未知'
})

const statusBadgeClass = computed(() => {
  const m: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    running: 'bg-blue-50 text-blue-700',
    completed: 'bg-emerald-50 text-emerald-700',
    failed: 'bg-red-50 text-red-700',
    cancelled: 'bg-slate-100 text-slate-600',
  }
  return m[currentTask.status] || ''
})

const completedSteps = computed(() => steps.value.filter((s: any) => s.status === 'success').length)
const failedSteps = computed(() => steps.value.filter((s: any) => s.status === 'failed').length)
const failedStepDetails = computed(() => steps.value.filter((s: any) => s.status === 'failed'))

const filteredLogs = computed(() => {
  if (logFilter.value === 'all') return currentTask.logs
  return currentTask.logs.filter(log => log.level === logFilter.value)
})

const formatTime = (ts: number) => {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

const logLevelIcon = (level: string) => ({ info: 'i', success: '+', warning: '!', error: 'x', debug: 'd' }[level] || 'i')
const logLevelColor = (level: string) => ({ info: 'text-blue-400', success: 'text-emerald-400', warning: 'text-amber-400', error: 'text-red-400', debug: 'text-slate-500' }[level] || 'text-slate-500')

const stepBgClass = (status: string) => ({ pending: '', running: 'bg-blue-50/50', success: 'bg-emerald-50/50', failed: 'bg-red-50/50' }[status] || '')
const stepStatusText = (status: string) => ({ pending: '待执行', running: '执行中', success: '通过', failed: '失败' }[status] || status)
const stepStatusBadgeClass = (status: string) => {
  const m: Record<string, string> = { pending: 'text-slate-400', running: 'text-blue-600', success: 'text-emerald-600 font-medium', failed: 'text-red-600 font-medium' }
  return m[status] || 'text-slate-400'
}
const stepTableRowClass = (status: string) => ({ running: 'bg-blue-50/30', failed: 'bg-red-50/30' }[status] || '')

const updatePerf = () => {
  const u = process.memoryUsage()
  memoryUsage.value = `${Math.round(u.heapUsed / 1024 / 1024)} MB`
  const s = Math.floor(process.uptime())
  uptime.value = s >= 3600 ? `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m` : `${Math.floor(s/60)}m ${s%60}s`
}

onMounted(() => {
  initTaskExecution()
  updatePerf()
  perfTimer = setInterval(updatePerf, 5000)
})

onUnmounted(() => {
  if (perfTimer) clearInterval(perfTimer)
  destroyTaskExecution()
})
</script>
