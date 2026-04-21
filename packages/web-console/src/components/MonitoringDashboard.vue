<template>
  <div class="monitoring-dashboard">
    <div class="dashboard-header">
      <h2>📊 实时监控仪表板</h2>
      <div class="header-actions">
        <div class="status-indicator">
          <div
            :class="[
              'status-dot',
              {
                'status-connected': wsState === 'connected',
                'status-disconnected': wsState === 'disconnected',
                'status-error': wsState === 'error'
              }
            ]"
          ></div>
          <span>{{ wsStateText }}</span>
        </div>
        <button
          @click="refreshData"
          class="btn btn-secondary"
        >
          🔄 刷新
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalTasks }}</div>
          <div class="stat-label">总任务数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🔄</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.runningTasks }}</div>
          <div class="stat-label">执行中</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-success">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.completedTasks }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-error">❌</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.failedTasks }}</div>
          <div class="stat-label">失败</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.avgDuration }}ms</div>
          <div class="stat-label">平均耗时</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💻</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.activeClients }}</div>
          <div class="stat-label">在线客户端</div>
        </div>
      </div>
    </div>

    <!-- 任务列表和实时日志 -->
    <div class="content-grid">
      <!-- 任务列表 -->
      <div class="task-list-card">
        <div class="card-header">
          <h3>📋 任务列表</h3>
          <div class="filters">
            <select
              v-model="filterStatus"
              class="filter-select"
            >
              <option value="all">全部状态</option>
              <option value="running">执行中</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
            </select>
          </div>
        </div>

        <div class="task-list">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="task-item"
            :class="`task-${task.status}`"
            @click="selectTask(task)"
          >
            <div class="task-header">
              <div class="task-info">
                <div class="task-name">{{ task.name }}</div>
                <div class="task-meta">
                  <span class="task-time">{{ formatTime(task.createdAt) }}</span>
                  <span
                    class="task-status"
                    :class="`status-badge-${task.status}`"
                  >
                    {{ getStatusText(task.status) }}
                  </span>
                </div>
              </div>
              <div class="task-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${task.progress}%` }"
                  ></div>
                </div>
                <span class="progress-text">{{ task.progress }}%</span>
              </div>
            </div>

            <!-- 实时步骤状态 -->
            <div v-if="task.status === 'running'" class="task-steps">
              <div
                v-for="(step, index) in task.steps"
                :key="index"
                class="step-status"
                :class="`step-${step.status}`"
              >
                <div class="step-indicator"></div>
                <span class="step-text">{{ index + 1 }}. {{ step.action }}</span>
                <span class="step-time">{{ step.duration }}ms</span>
              </div>
            </div>
          </div>

          <div v-if="filteredTasks.length === 0" class="empty-state">
            暂无任务数据
          </div>
        </div>
      </div>

      <!-- 实时日志 -->
      <div class="logs-card">
        <div class="card-header">
          <h3>📜 实时日志</h3>
          <div class="header-actions">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="autoScroll"
              >
              自动滚动
            </label>
            <button
              @click="clearLogs"
              class="btn btn-sm btn-secondary"
            >
              清空
            </button>
          </div>
        </div>

        <div ref="logsContainer" class="logs-container">
          <div
            v-for="(log, index) in logs"
            :key="index"
            class="log-entry"
            :class="`log-${log.level}`"
          >
            <span class="log-time">{{ log.timestamp }}</span>
            <span class="log-level">{{ log.level.toUpperCase() }}</span>
            <span class="log-source">{{ log.source }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>

          <div v-if="logs.length === 0" class="empty-state">
            等待日志输出...
          </div>
        </div>
      </div>
    </div>

    <!-- 性能图表 -->
    <div class="section">
      <div class="card-header">
        <h3>⚡ 性能分析</h3>
        <div class="time-range">
          <button
            v-for="range in timeRanges"
            :key="range.value"
            @click="selectTimeRange(range.value)"
            :class="[
              'time-range-btn',
              { active: selectedTimeRange === range.value }
            ]"
          >
            {{ range.label }}
          </button>
        </div>
      </div>

      <div class="performance-grid">
        <!-- 执行时间趋势图 -->
        <div class="chart-card">
          <h4>执行时间趋势</h4>
          <div class="chart-placeholder">
            <div class="trend-chart">
              <div
                v-for="(point, index) in executionTrend"
                :key="index"
                class="trend-point"
                :style="{
                  height: `${(point.duration / maxDuration) * 100}%`,
                  left: `${(index / executionTrend.length) * 100}%`
                }"
              >
              </div>
            </div>
          </div>
        </div>

        <!-- 状态分布图 -->
        <div class="chart-card">
          <h4>任务状态分布</h4>
          <div class="status-distribution">
            <div class="status-item">
              <div class="status-bar status-completed" :style="{ width: `${statusDistribution.completed}%` }"></div>
              <div class="status-info">
                <span>已完成: {{ statusDistribution.completed }}%</span>
                <span>{{ stats.completedTasks }}个</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-bar status-running" :style="{ width: `${statusDistribution.running}%` }"></div>
              <div class="status-info">
                <span>执行中: {{ statusDistribution.running }}%</span>
                <span>{{ stats.runningTasks }}个</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-bar status-failed" :style="{ width: `${statusDistribution.failed}%` }"></div>
              <div class="status-info">
                <span>失败: {{ statusDistribution.failed }}%</span>
                <span>{{ stats.failedTasks }}个</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 客户端状态 -->
    <div class="section">
      <h3>💻 客户端状态</h3>
      <div class="clients-grid">
        <div
          v-for="client in clients"
          :key="client.id"
          class="client-card"
        >
          <div class="client-header">
            <div class="client-info">
              <div class="client-name">{{ client.hostname }}</div>
              <div class="client-platform">{{ client.platform }}</div>
            </div>
            <div
              class="client-status"
              :class="`client-${client.status}`"
            >
              {{ client.status === 'online' ? '🟢' : '🔴' }}
            </div>
          </div>
          <div class="client-stats">
            <div class="client-stat">
              <span class="stat-label">任务:</span>
              <span class="stat-value">{{ client.tasksCompleted }}</span>
            </div>
            <div class="client-stat">
              <span class="stat-label">内存:</span>
              <span class="stat-value">{{ client.memoryUsage }}</span>
            </div>
            <div class="client-stat">
              <span class="stat-label">最后活动:</span>
              <span class="stat-value">{{ formatTime(client.lastActivity) }}</span>
            </div>
          </div>
        </div>

        <div v-if="clients.length === 0" class="empty-state">
          暂无客户端连接
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

/**
 * 任务接口
 */
interface Task {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  createdAt: number
  steps?: TaskStep[]
}

/**
 * 任务步骤接口
 */
interface TaskStep {
  action: string
  status: 'pending' | 'running' | 'success' | 'failed'
  duration: number
}

/**
 * 日志接口
 */
interface Log {
  level: 'info' | 'warn' | 'error'
  message: string
  timestamp: string
  source: string
}

/**
 * 客户端接口
 */
interface Client {
  id: string
  hostname: string
  platform: string
  status: 'online' | 'offline'
  tasksCompleted: number
  memoryUsage: string
  lastActivity: number
}

// WebSocket状态
const wsState = ref<'connected' | 'disconnected' | 'error'>('disconnected')
const wsStateText = computed(() => {
  const stateTexts = {
    connected: '已连接',
    disconnected: '未连接',
    error: '连接错误',
  }
  return stateTexts[wsState.value]
})

// 统计数据
const stats = ref({
  totalTasks: 0,
  runningTasks: 0,
  completedTasks: 0,
  failedTasks: 0,
  avgDuration: 0,
  activeClients: 0,
})

// 任务数据
const tasks = ref<Task[]>([])
const filterStatus = ref<string>('all')

// 日志数据
const logs = ref<Log[]>([])
const autoScroll = ref(true)
const logsContainer = ref<HTMLElement | null>(null)

// 客户端数据
const clients = ref<Client[]>([])

// 时间范围
const timeRanges = [
  { value: '1h', label: '1小时' },
  { value: '6h', label: '6小时' },
  { value: '24h', label: '24小时' },
  { value: '7d', label: '7天' },
]
const selectedTimeRange = ref('1h')

// 执行趋势数据
const executionTrend = ref<Array<{ duration: number; timestamp: number }>>([])
const maxDuration = ref(10000)

// 状态分布
const statusDistribution = computed(() => {
  const total = stats.value.totalTasks || 1
  return {
    completed: Math.round((stats.value.completedTasks / total) * 100),
    running: Math.round((stats.value.runningTasks / total) * 100),
    failed: Math.round((stats.value.failedTasks / total) * 100),
  }
})

// 过滤后的任务
const filteredTasks = computed(() => {
  if (filterStatus.value === 'all') {
    return tasks.value
  }
  return tasks.value.filter(task => task.status === filterStatus.value)
})

// 模拟数据更新
const updateStats = () => {
  // 模拟统计数据
  stats.value = {
    totalTasks: tasks.value.length,
    runningTasks: tasks.value.filter(t => t.status === 'running').length,
    completedTasks: tasks.value.filter(t => t.status === 'completed').length,
    failedTasks: tasks.value.filter(t => t.status === 'failed').length,
    avgDuration: 2340,
    activeClients: clients.value.filter(c => c.status === 'online').length,
  }
}

// 添加日志
const addLog = (level: 'info' | 'warn' | 'error', message: string, source: string = 'system') => {
  const log: Log = {
    level,
    message,
    timestamp: new Date().toLocaleTimeString(),
    source,
  }
  logs.value.push(log)

  // 自动滚动到底部
  if (autoScroll.value && logsContainer.value) {
    nextTick(() => {
      if (logsContainer.value) {
        logsContainer.value.scrollTop = logsContainer.value.scrollHeight
      }
    })
  }
}

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 24小时内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '等待中',
    running: '执行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

// 选择任务
const selectTask = (task: Task) => {
  console.log('选中任务:', task)
  // TODO: 显示任务详情
}

// 刷新数据
const refreshData = () => {
  console.log('🔄 刷新数据')
  addLog('info', '刷新数据...')
  // TODO: 从服务器获取最新数据
}

// 清空日志
const clearLogs = () => {
  logs.value = []
}

// 选择时间范围
const selectTimeRange = (range: string) => {
  selectedTimeRange.value = range
  addLog('info', `切换时间范围: ${range}`)
  // TODO: 根据时间范围筛选数据
}

// 定时更新
let updateTimer: NodeJS.Timeout | null = null

onMounted(() => {
  console.log('📊 监控仪表板已加载')

  // 模拟初始数据
  tasks.value = [
    {
      id: '1',
      name: 'Google搜索测试',
      status: 'running',
      progress: 65,
      createdAt: Date.now() - 300000,
      steps: [
        { action: 'goto', status: 'success', duration: 1200 },
        { action: 'fill', status: 'success', duration: 800 },
        { action: 'click', status: 'running', duration: 0 },
      ],
    },
    {
      id: '2',
      name: '表单提交测试',
      status: 'completed',
      progress: 100,
      createdAt: Date.now() - 600000,
      steps: [],
    },
    ]

  clients.value = [
    {
      id: 'client-1',
      hostname: 'DESKTOP-ABC123',
      platform: 'win32',
      status: 'online',
      tasksCompleted: 5,
      memoryUsage: '256 MB',
      lastActivity: Date.now() - 120000,
    },
  ]

  executionTrend.value = [
    { duration: 3200, timestamp: Date.now() - 3600000 },
    { duration: 2800, timestamp: Date.now() - 2400000 },
    { duration: 3500, timestamp: Date.now() - 1800000 },
    { duration: 2100, timestamp: Date.now() - 1200000 },
  ]

  maxDuration.value = Math.max(...executionTrend.value.map(p => p.duration))

  updateStats()

  // 定时更新数据
  updateTimer = setInterval(() => {
    // 模拟实时更新
    if (tasks.value.length > 0 && tasks.value[0].status === 'running') {
      tasks.value[0].progress = Math.min(tasks.value[0].progress + 5, 100)
    }
    updateStats()
  }, 3000)

  addLog('info', '监控仪表板已就绪')
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
})
</script>

<style scoped>
.monitoring-dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-connected {
  background: #4caf50;
}

.status-disconnected {
  background: #9e9e9e;
}

.status-error {
  background: #f44336;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 28px;
}

.stat-success {
  color: #4caf50;
}

.stat-error {
  color: #f44336;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #212121;
}

.stat-label {
  font-size: 12px;
  color: #757575;
}

/* 内容网格 */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

/* 卡片通用样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

/* 任务列表 */
.task-list-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.task-list {
  max-height: 400px;
  overflow-y: auto;
}

.task-item {
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.task-item:hover {
  background: #f0f0f0;
  border-color: #2196f3;
}

.task-running {
  border-left: 4px solid #2196f3;
}

.task-completed {
  border-left: 4px solid #4caf50;
}

.task-failed {
  border-left: 4px solid #f44336;
}

.task-header {
  margin-bottom: 10px;
}

.task-info {
  flex: 1;
}

.task-name {
  font-weight: 600;
  margin-bottom: 5px;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #757575;
}

.task-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge-running {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge-completed {
  background: #e8f5e9;
  color: #4caf50;
}

.status-badge-failed {
  background: #ffebee;
  color: #f44336;
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2196f3, #1976d2);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #757575;
  min-width: 40px;
  text-align: right;
}

/* 任务步骤 */
.task-steps {
  margin-top: 10px;
}

.step-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
}

.step-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.step-success .step-indicator {
  background: #4caf50;
}

.step-running .step-indicator {
  background: #2196f3;
  animation: pulse 1s infinite;
}

.step-failed .step-indicator {
  background: #f44336;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 日志卡片 */
.logs-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.logs-container {
  height: 400px;
  overflow-y: auto;
  background: #1e1e1e;
  border-radius: 4px;
  padding: 10px;
}

.log-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
}

.log-time {
  color: #757575;
  min-width: 80px;
}

.log-level {
  min-width: 50px;
  font-weight: 600;
}

.log-info {
  color: #4caf50;
}

.log-warn {
  color: #ff9800;
}

.log-error {
  color: #f44336;
}

.log-source {
  color: #2196f3;
  min-width: 80px;
}

.log-message {
  color: #e0e0e0;
  flex: 1;
}

/* 性能图表 */
.performance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
}

.chart-card h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: 600;
}

.chart-placeholder {
  height: 120px;
  background: #f9f9f9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trend-chart {
  width: 100%;
  height: 80px;
  display: flex;
  align-items: flex-end;
  gap: 5px;
}

.trend-point {
  flex: 1;
  background: #2196f3;
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease;
}

/* 状态分布 */
.status-distribution {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.status-bar {
  height: 20px;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.status-completed {
  background: linear-gradient(90deg, #4caf50, #66bb6a);
}

.status-running {
  background: linear-gradient(90deg, #2196f3, #42a5f5);
}

.status-failed {
  background: linear-gradient(90deg, #f44336, #ef5350);
}

.status-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

/* 客户端网格 */
.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.client-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
}

.client-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.client-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.client-platform {
  font-size: 12px;
  color: #757575;
}

.client-online {
  color: #4caf50;
}

.client-offline {
  color: #f44336;
}

.client-stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.client-stat {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

/* 通用按钮 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #757575;
  color: white;
}

.btn-secondary:hover {
  background: #616161;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

/* 筛选 */
.filter-select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

/* 时间范围选择器 */
.time-range {
  display: flex;
  gap: 5px;
}

.time-range-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.time-range-btn.active {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

/* 空状态 */
.empty-state {
  text-align: center;
  color: #9e9e9e;
  padding: 40px 20px;
  font-size: 14px;
}

/* 复选框 */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  cursor: pointer;
}

/* Section */
.section {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .performance-grid {
    grid-template-columns: 1fr;
  }
}
</style>
