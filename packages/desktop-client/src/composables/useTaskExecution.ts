/**
 * 任务执行实时状态管理
 * 使用模块级单例模式，确保所有组件共享同一份状态
 */

import { ref, reactive, computed, nextTick } from 'vue'
import { WebSocketClient } from '../main/WebSocketClient'

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}

export interface TaskLog {
  id: string
  timestamp: number
  level: 'info' | 'success' | 'warning' | 'error' | 'debug'
  message: string
  details?: any
  expanded?: boolean
}

export interface TaskState {
  id: string
  name: string
  description?: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  currentStep: number
  totalSteps: number
  progress: number
  startTime: number
  endTime?: number
  duration: number
  error?: string
  logs: TaskLog[]
}

export interface TaskStatusMessage {
  taskId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  currentStep?: number
  totalSteps?: number
  progress?: number
  stepResult?: {
    stepId: string
    status: 'success' | 'failed'
    duration: number
    error?: string
  }
}

// ============ 模块级单例状态 ============

let wsClient: WebSocketClient | null = null
const connectionState = ref<ConnectionState>(ConnectionState.DISCONNECTED)
let initialized = false

const currentTask = reactive<TaskState>({
  id: '',
  name: '',
  status: 'pending',
  currentStep: 0,
  totalSteps: 0,
  progress: 0,
  startTime: 0,
  duration: 0,
  logs: [],
})

const steps = ref<any[]>([])

// ============ 计算属性 ============

const isExecuting = computed(() => currentTask.status === 'running')

const isCompleted = computed(() =>
  currentTask.status === 'completed' || currentTask.status === 'failed' || currentTask.status === 'cancelled'
)

const hasError = computed(() => currentTask.status === 'failed')

const formattedDuration = computed(() => {
  const duration = currentTask.duration
  if (duration < 1000) return `${duration}ms`
  if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`
  const minutes = Math.floor(duration / 60000)
  const seconds = ((duration % 60000) / 1000).toFixed(0)
  return `${minutes}m ${seconds}s`
})

const progressColor = computed(() => {
  if (hasError.value) return 'bg-red-500'
  if (currentTask.status === 'completed') return 'bg-green-500'
  if (currentTask.status === 'cancelled') return 'bg-yellow-500'
  return 'bg-blue-500'
})

// ============ 内部方法 ============

function addLog(level: TaskLog['level'], message: string, details?: any) {
  const log: TaskLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    level,
    message,
    details,
    expanded: false,
  }
  currentTask.logs.push(log)
  scrollToLatestLog()
}

function scrollToLatestLog() {
  nextTick(() => {
    setTimeout(() => {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const logContainer = document.querySelector('.log-container')
        if (logContainer) {
          logContainer.scrollTop = logContainer.scrollHeight
        }
      }
    }, 100)
  })
}

function calculateProgress(): number {
  if (currentTask.totalSteps === 0) return 0
  return Math.round((currentTask.currentStep / currentTask.totalSteps) * 100)
}

function handleStepResult(stepResult: any) {
  const { stepId, status, duration, error } = stepResult

  // 更新或添加步骤
  const existing = steps.value.find((s: any) => s.id === stepId)
  if (existing) {
    existing.status = status
    existing.duration = duration
    if (error) existing.error = error
  } else {
    steps.value.push({
      id: stepId,
      action: stepResult.action || stepId,
      status,
      duration,
      error: error || undefined,
    })
  }

  // 更新当前步骤计数和进度
  const completedCount = steps.value.filter((s: any) => s.status === 'success' || s.status === 'failed').length
  currentTask.currentStep = completedCount
  currentTask.progress = calculateProgress()

  if (status === 'success') {
    addLog('success', `步骤 ${stepId} 完成 (${duration}ms)`)
  } else if (status === 'failed') {
    addLog('error', `步骤 ${stepId} 失败: ${error}`)
  }
}

function setupWebSocketListeners() {
  if (!wsClient) return

  wsClient.on('connection:state', ({ newState }: any) => {
    connectionState.value = newState
    if (newState === ConnectionState.CONNECTED) {
      addLog('success', '已连接到服务器')
    } else if (newState === ConnectionState.DISCONNECTED) {
      addLog('warning', '与服务器断开连接')
    } else if (newState === ConnectionState.RECONNECTING) {
      addLog('info', '正在尝试重新连接...')
    } else if (newState === ConnectionState.FAILED) {
      addLog('error', '连接服务器失败')
    }
  })

  wsClient.on('task:assigned', (data: any) => {
    startTask(data)
  })

  wsClient.on('task:updated', (data: TaskStatusMessage) => {
    updateTaskStatus(data)
  })

  wsClient.on('server:message', (data: any) => {
    addLog('info', data.message || '服务器消息', data)
  })
}

// ============ 公开方法 ============

function startTask(taskData: any) {
  // 清空之前的日志和步骤
  currentTask.logs = []
  steps.value = []

  const taskSteps = taskData.steps || []
  const totalStepsCount = taskSteps.length || taskData.totalSteps || 0

  // 从任务数据中预填充步骤列表
  if (taskSteps.length > 0) {
    const actionLabels: Record<string, string> = {
      open: '打开页面',
      fill: '输入内容',
      click: '点击元素',
      waitForSelector: '等待元素',
      wait: '等待',
      type: '输入',
      navigate: '导航',
      screenshot: '截图',
      assert: '断言',
      aiAct: 'AI自动执行',
      aiInput: 'AI视觉输入',
      aiTap: 'AI视觉点击',
      aiWaitFor: 'AI视觉等待',
      aiQuery: 'AI视觉查询',
    }
    steps.value = taskSteps.map((s: any, i: number) => ({
      id: s.id || `step_${i + 1}`,
      action: actionLabels[s.action] || s.action || `步骤 ${i + 1}`,
      params: s.params,
      description: s.description || (s.params ? s.params.join(', ') : ''),
      status: 'pending',
      duration: 0,
    }))
  }

  Object.assign(currentTask, {
    id: taskData.taskId || taskData.id,
    name: taskData.name || '未命名任务',
    description: taskData.description,
    status: 'running',
    currentStep: 0,
    totalSteps: totalStepsCount,
    progress: 0,
    startTime: Date.now(),
    duration: 0,
    endTime: undefined,
    error: undefined,
  })

  addLog('info', `开始执行任务: ${currentTask.name}`)
  if (totalStepsCount > 0) {
    addLog('info', `共 ${totalStepsCount} 个步骤`)
  }
}

function updateTaskStatus(statusMessage: TaskStatusMessage) {
  if (statusMessage.taskId && statusMessage.taskId !== currentTask.id) return

  currentTask.status = statusMessage.status
  if (statusMessage.currentStep != null) currentTask.currentStep = statusMessage.currentStep
  if (statusMessage.totalSteps != null) currentTask.totalSteps = statusMessage.totalSteps
  if (statusMessage.progress != null) {
    currentTask.progress = statusMessage.progress
  } else {
    currentTask.progress = calculateProgress()
  }
  currentTask.duration = Date.now() - currentTask.startTime

  if (statusMessage.status === 'completed' || statusMessage.status === 'failed') {
    currentTask.endTime = Date.now()
    currentTask.duration = currentTask.endTime - currentTask.startTime

    if (statusMessage.status === 'completed') {
      addLog('success', `任务完成! 总耗时: ${currentTask.duration}ms`)
    } else {
      addLog('error', `任务失败: ${currentTask.error || '未知错误'}`)
    }
  }

  if (statusMessage.stepResult) {
    handleStepResult(statusMessage.stepResult)
  }
}

function cancelTask() {
  if (!currentTask.id || currentTask.status !== 'running') return

  if (wsClient) {
    wsClient.send('task:cancel', {
      taskId: currentTask.id,
      reason: '用户取消',
    })
  }

  currentTask.status = 'cancelled'
  currentTask.endTime = Date.now()
  currentTask.duration = currentTask.endTime - currentTask.startTime
  addLog('warning', '任务已取消')
}

function resetTask() {
  Object.assign(currentTask, {
    id: '',
    name: '',
    description: undefined,
    status: 'pending',
    currentStep: 0,
    totalSteps: 0,
    progress: 0,
    startTime: 0,
    duration: 0,
    endTime: undefined,
    logs: [],
    error: undefined,
  })
  steps.value = []
}

function clearLogs() {
  currentTask.logs = []
}

function toggleLogExpand(logId: string) {
  const log = currentTask.logs.find(l => l.id === logId)
  if (log) log.expanded = !log.expanded
}

function getErrorDiagnosis(errorMessage: string) {
  const message = errorMessage.toLowerCase()
  let type = 'unknown'
  let solutions: string[] = []

  if (message.includes('timeout') || message.includes('not found')) {
    type = 'element_not_found'
    solutions = ['检查元素选择器是否正确', '增加等待时间', '使用更稳定的定位策略']
  } else if (message.includes('network') || message.includes('connection')) {
    type = 'network_error'
    solutions = ['检查网络连接', '确认目标URL可访问', '增加超时时间']
  } else if (message.includes('permission') || message.includes('auth')) {
    type = 'permission_error'
    solutions = ['检查操作权限', '确认用户已登录', '检查页面权限设置']
  } else {
    solutions = ['查看详细错误日志', '刷新页面后重试', '联系技术支持']
  }

  return { type, solutions }
}

// ============ 初始化（只调用一次）============

function initTaskExecution() {
  if (initialized) return
  initialized = true

  // 尝试 WebSocket 连接
  try {
    wsClient = new WebSocketClient()
    setupWebSocketListeners()
    wsClient.connect()
  } catch (error) {
    console.warn('WebSocket 初始化失败（可能在渲染进程环境）:', error)
  }

  // IPC 监听
  try {
    const { ipcRenderer } = window.require('electron')
    ipcRenderer.on('task:assigned', (_event: any, data: any) => {
      startTask(data)
    })
    ipcRenderer.on('task:start', (_event: any, data: any) => {
      startTask(data)
    })
    ipcRenderer.on('step:complete', (_event: any, data: any) => {
      if (data) {
        handleStepResult({ stepId: data.stepId || data.id, status: 'success', duration: data.duration || 0 })
      }
    })
    ipcRenderer.on('step:failed', (_event: any, data: any) => {
      if (data) {
        handleStepResult({ stepId: data.stepId || data.id, status: 'failed', duration: data.duration || 0, error: data.error })
      }
    })
    ipcRenderer.on('task:status:update', (_event: any, data: any) => {
      if (data && data.taskId) updateTaskStatus(data)
    })
    ipcRenderer.on('task:completed:update', (_event: any, data: any) => {
      Object.assign(currentTask, { status: 'completed' })
      currentTask.endTime = Date.now()
      if (currentTask.startTime) {
        currentTask.duration = currentTask.endTime - currentTask.startTime
      }
      addLog('success', '任务已完成')
    })
    ipcRenderer.on('task:failed:update', (_event: any, data: any) => {
      Object.assign(currentTask, { status: 'failed', error: data?.error })
      currentTask.endTime = Date.now()
      if (currentTask.startTime) {
        currentTask.duration = currentTask.endTime - currentTask.startTime
      }
      addLog('error', `任务失败: ${data?.error || '未知错误'}`)
    })
    connectionState.value = ConnectionState.CONNECTED
    console.log('IPC 监听器已设置')
  } catch (e) {
    console.warn('IPC 不可用:', e)
  }
}

function destroyTaskExecution() {
  if (wsClient) {
    wsClient.disconnect()
    wsClient = null
  }
  initialized = false
}

// ============ Composable 入口 ============

export function useTaskExecution() {
  return {
    currentTask,
    connectionState,
    steps,

    isExecuting,
    isCompleted,
    hasError,
    formattedDuration,
    progressColor,

    startTask,
    cancelTask,
    resetTask,
    clearLogs,
    toggleLogExpand,
    getErrorDiagnosis,
    addLog,

    initTaskExecution,
    destroyTaskExecution,
  }
}
