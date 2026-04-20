/**
 * 任务状态
 */
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * 步骤状态
 */
export enum StepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

/**
 * 任务配置
 */
export interface TaskConfig {
  timeout?: number
  retries?: number
  headless?: boolean
}

/**
 * 任务步骤
 */
export interface TaskStep {
  id: string
  action: string
  params?: Record<string, unknown>
  description?: string
}

/**
 * 任务定义
 */
export interface Task {
  id: string
  name: string
  description?: string
  script: string
  steps?: TaskStep[]
  config: TaskConfig
  status: TaskStatus
  createdAt: number
  updatedAt: number
}

/**
 * 步骤执行结果
 */
export interface StepResult {
  stepId: string
  action: string
  status: StepStatus
  duration: number
  screenshot?: string
  error?: string
  timestamp: number
}

/**
 * 任务执行结果
 */
export interface TaskResult {
  taskId: string
  status: TaskStatus
  duration: number
  steps: StepResult[]
  error?: string
  startedAt: number
  completedAt?: number
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  browserLaunch: number
  pageLoad: number
  aiInference: number
  visualRender: number
  totalDuration: number
}

/**
 * 客户端信息
 */
export interface ClientInfo {
  id: string
  name: string
  version: string
  platform: string
  status: 'online' | 'offline'
  lastSeen: number
}

/**
 * WebSocket 事件类型
 */
export enum WSEventType {
  // 客户端 → 服务器
  CLIENT_REGISTER = 'client:register',
  CLIENT_HEARTBEAT = 'client:heartbeat',
  TASK_PROGRESS = 'task:progress',
  TASK_COMPLETED = 'task:completed',
  TASK_ERROR = 'task:error',

  // 服务器 → 客户端
  TASK_ASSIGNED = 'task:assigned',
  TASK_CANCEL = 'task:cancel',
  CLIENT_ACK = 'client:ack'
}

/**
 * WebSocket 消息
 */
export interface WSMessage<T = unknown> {
  type: WSEventType
  payload: T
  timestamp: number
}

/**
 * 任务进度消息
 */
export interface TaskProgressMessage {
  taskId: string
  currentStep: number
  totalSteps: number
  status: TaskStatus
  currentAction?: string
}

/**
 * 任务分配消息
 */
export interface TaskAssignedMessage {
  taskId: string
  script: string
  config: TaskConfig
}
