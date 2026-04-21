/**
 * Jest配置文件
 * 用于单元测试和集成测试
 */

module.exports = {
  // 测试环境
  testEnvironment: 'node',

  // 测试文件匹配模式
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.spec.ts'
  ],

  // 转换配置
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },

  // 模块路径映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@auto-test-agent/shared$': '<rootDir>/../shared/src'
  },

  // 覆盖率收集配置
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/types/**'
  ],

  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // 覆盖率报告格式
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],

  // 超时时间
  testTimeout: 60000,

  // 并发执行
  maxWorkers: '50%',

  // 详细输出
  verbose: true,

  // 清除模拟
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // 全局设置文件
  // setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  // 忽略的文件和目录
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],

  // 模块文件扩展名
  moduleFileExtensions: [
    'ts',
    'js',
    'json'
  ],

  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }
  }
}
