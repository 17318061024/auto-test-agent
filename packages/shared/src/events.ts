/**
 * WebSocket 事件定义
 */

export const WSEvents = {
  // 客户端注册
  CLIENT_REGISTER: 'client:register',

  // 心跳
  HEARTBEAT: 'heartbeat',

  // 任务相关
  TASK_ASSIGNED: 'task:assigned',
  TASK_STARTED: 'task:started',
  TASK_PROGRESS: 'task:progress',
  TASK_COMPLETED: 'task:completed',
  TASK_FAILED: 'task:failed',
  TASK_CANCELLED: 'task:cancelled',

  // 步骤相关
  STEP_STARTED: 'step:started',
  STEP_COMPLETED: 'step:completed',
  STEP_FAILED: 'step:failed',

  // 日志相关
  LOG: 'log',

  // 截图相关
  SCREENSHOT: 'screenshot',

  // 错误相关
  ERROR: 'error'
} as const

export type WSEventType = typeof WSEvents[keyof typeof WSEvents]
