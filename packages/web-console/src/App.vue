<template>
  <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
    <h1>🤖 auto-test-agent</h1>
    <p style="color: #666">自动化测试网页控制台</p>

    <div style="margin-top: 30px; display: grid; gap: 20px; grid-template-columns: 1fr 1fr">
      <!-- 左侧：任务选择 -->
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px">
        <h2>📋 Mock 任务</h2>

        <div v-if="selectedTask" style="margin-top: 20px">
          <h3>{{ selectedTask.name }}</h3>
          <p style="color: #666; font-size: 14px">{{ selectedTask.description }}</p>

          <div style="margin-top: 20px; background: #f5f5f5; padding: 15px; border-radius: 4px">
            <h4>执行步骤：</h4>
            <ol style="padding-left: 20px; margin: 10px 0">
              <li>打开百度首页</li>
              <li>AI视觉识别搜索框，输入"华为"</li>
              <li>AI视觉识别搜索按钮，点击</li>
              <li>AI视觉等待搜索结果出现</li>
            </ol>
          </div>

          <div style="display: flex; gap: 10px">
            <button
              @click="handleStart"
              :disabled="isLoading"
              :style="{
                padding: '12px 32px',
                fontSize: '16px',
                background: isLoading ? '#3a3a3a' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: isLoading ? '#666' : '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
                boxShadow: isLoading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                transform: isLoading ? 'none' : 'scale(1)',
                opacity: isLoading ? '0.6' : '1',
              }"
              @mouseenter="($event.target as HTMLElement).style.transform = isLoading ? 'none' : 'scale(1.05)'"
              @mouseleave="($event.target as HTMLElement).style.transform = 'scale(1)'"
            >
              {{ isLoading ? '执行中...' : 'START' }}
            </button>

            <button
              @click="handleClearLogs"
              :disabled="isLoading"
              :style="{
                padding: '12px 24px',
                fontSize: '16px',
                background: isLoading ? '#3a3a3a' : 'transparent',
                color: isLoading ? '#555' : '#aaa',
                border: isLoading ? '1px solid #333' : '1px solid #555',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                opacity: isLoading ? '0.5' : '1',
              }"
            >
              清空日志
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧：执行日志 -->
      <div
        :style="{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          ...(isFullscreen && {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            margin: 0,
            borderRadius: 0,
          }),
        }"
      >
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px">
          <h2 style="margin: 0">📊 执行日志</h2>
          <div style="display: flex; align-items: center; gap: 15px">
            <span style="font-size: 12px; color: #666">
              {{ logs.length }} 条日志
            </span>
            <button
              @click="toggleFullscreen"
              style="
                padding: 6px 12px;
                font-size: 14px;
                background: #2196f3;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 5px;
              "
              :title="isFullscreen ? '退出全屏' : '全屏显示'"
            >
              {{ isFullscreen ? '🔄 退出全屏' : '🖥️ 全屏' }}
            </button>
          </div>
        </div>
        <div
          :style="{
            marginTop: '20px',
            background: '#1e1e1e',
            padding: '15px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '13px',
            height: isFullscreen ? 'calc(100vh - 120px)' : '400px',
            overflowY: 'auto',
          }"
        >
          <div v-if="logs.length === 0" style="color: #666; text-align: center; padding: 20px">
            等待执行...
          </div>
          <div
            v-for="log in logs"
            :key="log.id"
            @click="log.type === 'error' && toggleLogExpand(log.id)"
            :style="{
              marginBottom: '8px',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: log.type === 'error' ? 'pointer' : 'default',
              border: log.type === 'error' ? '1px solid #f44336' : 'none',
              background: log.type === 'error' ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
              transition: 'all 0.2s',
            }"
          >
            <div style="display: flex; align-items: center; gap: 8px">
              <span
                :style="{
                  color:
                    log.type === 'success'
                      ? '#4caf50'
                      : log.type === 'error'
                      ? '#f44336'
                      : log.type === 'warning'
                      ? '#ff9800'
                      : log.type === 'process'
                      ? '#2196f3'
                      : '#00ff00',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }"
              >
                {{ log.type === 'error' ? '❌' : log.type === 'success' ? '✅' : log.type === 'warning' ? '⚠️ ' : 'ℹ️' }}
              </span>
              <span :style="{ color: log.type === 'error' ? '#ffcdd2' : '#00ff00', fontSize: '13px' }">
                {{ log.timestamp }}
              </span>
              <span :style="{ color: log.type === 'error' ? '#ffcdd2' : '#00ff00', fontSize: '13px', flex: 1 }">
                {{ log.message }}
              </span>
              <span v-if="log.type === 'error'" :style="{ color: '#ffcdd2', fontSize: '16px', fontWeight: 'bold' }">
                {{ log.expanded ? '▼' : '▶' }}
              </span>
            </div>

            <div
              v-if="log.type === 'error' && log.expanded && log.details"
              :style="{
                marginTop: '10px',
                padding: '12px',
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid #f44336',
                borderRadius: '4px',
              }"
            >
              <div style="color: #ffcdd2; margin-bottom: 8px; font-size: 13px; font-weight: bold">
                🔍 错误详情
              </div>
              <div v-if="log.details.error" style="margin-bottom: 8px">
                <div style="color: #ff8a80; font-size: 12px; margin-bottom: 4px">错误信息:</div>
                <div :style="{ color: '#ffcdd2', fontSize: '12px', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '2px' }">
                  {{ log.details.error }}
                </div>
              </div>
              <div v-if="log.details.stack" style="margin-bottom: 8px">
                <div style="color: #ff8a80; font-size: 12px; margin-bottom: 4px">堆栈信息:</div>
                <div :style="{ color: '#ffcdd2', fontSize: '11px', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '2px', maxHeight: '100px', overflow: 'auto', wordBreak: 'break-all' }">
                  {{ log.details.stack }}
                </div>
              </div>
              <div v-if="log.details.solution" style="margin-bottom: 8px">
                <div style="color: #81c784; font-size: 12px; margin-bottom: 4px">💡 解决方案:</div>
                <div :style="{ color: '#c8e6c9', fontSize: '12px', whiteSpace: 'pre-line', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '2px' }">
                  {{ log.details.solution }}
                </div>
              </div>
              <div v-if="log.details.duration" :style="{ color: '#ffcdd2', fontSize: '12px' }">
                ⏱️ 耗时: {{ log.details.duration }}ms
              </div>
              <div v-if="log.details.step" :style="{ color: '#ffcdd2', fontSize: '12px' }">
                📍 失败步骤: {{ log.details.step }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <div style="margin-top: 30px; padding: 15px; background: #e3f2fd; border-radius: 4px">
      <h3>📖 使用说明</h3>
      <ol style="padding-left: 20px; line-height: 1.8">
        <li>左侧显示 Mock 任务详情</li>
        <li>点击 <strong>START</strong> 按钮启动 agent</li>
        <li>Agent 自动读取服务端脚本指令</li>
        <li>执行任务并实时显示进度</li>
        <li><strong style="color: #f44336">点击红色错误日志查看详细分析</strong></li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import config from './config'

interface Task {
  id: string
  name: string
  description: string
  script: string
  status: 'pending' | 'running' | 'completed' | 'failed'
}

interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning' | 'process'
  details?: {
    error?: string
    stack?: string
    solution?: string
    duration?: number
    step?: string
  }
  expanded?: boolean
}

const selectedTask = ref<Task | null>(null)
const isLoading = ref(false)
const logs = ref<LogEntry[]>([])
const isFullscreen = ref(false)

// 加载 Mock 任务
onMounted(() => {
  loadMockTasks()
})

// ESC键退出全屏
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
}

const updateBodyOverflow = () => {
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyPress)
  } else {
    document.body.style.overflow = 'unset'
    document.removeEventListener('keydown', handleKeyPress)
  }
}

// 监听全屏状态变化
import { watch } from 'vue'
watch(isFullscreen, updateBodyOverflow)

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
  document.body.style.overflow = 'unset'
})

const loadMockTasks = async () => {
  try {
    const response = await fetch(`${config.api.baseURL}/api/mock`)
    const data = await response.json()
    selectedTask.value = data
    addLog('✅ Mock 任务已加载', 'info')
  } catch (error) {
    addLog('❌ 加载任务失败', 'error', {
      error: error instanceof Error ? error.message : String(error),
      solution: `请确保后端服务器正在运行 (${config.api.baseURL})`,
    })
    console.error(error)
  }
}

const addLog = (message: string, type: LogEntry['type'] = 'info', details?: LogEntry['details']) => {
  const timestamp = new Date().toLocaleTimeString()
  const logEntry: LogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    message,
    type,
    details,
    expanded: false,
  }
  logs.value.push(logEntry)
}

const toggleLogExpand = (id: string) => {
  const log = logs.value.find(l => l.id === id)
  if (log) {
    log.expanded = !log.expanded
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const handleStart = async () => {
  if (!selectedTask.value) {
    addLog('⚠️ 请先选择任务', 'warning')
    return
  }

  isLoading.value = true
  addLog('🚀 开始执行任务...', 'info')
  addLog(`📋 任务: ${selectedTask.value.name}`, 'info')
  addLog(`📝 描述: ${selectedTask.value.description}`, 'info')

  try {
    // 1. 创建任务
    addLog('1️⃣ 创建任务...', 'process')
    const createResponse = await fetch(`${config.api.baseURL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedTask.value),
    })

    if (!createResponse.ok) {
      throw new Error(`创建任务失败: ${createResponse.status}`)
    }

    const task = await createResponse.json()
    addLog(`✅ 任务已创建: ${task.id}`, 'success')

    // 2. 运行任务
    addLog('2️⃣ 运行任务...', 'process')
    const runResponse = await fetch(`${config.api.baseURL}/api/tasks/${task.id}/run`, {
      method: 'POST',
    })

    if (!runResponse.ok) {
      throw new Error(`运行任务失败: ${runResponse.status}`)
    }

    const runData = await runResponse.json()
    addLog(`✅ 任务已分配给客户端: ${runData.clientId || '等待中'}`, 'success')

    // 3. 监听任务进度（模拟）
    simulateTaskProgress(task.id)

  } catch (error) {
    addLog(`❌ 执行失败: ${error}`, 'error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      solution: '请检查后端服务是否正常运行，查看控制台了解详细错误',
    })
    isLoading.value = false
  }
}

const handleClearLogs = () => {
  logs.value = []
  addLog('🗑️  日志已清空', 'info')
}

const simulateTaskProgress = (taskId: string) => {
  const steps = [
    { action: '打开百度首页', duration: 2000, mayFail: false },
    { action: 'AI视觉识别搜索框，输入"华为"', duration: 3000, mayFail: false },
    { action: 'AI视觉识别搜索按钮，点击', duration: 2000, mayFail: false },
    { action: 'AI视觉等待搜索结果出现', duration: 2000, mayFail: true },
  ]

  let currentStep = 0

  const executeStep = () => {
    if (currentStep >= steps.length) {
      addLog('✅ 任务执行完成！', 'success')
      addLog('📊 结果已返回给服务端', 'success')
      isLoading.value = false
      return
    }

    const step = steps[currentStep]
    addLog(`⏳ 步骤 ${currentStep + 1}/${steps.length}: ${step.action}`, 'process')

    setTimeout(() => {
      // 模拟 10% 的失败率，演示错误处理
      const shouldFail = step.mayFail && Math.random() < 0.1

      if (shouldFail) {
        addLog(`❌ 步骤 ${currentStep + 1} 失败`, 'error', {
          error: '网络超时',
          stack: 'TimeoutError: 页面加载超过 2000ms',
          solution: '1. 检查网络连接\n2. 增加等待时间\n3. 刷新页面重试',
          duration: step.duration,
          step: step.action,
        })
      } else {
        addLog(`✅ 步骤 ${currentStep + 1} 完成 (耗时: ${step.duration}ms)`, 'success')
      }

      currentStep++
      executeStep()
    }, step.duration)
  }

  executeStep()
}
</script>
