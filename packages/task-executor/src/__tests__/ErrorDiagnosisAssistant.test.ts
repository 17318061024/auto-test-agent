/**
 * 错误诊断助手测试
 */

import { ErrorDiagnosisAssistant, ErrorType, ErrorSeverity } from '../ErrorDiagnosisAssistant'

describe('ErrorDiagnosisAssistant', () => {
  let assistant: ErrorDiagnosisAssistant

  beforeEach(() => {
    assistant = new ErrorDiagnosisAssistant()
  })

  describe('diagnose', () => {
    it('should diagnose element not found errors', () => {
      const error = new Error('element not found: #submit-button')
      const diagnosis = assistant.diagnose(error)

      expect(diagnosis.type).toBe(ErrorType.ELEMENT_NOT_FOUND)
      expect(diagnosis.severity).toBe(ErrorSeverity.HIGH)
      expect(diagnosis.summary).toContain('元素未找到')
    })

    it('should diagnose network timeout errors', () => {
      const error = new Error('timeout exceeded: 30000ms')
      const diagnosis = assistant.diagnose(error)

      expect(diagnosis.type).toBe(ErrorType.NETWORK_TIMEOUT)
      expect(diagnosis.severity).toBe(ErrorSeverity.MEDIUM)
    })

    it('should diagnose unknown errors', () => {
      const error = new Error('xyzabc foobar unknown issue')
      const diagnosis = assistant.diagnose(error)

      expect(diagnosis.type).toBe(ErrorType.UNKNOWN)
      expect(diagnosis.solutions.length).toBeGreaterThan(0)
    })
  })

  describe('getErrorStatistics', () => {
    it('should track error statistics', () => {
      const error1 = new Error('element not found')
      const error2 = new Error('element not found')
      const error3 = new Error('timeout exceeded')

      assistant.diagnose(error1)
      assistant.diagnose(error2)
      assistant.diagnose(error3)

      const stats = assistant.getErrorStatistics()
      expect(stats.totalErrors).toBe(3)
      expect(stats.errorsByType[ErrorType.ELEMENT_NOT_FOUND]).toBe(2)
      expect(stats.errorsByType[ErrorType.NETWORK_TIMEOUT]).toBe(1)
    })
  })

  describe('clearHistory', () => {
    it('should clear error history', () => {
      const error = new Error('test error')
      assistant.diagnose(error)

      expect(assistant.getErrorStatistics().totalErrors).toBe(1)

      assistant.clearHistory()
      expect(assistant.getErrorStatistics().totalErrors).toBe(0)
    })
  })
})