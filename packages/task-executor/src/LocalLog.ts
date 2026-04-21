/**
 * 本地日志系统
 */

export class LocalLog {
  private logs: any[] = []

  /**
   * 添加日志
   */
  add(level: string, message: string, data?: any) {
    this.logs.push({
      timestamp: Date.now(),
      level,
      message,
      data
    })
  }

  /**
   * 获取所有日志
   */
  getAll() {
    return this.logs
  }

  /**
   * 清空日志
   */
  clear() {
    this.logs = []
  }

  /**
   * 导出日志
   */
  export() {
    return JSON.stringify(this.logs, null, 2)
  }
}