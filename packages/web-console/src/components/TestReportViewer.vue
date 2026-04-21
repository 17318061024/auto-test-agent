<template>
  <div class="test-report-viewer">
    <div class="header">
      <h2>📊 测试报告</h2>
      <div class="actions">
        <button @click="exportReport" class="btn btn-primary">
          📥 导出报告
        </button>
        <button @click="closeReport" class="btn btn-secondary">
          ✖️ 关闭
        </button>
      </div>
    </div>

    <!-- 执行摘要 -->
    <div class="section summary-section">
      <h3>📈 执行摘要</h3>
      <div class="summary-cards">
        <div class="summary-card" :class="getSummaryCardClass(report.status)">
          <div class="card-icon">{{ getStatusIcon(report.status) }}</div>
          <div class="card-content">
            <div class="card-label">执行状态</div>
            <div class="card-value">{{ getStatusText(report.status) }}</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon">⏱️</div>
          <div class="card-content">
            <div class="card-label">总耗时</div>
            <div class="card-value">{{ formatDuration(report.duration) }}</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon">✅</div>
          <div class="card-content">
            <div class="card-label">成功率</div>
            <div class="card-value">{{ report.successRate }}%</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon">🔄</div>
          <div class="card-content">
            <div class="card-label">重试次数</div>
            <div class="card-value">{{ report.totalRetries }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤详情 -->
    <div class="section steps-section">
      <h3>📋 步骤详情</h3>
      <div class="steps-list">
        <div
          v-for="(step, index) in report.steps"
          :key="index"
          class="step-item"
          :class="getStepClass(step.status)"
        >
          <div class="step-header">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-info">
              <div class="step-action">{{ step.action }}</div>
              <div class="step-description">{{ step.description || '无描述' }}</div>
            </div>
            <div class="step-status">
              <span :class="['status-badge', step.status]">
                {{ getStatusText(step.status) }}
              </span>
            </div>
            <div class="step-duration">{{ step.duration }}ms</div>
            <button
              @click="toggleStepDetail(index)"
              class="btn-toggle"
              :class="{ expanded: step.expanded }"
            >
              ▼
            </button>
          </div>

          <!-- 步骤详情（展开时显示） -->
          <div v-if="step.expanded" class="step-detail">
            <!-- 参数信息 -->
            <div v-if="step.params" class="detail-section">
              <h4>📝 参数</h4>
              <pre class="code-block">{{ JSON.stringify(step.params, null, 2) }}</pre>
            </div>

            <!-- 错误信息 -->
            <div v-if="step.error" class="detail-section error-section">
              <h4>❌ 错误信息</h4>
              <div class="error-message">{{ step.error }}</div>
              <div v-if="step.stack" class="error-stack">
                <h5>堆栈跟踪</h5>
                <pre class="code-block">{{ step.stack }}</pre>
              </div>
            </div>

            <!-- 截图 -->
            <div v-if="step.screenshots && step.screenshots.length > 0" class="detail-section">
              <h4>📸 截图</h4>
              <div class="screenshots-grid">
                <div
                  v-for="(screenshot, idx) in step.screenshots"
                  :key="idx"
                  class="screenshot-item"
                >
                  <div class="screenshot-label">{{ screenshot.label }}</div>
                  <img
                    :src="screenshot.path"
                    :alt="screenshot.label"
                    @click="viewScreenshot(screenshot)"
                  >
                </div>
              </div>
            </div>

            <!-- 日志 -->
            <div v-if="step.logs && step.logs.length > 0" class="detail-section">
              <h4>📜 日志</h4>
              <div class="logs-list">
                <div
                  v-for="(log, logIdx) in step.logs"
                  :key="logIdx"
                  class="log-item"
                  :class="log.level"
                >
                  <span class="log-time">{{ log.timestamp }}</span>
                  <span class="log-level">[{{ log.level }}]</span>
                  <span class="log-message">{{ log.message }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能分析 -->
    <div class="section performance-section">
      <h3>⚡ 性能分析</h3>
      <div class="performance-charts">
        <!-- 执行时间分布 -->
        <div class="chart-container">
          <h4>执行时间分布</h4>
          <div class="time-distribution-chart">
            <div class="chart-bar">
              <div class="bar-label">浏览器启动</div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{
                    width: getTimePercentage(report.performance.browserLaunchTime) + '%'
                  }"
                >
                  {{ report.performance.browserLaunchTime }}ms
                </div>
              </div>
            </div>
            <div class="chart-bar">
              <div class="bar-label">页面加载</div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{
                    width: getTimePercentage(report.performance.totalPageLoadTime) + '%'
                  }"
                >
                  {{ report.performance.totalPageLoadTime }}ms
                </div>
              </div>
            </div>
            <div class="chart-bar">
              <div class="bar-label">元素操作</div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{
                    width: getTimePercentage(report.performance.totalActionTime) + '%'
                  }"
                >
                  {{ report.performance.totalActionTime }}ms
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤耗时排名 -->
        <div class="chart-container">
          <h4>最慢的5个步骤</h4>
          <div class="slowest-steps">
            <div
              v-for="(step, index) in getSlowestSteps()"
              :key="index"
              class="slowest-step-item"
            >
              <div class="step-rank">{{ index + 1 }}</div>
              <div class="step-name">{{ step.action }}</div>
              <div class="step-time">{{ step.duration }}ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误分析 -->
    <div v-if="report.errors && report.errors.length > 0" class="section error-analysis-section">
      <h3>🔍 错误分析</h3>
      <div class="error-analysis-list">
        <div
          v-for="(error, index) in report.errors"
          :key="index"
          class="error-analysis-item"
        >
          <div class="error-header">
            <div class="error-type">{{ error.type }}</div>
            <div class="error-count">出现 {{ error.count }} 次</div>
          </div>
          <div class="error-message">{{ error.message }}</div>
          <div v-if="error.solutions && error.solutions.length > 0" class="error-solutions">
            <h5>💡 建议解决方案</h5>
            <ul>
              <li v-for="(solution, idx) in error.solutions" :key="idx">
                {{ solution }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 元数据 -->
    <div class="section metadata-section">
      <h3>ℹ️ 元数据</h3>
      <div class="metadata-grid">
        <div class="metadata-item">
          <span class="metadata-label">任务ID</span>
          <span class="metadata-value">{{ report.taskId }}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">执行时间</span>
          <span class="metadata-value">{{ formatTimestamp(report.startTime) }}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">客户端</span>
          <span class="metadata-value">{{ report.clientInfo }}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">浏览器</span>
          <span class="metadata-value">{{ report.browserInfo }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

/**
 * 测试报告接口
 */
interface TestReport {
  taskId: string
  name: string
  status: 'success' | 'failed' | 'partial'
  duration: number
  successRate: number
  totalRetries: number
  startTime: number
  endTime: number
  clientInfo: string
  browserInfo: string
  performance: {
    browserLaunchTime: number
    totalPageLoadTime: number
    totalActionTime: number
  }
  steps: TestStep[]
  errors?: TestError[]
}

/**
 * 测试步骤接口
 */
interface TestStep {
  action: string
  description?: string
  status: 'success' | 'failed'
  duration: number
  params?: any
  error?: string
  stack?: string
  screenshots?: Array<{
    label: string
    path: string
  }>
  logs?: Array<{
    timestamp: string
    level: string
    message: string
  }>
  expanded?: boolean
}

/**
 * 测试错误接口
 */
interface TestError {
  type: string
  count: number
  message: string
  solutions?: string[]
}

// Props
const props = defineProps<{
  report: TestReport
}>()

// Emits
const emit = defineEmits<{
  close: []
  export: []
}>()

/**
 * 获取状态图标
 */
const getStatusIcon = (status: string) => {
  const icons = {
    success: '✅',
    failed: '❌',
    partial: '⚠️',
  }
  return icons[status] || '❓'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const texts = {
    success: '成功',
    failed: '失败',
    partial: '部分成功',
  }
  return texts[status] || '未知'
}

/**
 * 获取摘要卡片样式类
 */
const getSummaryCardClass = (status: string) => {
  return `status-${status}`
}

/**
 * 获取步骤样式类
 */
const getStepClass = (status: string) => {
  return `step-${status}`
}

/**
 * 格式化持续时间
 */
const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}m ${seconds}s`
}

/**
 * 格式化时间戳
 */
const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

/**
 * 切换步骤详情展开状态
 */
const toggleStepDetail = (index: number) => {
  props.report.steps[index].expanded = !props.report.steps[index].expanded
}

/**
 * 查看截图
 */
const viewScreenshot = (screenshot: any) => {
  window.open(screenshot.path, '_blank')
}

/**
 * 获取时间百分比
 */
const getTimePercentage = (time: number) => {
  const total = props.report.performance.browserLaunchTime +
                props.report.performance.totalPageLoadTime +
                props.report.performance.totalActionTime
  return total > 0 ? (time / total) * 100 : 0
}

/**
 * 获取最慢的5个步骤
 */
const getSlowestSteps = () => {
  return [...props.report.steps]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5)
}

/**
 * 导出报告
 */
const exportReport = () => {
  emit('export')
}

/**
 * 关闭报告
 */
const closeReport = () => {
  emit('close')
}
</script>

<style scoped>
.test-report-viewer {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 10px;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
}

.btn-secondary {
  background: #757575;
  color: white;
}

.btn-secondary:hover {
  background: #616161;
}

/* 摘要卡片 */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.summary-card.status-success {
  background: #e8f5e9;
  border-color: #4caf50;
}

.summary-card.status-failed {
  background: #ffebee;
  border-color: #f44336;
}

.summary-card.status-partial {
  background: #fff3e0;
  border-color: #ff9800;
}

.card-icon {
  font-size: 32px;
}

.card-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.card-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

/* 步骤列表 */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step-item {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.step-item.step-success {
  border-left: 4px solid #4caf50;
}

.step-item.step-failed {
  border-left: 4px solid #f44336;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f9f9f9;
  cursor: pointer;
  transition: background 0.2s;
}

.step-header:hover {
  background: #f0f0f0;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #2196f3;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-info {
  flex: 1;
}

.step-action {
  font-weight: 600;
  color: #333;
}

.step-description {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.success {
  background: #e8f5e9;
  color: #4caf50;
}

.status-badge.failed {
  background: #ffebee;
  color: #f44336;
}

.step-duration {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.btn-toggle {
  width: 24px;
  height: 24px;
  border: none;
  background: #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle.expanded {
  transform: rotate(180deg);
}

/* 步骤详情 */
.step-detail {
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
}

.error-section {
  background: #ffebee;
  padding: 15px;
  border-radius: 4px;
}

.error-message {
  color: #c62828;
  margin-bottom: 10px;
}

.error-stack h5 {
  margin: 10px 0 5px 0;
  font-size: 12px;
  color: #333;
}

/* 截图网格 */
.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.screenshot-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.screenshot-label {
  background: #f5f5f5;
  padding: 8px;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.screenshot-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
}

.screenshot-item img:hover {
  transform: scale(1.05);
}

/* 日志列表 */
.logs-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.log-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.log-item.info {
  background: #e3f2fd;
  color: #1976d2;
}

.log-item.error {
  background: #ffebee;
  color: #c62828;
}

.log-item.warn {
  background: #fff3e0;
  color: #ef6c00;
}

.log-time {
  color: #666;
  flex-shrink: 0;
}

.log-level {
  font-weight: bold;
  flex-shrink: 0;
}

/* 性能图表 */
.performance-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-container h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.time-distribution-chart {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chart-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-label {
  width: 80px;
  font-size: 12px;
  color: #666;
}

.bar-track {
  flex: 1;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 24px;
  background: linear-gradient(90deg, #2196f3, #1976d2);
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  transition: width 0.5s ease;
}

.slowest-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slowest-step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.step-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f44336;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.step-name {
  flex: 1;
  font-size: 13px;
  color: #333;
}

.step-time {
  font-weight: bold;
  color: #f44336;
}

/* 错误分析 */
.error-analysis-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.error-analysis-item {
  border: 1px solid #ffcdd2;
  border-radius: 6px;
  padding: 15px;
  background: #ffebee;
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.error-type {
  font-weight: bold;
  color: #c62828;
}

.error-count {
  background: #c62828;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.error-message {
  color: #333;
  margin-bottom: 10px;
}

.error-solutions h5 {
  margin: 10px 0 5px 0;
  font-size: 13px;
  color: #333;
}

.error-solutions ul {
  margin: 0;
  padding-left: 20px;
}

.error-solutions li {
  color: #666;
  margin-bottom: 4px;
}

/* 元数据 */
.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.metadata-label {
  font-weight: 500;
  color: #666;
}

.metadata-value {
  color: #333;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }

  .performance-charts {
    grid-template-columns: 1fr;
  }

  .metadata-grid {
    grid-template-columns: 1fr;
  }
}
</style>
