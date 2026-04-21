/**
 * @auto-test-agent/task-executor
 *
 * 错误诊断助手 (Error Diagnosis Assistant)
 * 智能分析和诊断任务执行错误，提供详细的解决方案和优化建议
 *
 * 主要功能：
 * - 错误类型识别和分类
 * - 根本原因分析
 * - 智能解决方案推荐
 * - 预防性建议生成
 * - 错误趋势分析
 */

/**
 * 错误类型枚举
 */
export enum ErrorType {
  /** 元素未找到 */
  ELEMENT_NOT_FOUND = 'element_not_found',
  /** 网络超时 */
  NETWORK_TIMEOUT = 'network_timeout',
  /** 页面加载失败 */
  PAGE_LOAD_FAILED = 'page_load_failed',
  /** 断言失败 */
  ASSERTION_FAILED = 'assertion_failed',
  /** JavaScript错误 */
  JAVASCRIPT_ERROR = 'javascript_error',
  /** 权限错误 */
  PERMISSION_DENIED = 'permission_denied',
  /** 资源不可用 */
  RESOURCE_UNAVAILABLE = 'resource_unavailable',
  /** 未知错误 */
  UNKNOWN = 'unknown',
}

/**
 * 错误严重程度枚举
 */
export enum ErrorSeverity {
  /** 低 - 警告级别，不影响继续执行 */
  LOW = 'low',
  /** 中 - 影响当前步骤，但有绕过方案 */
  MEDIUM = 'medium',
  /** 高 - 阻止任务执行，需要立即处理 */
  HIGH = 'high',
  /** 严重 - 系统级别错误，可能需要重启 */
  CRITICAL = 'critical',
}

/**
 * 错误诊断结果接口
 */
export interface ErrorDiagnosis {
  /** 错误类型 */
  type: ErrorType
  /** 错误严重程度 */
  severity: ErrorSeverity
  /** 错误摘要 */
  summary: string
  /** 详细描述 */
  description: string
  /** 可能的原因 */
  possibleCauses: string[]
  /** 解决方案 */
  solutions: Solution[]
  /** 预防措施 */
  preventions: string[]
  /** 相关文档链接 */
  references: string[]
}

/**
 * 解决方案接口
 */
export interface Solution {
  /** 解决方案标题 */
  title: string
  /** 详细步骤 */
  steps: string[]
  /** 预期效果 */
  expectedOutcome: string
  /** 难度级别 */
  difficulty: 'easy' | 'medium' | 'hard'
  /** 是否需要人工干预 */
  requiresManualIntervention: boolean
}

/**
 * 错误统计信息接口
 */
export interface ErrorStatistics {
  /** 总错误次数 */
  totalErrors: number
  /** 按类型分组的错误 */
  errorsByType: Record<ErrorType, number>
  /** 按严重程度分组的错误 */
  errorsBySeverity: Record<ErrorSeverity, number>
  /** 最常见的错误 */
  mostCommonErrors: Array<{
    type: ErrorType
    count: number
    lastOccurrence: number
  }>
}

/**
 * 错误模式匹配规则接口
 */
interface ErrorPattern {
  /** 错误类型 */
  type: ErrorType
  /** 匹配模式（正则表达式） */
  patterns: RegExp[]
  /** 严重程度 */
  severity: ErrorSeverity
  /** 关键词 */
  keywords: string[]
}

/**
 * 错误诊断助手类
 */
export class ErrorDiagnosisAssistant {
  /** 错误历史记录 */
  private errorHistory: Array<{
    error: Error
    diagnosis: ErrorDiagnosis
    timestamp: number
  }> = []

  /** 错误模式匹配规则 */
  private errorPatterns: ErrorPattern[] = [
    {
      type: ErrorType.ELEMENT_NOT_FOUND,
      patterns: [
        /element.*not found/i,
        /cannot find element/i,
        /no element matching/i,
        /selector.*not found/i,
        /failed to find element/i,
      ],
      severity: ErrorSeverity.HIGH,
      keywords: ['element', 'selector', 'find', 'locate'],
    },
    {
      type: ErrorType.NETWORK_TIMEOUT,
      patterns: [
        /timeout.*exceeded/i,
        /network.*timeout/i,
        /request.*timeout/i,
        /connection.*timeout/i,
        /navigation.*timeout/i,
      ],
      severity: ErrorSeverity.MEDIUM,
      keywords: ['timeout', 'network', 'connection', 'slow'],
    },
    {
      type: ErrorType.PAGE_LOAD_FAILED,
      patterns: [
        /page.*load.*failed/i,
        /navigation.*failed/i,
        /cannot load.*page/i,
        /failed to navigate/i,
      ],
      severity: ErrorSeverity.HIGH,
      keywords: ['page', 'load', 'navigation', 'url'],
    },
    {
      type: ErrorType.ASSERTION_FAILED,
      patterns: [
        /assertion.*failed/i,
        /expected.*but.*found/i,
        /assert.*failed/i,
        /expect.*to be/i,
      ],
      severity: ErrorSeverity.MEDIUM,
      keywords: ['assertion', 'expect', 'should', 'match'],
    },
    {
      type: ErrorType.JAVASCRIPT_ERROR,
      patterns: [
        /javascript.*error/i,
        /uncaught.*exception/i,
        /script.*error/i,
        /runtime.*error/i,
      ],
      severity: ErrorSeverity.HIGH,
      keywords: ['javascript', 'exception', 'runtime', 'script'],
    },
    {
      type: ErrorType.PERMISSION_DENIED,
      patterns: [
        /permission.*denied/i,
        /access.*denied/i,
        /not.*allowed/i,
        /unauthorized/i,
      ],
      severity: ErrorSeverity.MEDIUM,
      keywords: ['permission', 'access', 'denied', 'unauthorized'],
    },
    {
      type: ErrorType.RESOURCE_UNAVAILABLE,
      patterns: [
        /resource.*not.*available/i,
        /failed to.*resource/i,
        /cannot.*access/i,
        /unavailable/i,
      ],
      severity: ErrorSeverity.MEDIUM,
      keywords: ['resource', 'unavailable', 'access', 'missing'],
    },
  ]

  /**
   * 诊断错误
   * @param error 错误对象
   * @param context 上下文信息
   * @returns 诊断结果
   */
  diagnose(error: Error, context?: Record<string, any>): ErrorDiagnosis {
    console.log('🔍 开始诊断错误:', error.message)

    // 识别错误类型
    const errorType = this.identifyErrorType(error)
    console.log(`📊 错误类型: ${errorType}`)

    // 确定严重程度
    const severity = this.determineSeverity(error, errorType)
    console.log(`⚠️  严重程度: ${severity}`)

    // 生成诊断结果
    const diagnosis: ErrorDiagnosis = {
      type: errorType,
      severity,
      summary: this.generateSummary(error, errorType),
      description: this.generateDescription(error, errorType),
      possibleCauses: this.analyzeCauses(error, errorType, context),
      solutions: this.generateSolutions(error, errorType, context),
      preventions: this.generatePreventions(errorType),
      references: this.getReferences(errorType),
    }

    // 记录到历史
    this.errorHistory.push({
      error,
      diagnosis,
      timestamp: Date.now(),
    })

    return diagnosis
  }

  /**
   * 识别错误类型
   * @param error 错误对象
   * @returns 错误类型
   */
  private identifyErrorType(error: Error): ErrorType {
    const errorMessage = error.message.toLowerCase()
    const errorStack = error.stack?.toLowerCase() || ''

    // 遍历所有错误模式
    for (const pattern of this.errorPatterns) {
      // 检查错误消息
      for (const regex of pattern.patterns) {
        if (regex.test(errorMessage) || regex.test(errorStack)) {
          return pattern.type
        }
      }

      // 检查关键词
      if (pattern.keywords.some(keyword => errorMessage.includes(keyword))) {
        return pattern.type
      }
    }

    return ErrorType.UNKNOWN
  }

  /**
   * 确定错误严重程度
   * @param error 错误对象
   * @param errorType 错误类型
   * @returns 严重程度
   */
  private determineSeverity(error: Error, errorType: ErrorType): ErrorSeverity {
    // 从错误模式中获取基础严重程度
    const pattern = this.errorPatterns.find(p => p.type === errorType)
    let severity = pattern?.severity || ErrorSeverity.MEDIUM

    // 根据错误消息中的关键词调整严重程度
    const errorMessage = error.message.toLowerCase()

    if (errorMessage.includes('critical') || errorMessage.includes('fatal')) {
      severity = ErrorSeverity.CRITICAL
    } else if (errorMessage.includes('warning') || errorMessage.includes('minor')) {
      severity = ErrorSeverity.LOW
    }

    return severity
  }

  /**
   * 生成错误摘要
   * @param error 错误对象
   * @param errorType 错误类型
   * @returns 错误摘要
   */
  private generateSummary(error: Error, errorType: ErrorType): string {
    const typeNames = {
      [ErrorType.ELEMENT_NOT_FOUND]: '元素未找到',
      [ErrorType.NETWORK_TIMEOUT]: '网络超时',
      [ErrorType.PAGE_LOAD_FAILED]: '页面加载失败',
      [ErrorType.ASSERTION_FAILED]: '断言失败',
      [ErrorType.JAVASCRIPT_ERROR]: 'JavaScript错误',
      [ErrorType.PERMISSION_DENIED]: '权限被拒绝',
      [ErrorType.RESOURCE_UNAVAILABLE]: '资源不可用',
      [ErrorType.UNKNOWN]: '未知错误',
    }

    return `${typeNames[errorType]}: ${error.message.substring(0, 100)}`
  }

  /**
   * 生成详细描述
   * @param error 错误对象
   * @param errorType 错误类型
   * @returns 详细描述
   */
  private generateDescription(error: Error, errorType: ErrorType): string {
    const descriptions: Record<ErrorType, string> = {
      [ErrorType.ELEMENT_NOT_FOUND]: '系统无法在页面上定位到指定的元素，可能是选择器不正确、元素尚未加载或页面结构发生变化。',
      [ErrorType.NETWORK_TIMEOUT]: '网络请求超过了预设的时间限制，可能是网络连接不稳定、服务器响应缓慢或页面资源过大。',
      [ErrorType.PAGE_LOAD_FAILED]: '页面无法正常加载，可能是URL错误、网络问题或服务器错误导致。',
      [ErrorType.ASSERTION_FAILED]: '页面状态检查失败，实际结果与预期结果不符。',
      [ErrorType.JAVASCRIPT_ERROR]: '页面中发生了JavaScript错误，可能影响了页面功能或元素定位。',
      [ErrorType.PERMISSION_DENIED]: '操作因权限不足而被拒绝，可能需要用户授权或调整浏览器设置。',
      [ErrorType.RESOURCE_UNAVAILABLE]: '所需的资源无法访问，可能是资源不存在、网络问题或权限问题。',
      [ErrorType.UNKNOWN]: '发生了未预期的错误，需要进一步调查。',
    }

    return descriptions[errorType] || '发生了错误，请查看详细信息。'
  }

  /**
   * 分析可能的原因
   * @param error 错误对象
   * @param errorType 错误类型
   * @param context 上下文信息
   * @returns 可能原因列表
   */
  private analyzeCauses(
    error: Error,
    errorType: ErrorType,
    context?: Record<string, any>
  ): string[] {
    const commonCauses: Record<ErrorType, string[]> = {
      [ErrorType.ELEMENT_NOT_FOUND]: [
        '选择器表达式不正确或过于严格',
        '页面加载不完整，元素尚未渲染',
        '页面结构发生变化，元素位置改变',
        '元素位于iframe中，需要切换上下文',
        '元素被隐藏或display:none',
        '页面正在动态加载，需要等待',
      ],
      [ErrorType.NETWORK_TIMEOUT]: [
        '网络连接不稳定或速度较慢',
        '服务器响应时间过长',
        '页面资源（图片、脚本）过大',
        '防火墙或代理设置问题',
        'DNS解析延迟',
        '并发请求过多导致拥堵',
      ],
      [ErrorType.PAGE_LOAD_FAILED]: [
        'URL地址不正确或不存在',
        '网络连接问题',
        '服务器宕机或维护中',
        'SSL证书问题',
        '被防火墙或安全软件阻止',
      ],
      [ErrorType.ASSERTION_FAILED]: [
        '页面内容与预期不符',
        '时序问题，检查时机不对',
        '数据源发生变化',
        '测试用例或预期设置错误',
        '国际化或本地化导致内容差异',
      ],
      [ErrorType.JAVASCRIPT_ERROR]: [
        '页面代码存在bug',
        '浏览器兼容性问题',
        '第三方库冲突',
        '内存泄漏导致页面异常',
        'API版本不匹配',
      ],
      [ErrorType.PERMISSION_DENIED]: [
        '需要用户授权但被拒绝',
        '浏览器安全策略限制',
        '跨域访问被阻止',
        '文件系统访问权限不足',
        '摄像头/麦克风等设备权限问题',
      ],
      [ErrorType.RESOURCE_UNAVAILABLE]: [
        '资源文件不存在或被删除',
        '服务器资源不可用',
        'CDN问题导致资源加载失败',
        '网络分区或连接问题',
        '资源路径配置错误',
      ],
      [ErrorType.UNKNOWN]: [
        '未知的系统错误',
        '多个错误同时发生',
        '环境配置问题',
        '第三方服务异常',
      ],
    }

    return commonCauses[errorType] || ['原因未知，需要进一步调查']
  }

  /**
   * 生成解决方案
   * @param error 错误对象
   * @param errorType 错误类型
   * @param context 上下文信息
   * @returns 解决方案列表
   */
  private generateSolutions(
    error: Error,
    errorType: ErrorType,
    context?: Record<string, any>
  ): Solution[] {
    const solutions: Solution[] = []

    switch (errorType) {
      case ErrorType.ELEMENT_NOT_FOUND:
        solutions.push(
          {
            title: '增加等待时间',
            steps: [
              '使用显式等待（waitForSelector）',
              '增加等待超时时间',
              '等待网络空闲状态',
            ],
            expectedOutcome: '给页面足够时间加载元素',
            difficulty: 'easy',
            requiresManualIntervention: false,
          },
          {
            title: '优化选择器',
            steps: [
              '检查选择器语法是否正确',
              '使用更稳定的选择器（如data属性）',
              '添加备用选择器',
              '使用相对定位而非绝对定位',
            ],
            expectedOutcome: '提高元素定位的成功率',
            difficulty: 'medium',
            requiresManualIntervention: true,
          },
          {
            title: '处理iframe',
            steps: [
              '检查元素是否在iframe中',
              '使用frameLocator切换到正确的iframe',
              '等待iframe加载完成',
            ],
            expectedOutcome: '正确访问iframe中的元素',
            difficulty: 'medium',
            requiresManualIntervention: false,
          }
        )
        break

      case ErrorType.NETWORK_TIMEOUT:
        solutions.push(
          {
            title: '增加超时时间',
            steps: [
              '将默认超时时间增加到60秒或更长',
              '为特定慢速操作设置单独的超时时间',
            ],
            expectedOutcome: '给网络请求更多时间完成',
            difficulty: 'easy',
            requiresManualIntervention: false,
          },
          {
            title: '检查网络连接',
            steps: [
              '测试网络速度和稳定性',
              '检查代理设置',
              '尝试刷新页面或重新连接',
            ],
            expectedOutcome: '解决网络相关问题',
            difficulty: 'easy',
            requiresManualIntervention: true,
          },
          {
            title: '优化页面加载',
            steps: [
              '等待网络空闲而非页面加载',
              '阻止不必要的资源加载',
              '使用缓存减少重复请求',
            ],
            expectedOutcome: '加快页面加载速度',
            difficulty: 'hard',
            requiresManualIntervention: false,
          }
        )
        break

      case ErrorType.PAGE_LOAD_FAILED:
        solutions.push(
          {
            title: '验证URL',
            steps: [
              '检查URL拼写是否正确',
              '确认URL协议（http/https）',
              '测试URL在浏览器中是否可访问',
            ],
            expectedOutcome: '使用正确的URL地址',
            difficulty: 'easy',
            requiresManualIntervention: true,
          },
          {
            title: '处理网络问题',
            steps: [
              '检查网络连接状态',
              '尝试刷新页面',
              '使用备用网络或VPN',
            ],
            expectedOutcome: '解决网络连接问题',
            difficulty: 'medium',
            requiresManualIntervention: true,
          }
        )
        break

      case ErrorType.ASSERTION_FAILED:
        solutions.push(
          {
            title: '更新预期值',
            steps: [
              '检查实际值与预期值的差异',
              '确认页面行为是否已改变',
              '更新测试用例中的预期值',
            ],
            expectedOutcome: '预期与实际结果匹配',
            difficulty: 'medium',
            requiresManualIntervention: true,
          },
          {
            title: '添加等待逻辑',
            steps: [
              '等待页面更新完成',
              '等待特定元素出现或消失',
              '添加合理的延迟时间',
            ],
            expectedOutcome: '在正确的时机执行断言',
            difficulty: 'easy',
            requiresManualIntervention: false,
          }
        )
        break

      default:
        solutions.push({
          title: '收集更多信息',
          steps: [
            '查看完整的错误堆栈',
            '检查浏览器控制台日志',
            '收集页面截图和视频',
            '记录页面状态信息',
          ],
          expectedOutcome: '获得更多诊断信息',
          difficulty: 'easy',
          requiresManualIntervention: false,
        })
    }

    return solutions
  }

  /**
   * 生成预防措施
   * @param errorType 错误类型
   * @returns 预防措施列表
   */
  private generatePreventions(errorType: ErrorType): string[] {
    const preventions: Record<ErrorType, string[]> = {
      [ErrorType.ELEMENT_NOT_FOUND]: [
        '使用data属性而非class或id作为选择器',
        '实现智能重试机制',
        '添加多个备用选择器',
        '使用相对定位策略',
      ],
      [ErrorType.NETWORK_TIMEOUT]: [
        '实现渐进式超时策略',
        '添加网络状态检查',
        '使用离线缓存机制',
        '优化资源加载顺序',
      ],
      [ErrorType.PAGE_LOAD_FAILED]: [
        '添加URL格式验证',
        '实现健康检查机制',
        '提供备用URL或镜像站',
        '使用CDN加速',
      ],
      [ErrorType.ASSERTION_FAILED]: [
        '使用更灵活的断言策略',
        '添加数据验证和清洗',
        '实现容错比较逻辑',
        '定期更新测试用例',
      ],
      [ErrorType.JAVASCRIPT_ERROR]: [
        '监控页面错误日志',
        '实现错误边界处理',
        '定期更新依赖库版本',
        '进行跨浏览器测试',
      ],
      [ErrorType.PERMISSION_DENIED]: [
        '提前请求必要权限',
        '提供清晰的权限说明',
        '实现优雅降级方案',
        '检查浏览器兼容性',
      ],
      [ErrorType.RESOURCE_UNAVAILABLE]: [
        '实现资源预加载',
        '添加资源健康检查',
        '使用备用资源源',
        '实现本地缓存机制',
      ],
      [ErrorType.UNKNOWN]: [
        '完善错误监控和日志',
        '建立错误分析流程',
        '定期进行系统健康检查',
        '保持系统和依赖更新',
      ],
    }

    return preventions[errorType] || ['记录错误模式并分析']
  }

  /**
   * 获取相关文档链接
   * @param errorType 错误类型
   * @returns 文档链接列表
   */
  private getReferences(errorType: ErrorType): string[] {
    const references: Record<ErrorType, string[]> = {
      [ErrorType.ELEMENT_NOT_FOUND]: [
        'https://playwright.dev/docs/selectors',
        'https://playwright.dev/docs/locators',
      ],
      [ErrorType.NETWORK_TIMEOUT]: [
        'https://playwright.dev/docs/network',
        'https://playwright.dev/docs/emulation',
      ],
      [ErrorType.PAGE_LOAD_FAILED]: [
        'https://playwright.dev/docs/navigation',
        'https://playwright.dev/docs/api/class-page',
      ],
      [ErrorType.ASSERTION_FAILED]: [
        'https://playwright.dev/docs/assertions',
        'https://playwright.dev/docs/test-assertions',
      ],
      [ErrorType.JAVASCRIPT_ERROR]: [
        'https://playwright.dev/docs/emulation',
        'https://developer.chrome.com/docs/devtools/console',
      ],
      [ErrorType.PERMISSION_DENIED]: [
        'https://playwright.dev/docs/emulation',
        'https://playwright.dev/docs/permission',
      ],
      [ErrorType.RESOURCE_UNAVAILABLE]: [
        'https://playwright.dev/docs/network',
        'https://playwright.dev/docs/api/class-route',
      ],
      [ErrorType.UNKNOWN]: [
        'https://playwright.dev/docs/troubleshooting',
        'https://github.com/microsoft/playwright/issues',
      ],
    }

    return references[errorType] || []
  }

  /**
   * 获取错误统计信息
   * @returns 错误统计信息
   */
  getErrorStatistics(): ErrorStatistics {
    const totalErrors = this.errorHistory.length
    const errorsByType: Record<ErrorType, number> = {} as any
    const errorsBySeverity: Record<ErrorSeverity, number> = {} as any

    // 初始化计数器
    Object.values(ErrorType).forEach(type => {
      errorsByType[type] = 0
    })
    Object.values(ErrorSeverity).forEach(severity => {
      errorsBySeverity[severity] = 0
    })

    // 统计错误
    this.errorHistory.forEach(({ diagnosis }) => {
      errorsByType[diagnosis.type]++
      errorsBySeverity[diagnosis.severity]++
    })

    // 计算最常见的错误
    const errorCounts = Object.entries(errorsByType).map(([type, count]) => ({
      type: type as ErrorType,
      count,
      lastOccurrence: this.getLastOccurrence(type as ErrorType),
    }))

    const mostCommonErrors = errorCounts
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalErrors,
      errorsByType,
      errorsBySeverity,
      mostCommonErrors,
    }
  }

  /**
   * 获取特定类型的最后一次发生时间
   * @param errorType 错误类型
   * @returns 最后一次发生时间
   */
  private getLastOccurrence(errorType: ErrorType): number {
    const filteredErrors = this.errorHistory
      .filter(({ diagnosis }) => diagnosis.type === errorType)
      .sort((a, b) => b.timestamp - a.timestamp)

    return filteredErrors.length > 0 ? filteredErrors[0].timestamp : 0
  }

  /**
   * 清除错误历史
   * @param beforeTime 清除指定时间之前的记录
   */
  clearHistory(beforeTime?: number): void {
    if (beforeTime) {
      this.errorHistory = this.errorHistory.filter(item => item.timestamp >= beforeTime)
      console.log(`🗑️  清除了 ${beforeTime} 之前的错误记录`)
    } else {
      this.errorHistory = []
      console.log('🗑️  清除了所有错误记录')
    }
  }

  /**
   * 生成错误报告
   * @returns 格式化的错误报告
   */
  generateReport(): string {
    const statistics = this.getErrorStatistics()
    const lines: string[] = []

    lines.push('╔════════════════════════════════════════════════════════════╗')
    lines.push('║                    错 误 诊 断 报 告                        ║')
    lines.push('╚════════════════════════════════════════════════════════════╝')
    lines.push('')
    lines.push(`📊 总错误次数: ${statistics.totalErrors}`)
    lines.push('')

    // 按类型统计
    lines.push('📈 错误类型分布:')
    Object.entries(statistics.errorsByType)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        const percentage = ((count / statistics.totalErrors) * 100).toFixed(1)
        lines.push(`  • ${type}: ${count} (${percentage}%)`)
      })
    lines.push('')

    // 按严重程度统计
    lines.push('⚠️  严重程度分布:')
    const severityIcons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    }
    Object.entries(statistics.errorsBySeverity)
      .filter(([, count]) => count > 0)
      .forEach(([severity, count]) => {
        const icon = severityIcons[severity as keyof typeof severityIcons] || '⚪'
        lines.push(`  ${icon} ${severity}: ${count}`)
      })
    lines.push('')

    // 最常见的错误
    if (statistics.mostCommonErrors.length > 0) {
      lines.push('🔥 最常见错误:')
      statistics.mostCommonErrors.forEach((item, index) => {
        const lastTime = item.lastOccurrence
          ? new Date(item.lastOccurrence).toLocaleString()
          : '无'
        lines.push(`  ${index + 1}. ${item.type}: ${item.count} 次 (最后发生: ${lastTime})`)
      })
      lines.push('')
    }

    // 建议
    if (statistics.totalErrors > 0) {
      lines.push('💡 建议:')
      lines.push('  1. 优先解决高频率和高严重程度的错误')
      lines.push('  2. 分析错误模式，找出根本原因')
      lines.push('  3. 实施预防措施，减少重复错误')
      lines.push('  4. 定期审查错误报告，优化测试策略')
    }

    return lines.join('\n')
  }
}

/**
 * 导出便捷函数
 */

/**
 * 诊断错误
 * @param error 错误对象
 * @param context 上下文信息
 * @returns 诊断结果
 */
export function diagnoseError(error: Error, context?: Record<string, any>): ErrorDiagnosis {
  const assistant = new ErrorDiagnosisAssistant()
  return assistant.diagnose(error, context)
}

/**
 * 创建全局错误诊断助手实例
 */
export const globalErrorDiagnosis = new ErrorDiagnosisAssistant()
