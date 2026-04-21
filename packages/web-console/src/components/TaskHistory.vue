<template>
  <div class="task-history">
    <div class="header">
      <h2>📜 任务历史</h2>
      <div class="actions">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索任务..."
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>
        <select v-model="statusFilter" class="filter-select">
          <option value="">全部状态</option>
          <option value="completed">已完成</option>
          <option value="failed">失败</option>
          <option value="running">运行中</option>
        </select>
        <button @click="exportHistory" class="btn btn-secondary">
          📥 导出历史
        </button>
        <button @click="refreshHistory" class="btn btn-primary">
          🔄 刷新
        </button>
      </div>
    </div>

    <!-- 统计摘要 -->
    <div class="summary-section">
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <div class="card-value">{{ totalTasks }}</div>
            <div class="card-label">总任务数</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon">✅</div>
          <div class="card-content">
            <div class="card-value">{{ completedTasks }}</div>
            <div class="card-label">已完成</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon">❌</div>
          <div class="card-content">
            <div class="card-value">{{ failedTasks }}</div>
            <div class="card-label">失败</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon">📈</div>
          <div class="card-content">
            <div class="card-value">{{ successRate }}%</div>
            <div class="card-label">成功率</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="tasks-section">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载任务历史...</p>
      </div>

      <div v-else-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>暂无任务记录</p>
        <button @click="refreshHistory" class="btn btn-primary">
          刷新列表
        </button>
      </div>

      <div v-else class="tasks-list">
        <div
          v-for="task in paginatedTasks"
          :key="task.id"
          class="task-item"
          :class="getTaskItemClass(task.status)"
        >
          <div class="task-header">
            <div class="task-info">
              <div class="task-title">{{ task.name }}</div>
              <div class="task-meta">
                <span class="task-id">ID: {{ task.id.substring(0, 8) }}</span>
                <span class="task-time">{{ formatTime(task.created) }}</span>
              </div>
            </div>
            <div class="task-status">
              <span :class="['status-badge', task.status]">
                {{ getStatusText(task.status) }}
              </span>
            </div>
          </div>

          <div class="task-details">
            <div class="task-stats">
              <div class="stat-item">
                <span class="stat-label">步骤</span>
                <span class="stat-value">{{ task.totalSteps || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">耗时</span>
                <span class="stat-value">{{ formatDuration(task.duration) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">成功率</span>
                <span class="stat-value">{{ task.successRate || 0 }}%</span>
              </div>
              <div v-if="task.retryCount > 0" class="stat-item">
                <span class="stat-label">重试</span>
                <span class="stat-value">{{ task.retryCount }}</span>
              </div>
            </div>

            <div class="task-actions">
              <button
                @click="viewReport(task)"
                class="btn-action btn-view"
                title="查看报告"
              >
                📊 报告
              </button>
              <button
                @click="rerunTask(task)"
                class="btn-action btn-rerun"
                title="重新执行"
              >
                🔄 重跑
              </button>
              <button
                @click="deleteTask(task.id)"
                class="btn-action btn-delete"
                title="删除记录"
              >
                🗑️ 删除
              </button>
            </div>
          </div>

          <!-- 错误信息 -->
          <div v-if="task.error" class="task-error">
            <div class="error-header">
              <span class="error-icon">⚠️</span>
              <span class="error-title">执行错误</span>
            </div>
            <div class="error-message">{{ task.error }}</div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          上一页
        </button>
        <div class="pagination-info">
          第 {{ currentPage }} / {{ totalPages }} 页
        </div>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 报告查看器 -->
    <TestReportViewer
      v-if="selectedTask"
      :report="selectedTask.report"
      @close="selectedTask = null"
      @export="exportReport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TestReportViewer from './TestReportViewer.vue'

/**
 * 历史任务接口
 */
interface HistoryTask {
  id: string
  name: string
  description?: string
  status: 'running' | 'completed' | 'failed'
  created: number
  duration: number
  totalSteps: number
  successRate: number
  retryCount: number
  error?: string
  report?: any
}

// 状态
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = 10
const selectedTask = ref<{ id: string; report: any } | null>(null)

// 模拟数据
const historyTasks = ref<HistoryTask[]>([])

// 计算属性
const filteredTasks = computed(() => {
  let filtered = historyTasks.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(task =>
      task.name.toLowerCase().includes(query) ||
      task.id.toLowerCase().includes(query)
    )
  }

  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(task => task.status === statusFilter.value)
  }

  // 按时间倒序排序
  return filtered.sort((a, b) => b.created - a.created)
})

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredTasks.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredTasks.value.length / pageSize)
})

const totalTasks = computed(() => filteredTasks.value.length)
const completedTasks = computed(() => filteredTasks.value.filter(t => t.status === 'completed').length)
const failedTasks = computed(() => filteredTasks.value.filter(t => t.status === 'failed').length)
const successRate = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((completedTasks.value / totalTasks.value) * 100)
})

// 方法
const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}m ${seconds}s`
}

const getStatusText = (status: string) => {
  const texts = {
    running: '运行中',
    completed: '已完成',
    failed: '失败',
  }
  return texts[status] || '未知'
}

const getTaskItemClass = (status: string) => {
  return `status-${status}`
}

const viewReport = (task: HistoryTask) => {
  // 生成报告数据
  if (!task.report) {
    // 如果没有报告数据，生成一个简单的报告
    task.report = {
      taskId: task.id,
      name: task.name,
      status: task.status === 'completed' ? 'success' : 'failed',
      duration: task.duration,
      successRate: task.successRate,
      totalRetries: task.retryCount,
      startTime: task.created,
      endTime: task.created + task.duration,
      clientInfo: 'Web Console',
      browserInfo: 'Chrome',
      performance: {
        browserLaunchTime: 0,
        totalPageLoadTime: 0,
        totalActionTime: 0,
      },
      steps: [],
      errors: task.error ? [{
        type: 'EXECUTION_ERROR',
        count: 1,
        message: task.error,
        solutions: ['查看详细日志', '检查配置参数', '联系技术支持'],
      }] : undefined,
      screenshots: [],
    }
  }

  selectedTask.value = {
    id: task.id,
    report: task.report,
  }
}

const rerunTask = (task: HistoryTask) => {
  // TODO: 实现重新执行任务的功能
  console.log('重新执行任务:', task.id)
  alert(`重新执行任务: ${task.name}`)
}

const deleteTask = (taskId: string) => {
  if (confirm('确定要删除这条任务记录吗？')) {
    const index = historyTasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) {
      historyTasks.value.splice(index, 1)
    }
  }
}

const exportHistory = () => {
  const data = {
    exportTime: new Date().toISOString(),
    totalTasks: filteredTasks.value.length,
    tasks: filteredTasks.value,
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `task_history_${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const exportReport = () => {
  if (selectedTask.value) {
    // 使用ReportService导出报告
    console.log('导出报告:', selectedTask.value.report)
  }
}

const refreshHistory = () => {
  loading.value = true
  // 模拟异步加载
  setTimeout(() => {
    loadMockData()
    loading.value = false
  }, 1000)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const loadMockData = () => {
  // 生成模拟数据
  const now = Date.now()
  const mockTasks: HistoryTask[] = []

  for (let i = 0; i < 25; i++) {
    const status = Math.random() > 0.3 ? 'completed' : 'failed'
    mockTasks.push({
      id: `task_${now}_${i}`,
      name: `测试任务 ${i + 1}`,
      description: `这是第 ${i + 1} 个测试任务的描述`,
      status,
      created: now - (i * 3600000), // 每个任务间隔1小时
      duration: Math.floor(Math.random() * 30000) + 5000, // 5-35秒
      totalSteps: Math.floor(Math.random() * 10) + 5, // 5-15步
      successRate: status === 'completed' ? 100 : Math.floor(Math.random() * 80),
      retryCount: Math.floor(Math.random() * 3),
      error: status === 'failed' ? '元素定位超时: #submit-button not found' : undefined,
    })
  }

  historyTasks.value = mockTasks
}

// 生命周期
onMounted(() => {
  loadMockData()
})
</script>

<style scoped>
.task-history {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  width: 250px;
}

.search-input {
  width: 100%;
  padding: 8px 35px 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
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
.summary-section {
  margin-bottom: 30px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.summary-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.card-icon {
  font-size: 32px;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.card-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

/* 任务列表 */
.tasks-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
}

.task-item {
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item:hover {
  background: #f9f9f9;
}

.task-item.status-completed {
  border-left: 4px solid #4caf50;
}

.task-item.status-failed {
  border-left: 4px solid #f44336;
}

.task-item.status-running {
  border-left: 4px solid #2196f3;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.task-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.task-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #666;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.completed {
  background: #e8f5e9;
  color: #4caf50;
}

.status-badge.failed {
  background: #ffebee;
  color: #f44336;
}

.status-badge.running {
  background: #e3f2fd;
  color: #2196f3;
}

.task-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px 15px;
}

.task-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 11px;
  color: #666;
  display: block;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-view:hover {
  background: #bbdefb;
}

.btn-rerun {
  background: #fff3e0;
  color: #f57c00;
}

.btn-rerun:hover {
  background: #ffe0b2;
}

.btn-delete {
  background: #ffebee;
  color: #c62828;
}

.btn-delete:hover {
  background: #ffcdd2;
}

/* 错误信息 */
.task-error {
  background: #ffebee;
  padding: 12px 20px;
  border-top: 1px solid #ffcdd2;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.error-icon {
  font-size: 16px;
}

.error-title {
  font-weight: 600;
  color: #c62828;
}

.error-message {
  color: #333;
  font-size: 14px;
  font-family: 'Courier New', monospace;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f5f5f5;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions {
    width: 100%;
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .task-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
</style>
