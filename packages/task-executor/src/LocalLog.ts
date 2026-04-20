/**
 * 本地离线日志
 *
 * 功能：
 * 1. JSON 文件存储历史记录
 * 2. 支持按时间、状态、任务 ID 搜索
 * 3. 日志持久化
 */

import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export interface LogEntry {
  id: string
  timestamp: number
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  data?: any
  taskId?: string
  stepId?: string
}

export interface TaskLog {
  taskId: string
  taskName: string
  startTime: number
  endTime?: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  logs: LogEntry[]
  results?: any
}

export class LocalLog {
  private logsDir: string
  private tasks: Map<string, TaskLog> = new Map()
  private currentTaskId: string | null = null

  constructor(logsDir?: string) {
    this.logsDir = logsDir || join(process.env.APPDATA || '', 'auto-test-agent', 'logs')
    this.init()
  }

  /**
   * 初始化日志目录
   */
  private async init(): Promise<void> {
    if (!existsSync(this.logsDir)) {
      await mkdir(this.logsDir, { recursive: true })
    }
  }

  /**
   * 开始任务日志
   */
  startTask(taskId: string, taskName: string): void {
    this.currentTaskId = taskId

    const taskLog: TaskLog = {
      taskId,
      taskName,
      startTime: Date.now(),
      status: 'running',
      logs: [],
    }

    this.tasks.set(taskId, taskLog)
    this.info(taskId, `任务开始: ${taskName}`)
  }

  /**
   * 结束任务日志
   */
  endTask(taskId: string, status: 'completed' | 'failed', results?: any): void {
    const taskLog = this.tasks.get(taskId)
    if (!taskLog) return

    taskLog.endTime = Date.now()
    taskLog.status = status
    if (results) {
      taskLog.results = results
    }

    this.info(taskId, `任务结束: ${status}`)
    this.saveTask(taskId)
  }

  /**
   * 记录信息日志
   */
  info(message: string, taskId?: string, data?: any): void {
    this.addLog('info', message, taskId, data)
  }

  /**
   * 记录警告日志
   */
  warn(message: string, taskId?: string, data?: any): void {
    this.addLog('warn', message, taskId, data)
  }

  /**
   * 记录错误日志
   */
  error(message: string, taskId?: string, data?: any): void {
    this.addLog('error', message, taskId, data)
  }

  /**
   * 记录调试日志
   */
  debug(message: string, taskId?: string, data?: any): void {
    this.addLog('debug', message, taskId, data)
  }

  /**
   * 添加日志
   */
  private addLog(level: LogEntry['level'], message: string, taskId?: string, data?: any): void {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      message,
      data,
      taskId: taskId || this.currentTaskId || undefined,
    }

    // 如果指定了 taskId，添加到对应任务
    if (entry.taskId) {
      const taskLog = this.tasks.get(entry.taskId)
      if (taskLog) {
        taskLog.logs.push(entry)
      }
    }

    // 同时输出到控制台
    const consoleMessage = `[${new Date(entry.timestamp).toISOString()}] [${level.toUpperCase()}] ${message}`
    switch (level) {
      case 'info':
        console.log(consoleMessage)
        break
      case 'warn':
        console.warn(consoleMessage)
        break
      case 'error':
        console.error(consoleMessage)
        break
      case 'debug':
        console.debug(consoleMessage)
        break
    }
  }

  /**
   * 保存任务日志
   */
  async saveTask(taskId: string): Promise<void> {
    const taskLog = this.tasks.get(taskId)
    if (!taskLog) return

    const filename = `${taskId}.json`
    const filepath = join(this.logsDir, filename)

    try {
      await writeFile(filepath, JSON.stringify(taskLog, null, 2), 'utf-8')
      console.log(`✅ 任务日志已保存: ${filepath}`)
    } catch (error) {
      console.error(`❌ 保存任务日志失败:`, error)
    }
  }

  /**
   * 加载任务日志
   */
  async loadTask(taskId: string): Promise<TaskLog | null> {
    const filename = `${taskId}.json`
    const filepath = join(this.logsDir, filename)

    if (!existsSync(filepath)) {
      return null
    }

    try {
      const content = await readFile(filepath, 'utf-8')
      const taskLog = JSON.parse(content) as TaskLog
      this.tasks.set(taskId, taskLog)
      return taskLog
    } catch (error) {
      console.error(`❌ 加载任务日志失败:`, error)
      return null
    }
  }

  /**
   * 获取任务日志
   */
  getTaskLog(taskId: string): TaskLog | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): TaskLog[] {
    return Array.from(this.tasks.values()).sort((a, b) => b.startTime - a.startTime)
  }

  /**
   * 按状态搜索任务
   */
  searchByStatus(status: TaskLog['status']): TaskLog[] {
    return this.getAllTasks().filter((task) => task.status === status)
  }

  /**
   * 按时间范围搜索任务
   */
  searchByTimeRange(startTime: number, endTime: number): TaskLog[] {
    return this.getAllTasks().filter(
      (task) => task.startTime >= startTime && task.startTime <= endTime
    )
  }

  /**
   * 按关键词搜索
   */
  searchByKeyword(keyword: string): TaskLog[] {
    const lowerKeyword = keyword.toLowerCase()
    return this.getAllTasks().filter((task) => {
      return (
        task.taskName.toLowerCase().includes(lowerKeyword) ||
        task.logs.some((log) => log.message.toLowerCase().includes(lowerKeyword))
      )
    })
  }

  /**
   * 获取任务统计
   */
  getStatistics(): {
    total: number
    pending: number
    running: number
    completed: number
    failed: number
    avgDuration: number
  } {
    const tasks = this.getAllTasks()

    const total = tasks.length
    const pending = tasks.filter((t) => t.status === 'pending').length
    const running = tasks.filter((t) => t.status === 'running').length
    const completed = tasks.filter((t) => t.status === 'completed').length
    const failed = tasks.filter((t) => t.status === 'failed').length

    // 计算平均耗时
    const completedTasks = tasks.filter((t) => t.endTime)
    const avgDuration =
      completedTasks.length > 0
        ? completedTasks.reduce((sum, task) => sum + (task.endTime! - task.startTime), 0) /
          completedTasks.length
        : 0

    return {
      total,
      pending,
      running,
      completed,
      failed,
      avgDuration,
    }
  }

  /**
   * 清理过期日志
   */
  async cleanup(daysToKeep: number = 30): Promise<void> {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000
    const tasks = this.getAllTasks()

    let cleaned = 0
    for (const task of tasks) {
      if (task.startTime < cutoffTime) {
        const filename = `${task.taskId}.json`
        const filepath = join(this.logsDir, filename)

        try {
          // TODO: 删除文件
          this.tasks.delete(task.taskId)
          cleaned++
        } catch (error) {
          console.error(`清理日志失败: ${task.taskId}`, error)
        }
      }
    }

    console.log(`✅ 清理了 ${cleaned} 个过期日志`)
  }

  /**
   * 导出为 CSV
   */
  async exportToCsv(taskId: string, filepath: string): Promise<void> {
    const taskLog = this.tasks.get(taskId)
    if (!taskLog) {
      throw new Error('任务不存在')
    }

    const csvHeader = 'Timestamp,Level,Message,StepId\n'
    const csvRows = taskLog.logs
      .map((log) => {
        return [
          new Date(log.timestamp).toISOString(),
          log.level,
          `"${log.message.replace(/"/g, '""')}"`,
          log.stepId || '',
        ].join(',')
      })
      .join('\n')

    const csv = csvHeader + csvRows
    await writeFile(filepath, csv, 'utf-8')
    console.log(`✅ CSV 日志已导出: ${filepath}`)
  }

  /**
   * 导出为 JSON
   */
  async exportToJson(taskId: string, filepath: string): Promise<void> {
    const taskLog = this.tasks.get(taskId)
    if (!taskLog) {
      throw new Error('任务不存在')
    }

    await writeFile(filepath, JSON.stringify(taskLog, null, 2), 'utf-8')
    console.log(`✅ JSON 日志已导出: ${filepath}`)
  }

  /**
   * 清除所有日志
   */
  clear(): void {
    this.tasks.clear()
    console.log('🗑️  所有日志已清除')
  }
}
