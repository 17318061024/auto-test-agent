/**
 * 错误恢复策略
 */

import { ErrorDiagnosisAssistant, ErrorType } from './ErrorDiagnosisAssistant'

export class ErrorRecovery {
  private diagnosisAssistant = new ErrorDiagnosisAssistant()

  /**
   * 恢复失败的步骤
   */
  async recoverFromError(error: Error, context: any): Promise<boolean> {
    const diagnosis = this.diagnosisAssistant.diagnose(error, context)

    // 根据错误类型采取不同的恢复策略
    switch (diagnosis.type) {
      case ErrorType.ELEMENT_NOT_FOUND:
        // 元素未找到：增加等待时间
        return true

      case ErrorType.NETWORK_TIMEOUT:
        // 网络错误：重试请求
        return true

      default:
        // 其他错误：记录日志
        return false
    }
  }

  /**
   * 获取重试策略
   */
  getRetryStrategy(error: Error): { retry: boolean; delay: number } {
    const diagnosis = this.diagnosisAssistant.diagnose(error)

    return {
      retry: diagnosis.type !== ErrorType.UNKNOWN,
      delay: 1000
    }
  }
}