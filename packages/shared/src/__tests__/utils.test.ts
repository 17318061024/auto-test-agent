/**
 * 共享工具函数测试
 */

import { formatDuration, generateId, delay, safeJsonParse } from '../utils'

describe('Utils', () => {
  describe('formatDuration', () => {
    it('should format milliseconds correctly', () => {
      expect(formatDuration(500)).toBe('500ms')
      expect(formatDuration(1500)).toBe('1.5s')
      expect(formatDuration(65000)).toBe('1m 5s')
      expect(formatDuration(125000)).toBe('2m 5s')
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId('test')
      const id2 = generateId('test')
      expect(id1).not.toBe(id2)
    })

    it('should use provided prefix', () => {
      const id = generateId('custom')
      expect(id.startsWith('custom_')).toBe(true)
    })
  })

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse('{"key":"value"}', {})
      expect(result).toEqual({ key: 'value' })
    })

    it('should return default value for invalid JSON', () => {
      const result = safeJsonParse('invalid json', { default: true })
      expect(result).toEqual({ default: true })
    })
  })

  describe('delay', () => {
    it('should delay execution', async () => {
      const start = Date.now()
      await delay(100)
      const end = Date.now()
      expect(end - start).toBeGreaterThanOrEqual(100)
    })
  })
})