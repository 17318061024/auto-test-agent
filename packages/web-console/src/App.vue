<template>
  <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
    <h1>Auto Test Agent</h1>
    <p style="color: #666">自动化测试网页控制台</p>

    <div style="margin-top: 30px; display: grid; gap: 20px; grid-template-columns: 1fr 1fr">
      <!-- 左侧：任务 + 客户端 -->
      <div style="display: flex; flex-direction: column; gap: 20px">
        <!-- 在线客户端 -->
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px">
            <h2 style="margin: 0">在线客户端</h2>
            <span :style="{
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              background: onlineClients.length > 0 ? '#e8f5e9' : '#fbe9e7',
              color: onlineClients.length > 0 ? '#2e7d32' : '#c62828',
            }">
              {{ onlineClients.length }} 个在线
            </span>
          </div>

          <div v-if="onlineClients.length === 0" style="color: #999; text-align: center; padding: 20px">
            等待桌面客户端连接...
          </div>
          <div v-else style="display: flex; flex-direction: column; gap: 8px">
            <div
              v-for="client in onlineClients"
              :key="client.id"
              @click="selectedClientId = client.id"
              :style="{
                padding: '12px 16px',
                borderRadius: '8px',
                border: selectedClientId === client.id ? '2px solid #667eea' : '1px solid #e0e0e0',
                background: selectedClientId === client.id ? '#f0f0ff' : '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }"
            >
              <div style="display: flex; justify-content: space-between; align-items: center">
                <div>
                  <div style="font-weight: 600; font-size: 14px">{{ client.name || '未命名客户端' }}</div>
                  <div style="color: #888; font-size: 12px; margin-top: 4px">
                    {{ client.metadata?.hostname || '-' }} / {{ client.metadata?.platform || '-' }}
                  </div>
                </div>
                <span :style="{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  background: client.status === 'online' ? '#c8e6c9' : '#ffecb3',
                  color: client.status === 'online' ? '#2e7d32' : '#f57f17',
                }">
                  {{ client.status === 'online' ? '空闲' : '忙碌' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 任务 -->
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px">
          <h2>Mock 任务</h2>

          <div v-if="selectedTask" style="margin-top: 20px">
            <h3>{{ selectedTask.name }}</h3>
            <p style="color: #666; font-size: 14px">{{ selectedTask.description }}</p>

            <div style="margin-top: 15px; background: #f5f5f5; padding: 15px; border-radius: 4px">
              <h4>执行步骤：</h4>
              <ol style="padding-left: 20px; margin: 10px 0">
                <li v-for="step in selectedTask.steps" :key="step.action">{{ step.description }}</li>
              </ol>
            </div>

            <div style="margin-top: 15px; padding: 12px; background: #e3f2fd; border-radius: 4px; font-size: 13px; color: #1565c0">
              目标客户端: <strong>{{ selectedClientId ? getSelectedClientName() : '自动选择' }}</strong>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 15px">
              <button
                @click="handleStart"
                :disabled="isLoading || onlineClients.length === 0"
                :style="{
                  padding: '12px 32px',
                  fontSize: '16px',
                  background: (isLoading || onlineClients.length === 0)
                    ? '#bdbdbd'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: (isLoading || onlineClients.length === 0) ? '#757575' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (isLoading || onlineClients.length === 0) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: (isLoading || onlineClients.length === 0) ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                }"
              >
                {{ isLoading ? '执行中...' : 'START' }}
              </button>

              <button
                @click="handleClearLogs"
                :disabled="isLoading"
                :style="{
                  padding: '12px 24px',
                  fontSize: '16px',
                  background: isLoading ? '#e0e0e0' : 'transparent',
                  color: isLoading ? '#9e9e9e' : '#757575',
                  border: isLoading ? '1px solid #e0e0e0' : '1px solid #bdbdbd',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                }"
              >
                清空日志
              </button>
            </div>
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
          <h2 style="margin: 0">执行日志</h2>
          <div style="display: flex; align-items: center; gap: 15px">
            <span style="font-size: 12px; color: #666">
              {{ logs.length }} 条日志
            </span>
            <button
              @click="toggleFullscreen"
              style="padding: 6px 12px; font-size: 14px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold"
            >
              {{ isFullscreen ? '退出全屏' : '全屏' }}
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
            height: isFullscreen ? 'calc(100vh - 120px)' : '500px',
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
              marginBottom: '6px',
              padding: '6px 10px',
              borderRadius: '4px',
              cursor: log.type === 'error' ? 'pointer' : 'default',
              border: log.type === 'error' ? '1px solid #f44336' : 'none',
              background: log.type === 'error' ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
            }"
          >
            <div style="display: flex; align-items: center; gap: 8px">
              <span :style="{ color: log.type === 'success' ? '#4caf50' : log.type === 'error' ? '#f44336' : log.type === 'warning' ? '#ff9800' : '#2196f3', fontWeight: 'bold' }">
                {{ log.type === 'error' ? 'x' : log.type === 'success' ? '+' : log.type === 'warning' ? '!' : '>' }}
              </span>
              <span :style="{ color: '#888', fontSize: '12px' }">{{ log.timestamp }}</span>
              <span :style="{ color: log.type === 'error' ? '#ffcdd2' : '#ccc', fontSize: '13px', flex: 1 }">{{ log.message }}</span>
            </div>
            <div v-if="log.type === 'error' && log.expanded && log.details" style="margin-top: 8px; padding: 8px; background: rgba(244,67,54,0.1); border-radius: 4px">
              <div style="color: #ffcdd2; font-size: 12px; white-space: pre-line">{{ log.details.error || log.details }}</div>
              <div v-if="log.details.solution" style="color: #81c784; font-size: 12px; margin-top: 6px">{{ log.details.solution }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { io, Socket } from 'socket.io-client'
import config from './config'

interface Task {
  id: string
  name: string
  description: string
  script: string
  steps: { action: string; params: string[]; description: string }[]
  status: 'pending' | 'running' | 'completed' | 'failed'
}

interface Client {
  id: string
  name: string
  status: 'online' | 'offline' | 'busy'
  lastSeen: string
  metadata: Record<string, any>
}

interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning' | 'process'
  details?: any
  expanded?: boolean
}

const selectedTask = ref<Task | null>(null)
const isLoading = ref(false)
const logs = ref<LogEntry[]>([])
const isFullscreen = ref(false)
const onlineClients = ref<Client[]>([])
const selectedClientId = ref<string | null>(null)
let socket: Socket | null = null

onMounted(() => {
  loadMockTasks()
  fetchOnlineClients()
  connectWebSocket()
})

onUnmounted(() => {
  if (socket) socket.disconnect()
  document.removeEventListener('keydown', handleKeyPress)
})

// ESC 退出全屏
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isFullscreen.value) isFullscreen.value = false
}
watch(isFullscreen, (val) => {
  document.body.style.overflow = val ? 'hidden' : 'unset'
  if (val) document.addEventListener('keydown', handleKeyPress)
  else document.removeEventListener('keydown', handleKeyPress)
})

function connectWebSocket() {
  const wsUrl = config.websocket.url.replace(/^ws/, 'http')
  socket = io(wsUrl, { transports: ['websocket', 'polling'] })

  socket.on('connect', () => {
    addLog('WebSocket 已连接', 'info')
  })

  socket.on('clients:list', (clients: Client[]) => {
    onlineClients.value = clients.filter(c => c.status !== 'offline')
    // 如果当前选中的客户端已下线，清除选择
    if (selectedClientId.value && !onlineClients.value.find(c => c.id === selectedClientId.value)) {
      selectedClientId.value = null
    }
    // 默认选中第一个在线客户端
    if (!selectedClientId.value && onlineClients.value.length > 0) {
      const freeClient = onlineClients.value.find(c => c.status === 'online')
      if (freeClient) selectedClientId.value = freeClient.id
    }
  })

  socket.on('task:updated', (data: { taskId: string; status: string; result?: any }) => {
    addLog(`任务状态更新: ${data.status}`, data.status === 'completed' ? 'success' : data.status === 'failed' ? 'error' : 'info')
    if (data.status === 'completed' || data.status === 'failed') {
      isLoading.value = false
    }
    if (data.result?.error) {
      addLog(`错误: ${data.result.error}`, 'error', data.result)
    }
  })

  socket.on('disconnect', () => {
    addLog('WebSocket 断开连接', 'warning')
  })
}

async function fetchOnlineClients() {
  try {
    const res = await fetch(`${config.api.baseURL}/api/clients/online`)
    onlineClients.value = await res.json()
  } catch {}
}

function getSelectedClientName(): string {
  const c = onlineClients.value.find(c => c.id === selectedClientId.value)
  return c ? (c.name || c.metadata?.hostname || c.id.slice(0, 8)) : ''
}

const loadMockTasks = async () => {
  try {
    const response = await fetch(`${config.api.baseURL}/api/mock`)
    const data = await response.json()
    selectedTask.value = data
    addLog('Mock 任务已加载', 'info')
  } catch (error) {
    addLog('加载任务失败', 'error', {
      error: error instanceof Error ? error.message : String(error),
      solution: `请确保后端服务器正在运行 (${config.api.baseURL})`,
    })
  }
}

const addLog = (message: string, type: LogEntry['type'] = 'info', details?: any) => {
  logs.value.push({
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toLocaleTimeString(),
    message,
    type,
    details,
    expanded: false,
  })
}

const toggleLogExpand = (id: string) => {
  const log = logs.value.find(l => l.id === id)
  if (log) log.expanded = !log.expanded
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const handleStart = async () => {
  if (!selectedTask.value) return
  if (onlineClients.value.length === 0) {
    addLog('没有在线客户端，无法执行', 'warning')
    return
  }

  isLoading.value = true
  addLog('开始执行任务...', 'info')
  addLog(`任务: ${selectedTask.value.name}`, 'info')

  try {
    // 1. 创建任务
    addLog('创建任务...', 'process')
    const createResponse = await fetch(`${config.api.baseURL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedTask.value),
    })
    if (!createResponse.ok) throw new Error(`创建任务失败: ${createResponse.status}`)
    const task = await createResponse.json()
    addLog(`任务已创建: ${task.id}`, 'success')

    // 2. 运行任务（指定目标客户端）
    addLog(`分配到客户端: ${getSelectedClientName() || '自动选择'}`, 'process')
    const runResponse = await fetch(`${config.api.baseURL}/api/tasks/${task.id}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: selectedClientId.value || undefined }),
    })
    if (!runResponse.ok) {
      const errData = await runResponse.json().catch(() => ({}))
      throw new Error(errData.message || `运行任务失败: ${runResponse.status}`)
    }
    const runData = await runResponse.json()
    addLog(`任务已分配给: ${runData.clientName || runData.clientId}`, 'success')

  } catch (error) {
    addLog(`执行失败: ${error}`, 'error', {
      error: error instanceof Error ? error.message : String(error),
      solution: '请检查后端服务是否正常运行',
    })
    isLoading.value = false
  }
}

const handleClearLogs = () => {
  logs.value = []
  addLog('日志已清空', 'info')
}
</script>
