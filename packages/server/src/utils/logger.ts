/**
 * 统一日志系统
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  error?: Error
}

class Logger {
  private logLevel: LogLevel
  private isDevelopment: boolean

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
    return levels.indexOf(level) >= levels.indexOf(this.logLevel)
  }

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`

    if (context) {
      logMessage += ` ${JSON.stringify(context)}`
    }

    if (error) {
      logMessage += `\n${error.stack || error.message}`
    }

    return logMessage
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return
    }

    const formattedMessage = this.formatMessage(entry)

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage)
        break
      case LogLevel.INFO:
        console.info(formattedMessage)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage)
        break
    }

    // 在开发环境中，可以在这里添加文件日志或发送到日志服务
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log({
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date().toISOString(),
      context,
    })
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log({
      level: LogLevel.INFO,
      message,
      timestamp: new Date().toISOString(),
      context,
    })
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log({
      level: LogLevel.WARN,
      message,
      timestamp: new Date().toISOString(),
      context,
    })
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log({
      level: LogLevel.ERROR,
      message,
      timestamp: new Date().toISOString(),
      error,
      context,
    })
  }

  // 便捷方法：任务执行相关
  taskStart(taskId: string, taskName: string): void {
    this.info(`任务开始执行: ${taskName} (${taskId})`)
  }

  taskProgress(taskId: string, step: number, total: number, action: string): void {
    this.info(`任务进度: ${taskId} - 步骤 ${step}/${total}: ${action}`)
  }

  taskComplete(taskId: string, duration: number): void {
    this.info(`任务执行完成: ${taskId} - 耗时: ${duration}ms`)
  }

  taskFail(taskId: string, error: Error): void {
    this.error(`任务执行失败: ${taskId}`, error)
  }

  // 便捷方法：客户端相关
  clientConnect(clientId: string): void {
    this.info(`客户端连接: ${clientId}`)
  }

  clientDisconnect(clientId: string): void {
    this.info(`客户端断开: ${clientId}`)
  }

  clientRegister(clientId: string, clientInfo: Record<string, unknown>): void {
    this.info(`客户端注册: ${clientId}`, clientInfo)
  }
}

// 导出单例
export const logger = new Logger()

// 导出类型
export type { LogEntry }
