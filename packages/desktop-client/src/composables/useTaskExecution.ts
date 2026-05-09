/**
 * @auto-test-agent/desktop-client
 *
 * 任务执行实时状态管理
 * 提供任务执行的实时状态更新和显示功能
 *
 * 主要功能：
 * - 实时状态更新
 * - 进度显示
 * - 日志流式输出
 * - 错误实时处理
 * - 性能数据展示
 * - WebSocket实时通信
 * - 错误诊断助手
 */

import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { WebSocketClient } from '../main/WebSocketClient'

/**
 * WebSocket连接状态枚举
 */
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}

/**
 * 任务日志接口
 */
export interface TaskLog {
  /** 日志ID */
  id: string
  /** 时间戳 */
  timestamp: number
  /** 日志级别 */
  level: 'info' | 'success' | 'warning' | 'error' | 'debug'
  /** 日志消息 */
  message: string
  /** 详细信息 */
  details?: any
  /** 是否展开 */
  expanded?: boolean
}

/**
 * 任务状态接口
 */
export interface TaskState {
  /** 任务ID */
  id: string
  /** 任务名称 */
  name: string
  /** 任务描述 */
  description?: string
  /** 任务状态 */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  /** 当前步骤 */
  currentStep: number
  /** 总步骤数 */
  totalSteps: number
  /** 进度百分比 */
  progress: number
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 总耗时 */
  duration: number
  /** 错误信息 */
  error?: string
  /** 执行日志 */
  logs: TaskLog[]
}

/**
 * 任务状态消息接口
 */
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

/**
 * 错误诊断助手类
 */
class ErrorDiagnosisAssistant {
  /**
   * 诊断错误类型和提供解决方案
   */
  diagnose(error: Error, context?: any) {
    const message = error.message.toLowerCase()
    let type = 'unknown'
    let solutions: string[] = []

    // 元素定位错误
    if (message.includes('timeout') || message.includes('not found')) {
      type = 'element_not_found'
      solutions = [
        '检查元素选择器是否正确',
        '增加等待时间，等待页面加载完成',
        '使用更稳定的元素定位策略',
      ]
    }
    // 网络错误
    else if (message.includes('network') || message.includes('connection')) {
      type = 'network_error'
      solutions = [
        '检查网络连接是否正常',
        '确认目标URL是否可访问',
        '增加请求超时时间',
      ]
    }
    // 权限错误
    else if (message.includes('permission') || message.includes('auth')) {
      type = 'permission_error'
      solutions = [
        '检查是否有足够的权限执行操作',
        '确认用户是否已登录',
        '检查页面权限设置',
      ]
    }
    // 其他错误
    else {
      solutions = [
        '查看详细错误日志',
        '尝试刷新页面后重新执行',
        '联系技术支持获取帮助',
      ]
    }

    return { type, solutions }
  }
}

/**
 * 任务执行状态管理 Composable
 */
export function useTaskExecution() {
  // WebSocket 客户端
  const wsClient = ref<WebSocketClient | null>(null)
  const connectionState = ref<ConnectionState>(ConnectionState.DISCONNECTED)

  // 任务状态
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

  // 错误诊断助手
  const errorAssistant = new ErrorDiagnosisAssistant()

  // 是否正在执行
  const isExecuting = computed(() => currentTask.status === 'running')

  // 是否已完成
  const isCompleted = computed(() =>
    currentTask.status === 'completed' || currentTask.status === 'failed'
  )

  // 是否有错误
  const hasError = computed(() => currentTask.status === 'failed')

  // 格式化的耗时
  const formattedDuration = computed(() => {
    const duration = currentTask.duration
    if (duration < 1000) {
      return `${duration}ms`
    } else if (duration < 60000) {
      return `${(duration / 1000).toFixed(1)}s`
    } else {
      const minutes = Math.floor(duration / 60000)
      const seconds = ((duration % 60000) / 1000).toFixed(0)
      return `${minutes}m ${seconds}s`
    }
  })

  // 进度条颜色
  const progressColor = computed(() => {
    if (hasError.value) return 'bg-red-500'
    if (isCompleted.value) return 'bg-green-500'
    return 'bg-blue-500'
  })

  /**
   * 初始化 WebSocket 连接
   */
  const initializeWebSocket = () => {
    console.log('🔌 初始化 WebSocket 客户端')

    try {
      wsClient.value = new WebSocketClient()

      // 设置事件监听
      setupWebSocketListeners()

      // 连接到服务器
      wsClient.value.connect()
    } catch (error) {
      console.warn('⚠️ WebSocket 初始化失败（可能在渲染进程环境）:', error)
    }
  }

  /**
   * 设置 WebSocket 事件监听器
   */
  const setupWebSocketListeners = () => {
    if (!wsClient.value) return

    // 连接状态变化
    wsClient.value.on('connection:state', ({ newState }: any) => {
      connectionState.value = newState
      console.log(`📡 连接状态: ${newState}`)

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

    // 接收任务分配
    wsClient.value.on('task:assigned', (data: any) => {
      console.log('📋 收到任务分配:', data)
      startTask(data)
    })

    // 接收任务状态更新
    wsClient.value.on('task:updated', (data: TaskStatusMessage) => {
      console.log('📊 收到任务状态更新:', data)
      updateTaskStatus(data)
    })

    // 接收服务器消息
    wsClient.value.on('server:message', (data: any) => {
      console.log('📨 收到服务器消息:', data)
      addLog('info', data.message || '服务器消息', data)
    })
  }

  /**
   * 开始任务
   * @param taskData 任务数据
   */
  const startTask = (taskData: any) => {
    console.log('🚀 开始任务:', taskData)

    // 清空之前的日志数据
    currentTask.logs = []

    // 重置任务状态
    Object.assign(currentTask, {
      id: taskData.taskId || taskData.id,
      name: taskData.name || '未命名任务',
      description: taskData.description,
      status: 'running',
      currentStep: 0,
      totalSteps: taskData.totalSteps || 0,
      progress: 0,
      startTime: Date.now(),
      duration: 0,
      endTime: undefined,
      error: undefined,
    })

    addLog('info', `🆕 开始执行新任务: ${currentTask.name}`)
    addLog('info', `任务ID: ${currentTask.id}`)
  }

  /**
   * 更新任务状态
   * @param statusMessage 状态消息
   */
  const updateTaskStatus = (statusMessage: TaskStatusMessage) => {
    if (statusMessage.taskId !== currentTask.id) return

    // 更新基本信息
    currentTask.status = statusMessage.status
    currentTask.currentStep = statusMessage.currentStep || currentTask.currentStep
    currentTask.totalSteps = statusMessage.totalSteps || currentTask.totalSteps
    currentTask.progress = statusMessage.progress || calculateProgress()
    currentTask.duration = Date.now() - currentTask.startTime

    // 检查是否完成
    if (statusMessage.status === 'completed' || statusMessage.status === 'failed') {
      currentTask.endTime = Date.now()
      currentTask.duration = currentTask.endTime - currentTask.startTime
    }

    // 处理步骤结果
    if (statusMessage.stepResult) {
      handleStepResult(statusMessage.stepResult)
    }
  }

  /**
   * 处理步骤结果
   * @param stepResult 步骤结果
   */
  const handleStepResult = (stepResult: any) => {
    const { stepId, status, duration, error } = stepResult

    if (status === 'success') {
      addLog('success', `步骤 ${stepId} 完成 (耗时: ${duration}ms)`)
    } else if (status === 'failed') {
      addLog('error', `步骤 ${stepId} 失败: ${error}`)

      // 使用错误诊断助手分析错误
      if (error) {
        const errorObj = new Error(error)
        const diagnosis = errorAssistant.diagnose(errorObj, {
          taskId: currentTask.id,
          stepId,
        })

        // 添加诊断信息到日志
        addLog('warning', `错误类型: ${diagnosis.type}`)
        addLog('info', `建议解决方案:`, diagnosis.solutions.slice(0, 2))
      }
    }
  }

  /**
   * 计算进度百分比
   * @returns 进度百分比
   */
  const calculateProgress = (): number => {
    if (currentTask.totalSteps === 0) return 0
    return Math.round((currentTask.currentStep / currentTask.totalSteps) * 100)
  }

  /**
   * 添加日志
   * @param level 日志级别
   * @param message 日志消息
   * @param details 详细信息
   */
  const addLog = (level: TaskLog['level'], message: string, details?: any) => {
    const log: TaskLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      message,
      details,
      expanded: false,
    }

    currentTask.logs.push(log)

    // 自动滚动到最新日志
    scrollToLatestLog()
  }

  /**
   * 滚动到最新日志
   */
  const scrollToLatestLog = () => {
    // 使用 nextTick 确保 DOM 更新后再滚动
    nextTick(() => {
      setTimeout(() => {
        // 确保在浏览器环境中运行
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          const logContainer = document.querySelector('.log-container')
          if (logContainer && typeof logContainer.scrollTop === 'number') {
            logContainer.scrollTop = logContainer.scrollHeight
          }
        }
      }, 100)
    })
  }

  /**
   * 切换日志展开状态
   * @param logId 日志ID
   */
  const toggleLogExpand = (logId: string) => {
    const log = currentTask.logs.find(l => l.id === logId)
    if (log) {
      log.expanded = !log.expanded
    }
  }

  /**
   * 清空日志
   */
  const clearLogs = () => {
    currentTask.logs = []
    addLog('info', '日志已清空')
  }

  /**
   * 取消任务
   */
  const cancelTask = () => {
    if (!currentTask.id || currentTask.status !== 'running') return

    if (wsClient.value) {
      // 使用通用的send方法发送取消任务的消息
      wsClient.value.send('task:cancel', {
        taskId: currentTask.id,
        reason: '用户取消',
      })
    }

    currentTask.status = 'cancelled'
    currentTask.endTime = Date.now()
    currentTask.duration = currentTask.endTime - currentTask.startTime

    addLog('warning', '任务已取消')
  }

  /**
   * 重置任务状态
   */
  const resetTask = () => {
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
  }

  /**
   * 获取错误诊断
   * @param errorMessage 错误消息
   * @returns 诊断结果
   */
  const getErrorDiagnosis = (errorMessage: string) => {
    const error = new Error(errorMessage)
    return errorAssistant.diagnose(error)
  }

  /**
   * 组件挂载时的初始化
   */
  onMounted(() => {
    // Try WebSocket connection, fall back to IPC from main process
    initializeWebSocket()

    // Listen for IPC messages from main process
    try {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('task:assigned', (_event: any, data: any) => {
        console.log('📋 [IPC] 收到任务分配:', data)
        startTask(data)
      })
      ipcRenderer.on('task:start', (_event: any, data: any) => {
        console.log('🚀 [IPC] 收到任务开始:', data)
        startTask(data)
      })
      ipcRenderer.on('step:complete', (_event: any, data: any) => {
        console.log('✅ [IPC] 步骤完成:', data)
      })
      ipcRenderer.on('step:failed', (_event: any, data: any) => {
        console.log('❌ [IPC] 步骤失败:', data)
      })
      ipcRenderer.on('task:status:update', (_event: any, data: any) => {
        console.log('📊 [IPC] 任务状态更新:', data)
        if (data.taskId) updateTaskStatus(data)
      })
      ipcRenderer.on('task:completed:update', (_event: any, data: any) => {
        console.log('✅ [IPC] 任务完成:', data)
        Object.assign(currentTask, { status: 'completed' })
      })
      ipcRenderer.on('task:failed:update', (_event: any, data: any) => {
        console.log('❌ [IPC] 任务失败:', data)
        Object.assign(currentTask, { status: 'failed', error: data.error })
      })
      connectionState.value = ConnectionState.CONNECTED
      console.log('📡 IPC 监听器已设置')
    } catch (e) {
      console.warn('⚠️ IPC 不可用:', e)
    }
  })

  /**
   * 组件卸载时的清理
   */
  onUnmounted(() => {
    if (wsClient.value) {
      wsClient.value.disconnect()
      wsClient.value = null
    }
  })

  return {
    // 状态
    currentTask,
    connectionState,
    wsClient,

    // 计算属性
    isExecuting,
    isCompleted,
    hasError,
    formattedDuration,
    progressColor,

    // 方法
    startTask,
    cancelTask,
    resetTask,
    clearLogs,
    toggleLogExpand,
    getErrorDiagnosis,

    // 日志方法
    addLog,
  }
}

/**
 * 导出类型定义
 */
// 类型已在前面定义并导出，无需重复导出
