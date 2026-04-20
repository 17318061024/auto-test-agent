/**
 * 错误恢复策略
 */

// 简单的延迟函数
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type RecoveryStrategy = 'retry' | 'wait' | 'refresh' | 'skip'

export interface RecoveryConfig {
  maxRetries: number
  retryDelay: number
  strategies: RecoveryStrategy[]
}

export class ErrorRecovery {
  private config: RecoveryConfig

  constructor(config?: Partial<RecoveryConfig>) {
    this.config = {
      maxRetries: 3,
      retryDelay: 2000,
      strategies: ['wait', 'retry'],
      ...config,
    }
  }

  /**
   * 尝试恢复错误
   */
  async recover<T>(
    fn: () => Promise<T>,
    context: { attempt: number; error: Error }
  ): Promise<T | null> {
    const { strategies, retryDelay } = this.config
    const { attempt, error } = context

    // 尝试每种恢复策略
    for (const strategy of strategies) {
      try {
        console.log(`尝试恢复策略: ${strategy} (第 ${attempt} 次尝试)`)

        switch (strategy) {
          case 'wait':
            await delay(retryDelay)
            break

          case 'retry':
            // 直接重试，不做额外操作
            break

          case 'refresh':
            // TODO: 实现页面刷新逻辑
            console.log('刷新页面')
            break

          case 'skip':
            console.log('跳过此步骤')
            return null
        }

        // 尝试重新执行
        return await fn()
      } catch (err) {
        console.log(`恢复策略 ${strategy} 失败:`, err)
        continue
      }
    }

    // 所有策略都失败
    throw error
  }

  /**
   * 分析错误类型并提供建议
   */
  analyzeError(error: Error): {
    type: string
    suggestion: string
    canRecover: boolean
  } {
    const message = error.message.toLowerCase()

    // 元素未找到
    if (message.includes('element') && (message.includes('not found') || message.includes('not visible'))) {
      return {
        type: 'ELEMENT_NOT_FOUND',
        suggestion: '元素未找到或不可见。建议：1) 等待页面加载完成 2) 检查选择器是否正确 3) 尝试使用其他选择器',
        canRecover: true,
      }
    }

    // 网络错误
    if (message.includes('network') || message.includes('timeout')) {
      return {
        type: 'NETWORK_ERROR',
        suggestion: '网络错误或超时。建议：1) 检查网络连接 2) 增加超时时间 3) 刷新页面重试',
        canRecover: true,
      }
    }

    // 页面崩溃
    if (message.includes('crash') || message.includes('gone')) {
      return {
        type: 'PAGE_CRASH',
        suggestion: '页面崩溃或关闭。建议：1) 重新打开页面 2) 检查是否有内存泄漏',
        canRecover: false,
      }
    }

    // 默认错误
    return {
      type: 'UNKNOWN',
      suggestion: `未知错误: ${error.message}`,
      canRecover: false,
    }
  }

  /**
   * 获取恢复建议
   */
  getSuggestion(error: Error): string {
    const analysis = this.analyzeError(error)
    return analysis.suggestion
  }

  /**
   * 判断错误是否可以恢复
   */
  canRecover(error: Error): boolean {
    const analysis = this.analyzeError(error)
    return analysis.canRecover
  }
}
