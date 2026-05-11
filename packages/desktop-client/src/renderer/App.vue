<template>
  <el-container style="height: 100vh;">
    <!-- 顶部导航栏 -->
    <el-header style="height: 52px; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--el-border-color-lighter); background: #fff;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <el-icon :size="22" color="#409eff"><Monitor /></el-icon>
        <span style="font-size: 15px; font-weight: 700; color: #303133;">Auto Test Agent</span>
        <el-tag size="small" type="info" effect="plain" style="margin-left: 4px;">Desktop</el-tag>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <el-tag :type="connectionTagType" effect="dark" round style="font-size: 11px;">
          <el-icon v-if="connectionState === 'connected'" style="margin-right: 2px;"><CircleCheck /></el-icon>
          <el-icon v-else-if="connectionState === 'connecting' || connectionState === 'reconnecting'" class="is-loading" style="margin-right: 2px;"><Loading /></el-icon>
          <el-icon v-else style="margin-right: 2px;"><CircleClose /></el-icon>
          {{ connectionText }}
        </el-tag>
        <el-tag size="small" effect="plain">{{ systemInfo.platform }} / {{ systemInfo.arch }}</el-tag>
        <el-button size="small" circle @click="showSettings = true"><el-icon><Setting /></el-icon></el-button>
      </div>
    </el-header>

    <!-- 无任务 -->
    <el-main v-if="!currentTask.id" style="display: flex; align-items: center; justify-content: center; background: #f5f7fa;">
      <el-empty :image-size="120" description=" ">
        <template #image>
          <el-icon :size="64" color="#c0c4cc"><Document /></el-icon>
        </template>
        <template #description>
          <p style="font-size: 16px; font-weight: 600; color: #606266; margin-bottom: 4px;">等待任务分配</p>
          <p style="font-size: 13px; color: #909399;">客户端已就绪，等待 Web 控制台下发测试任务</p>
        </template>
        <template #footer>
          <el-tag effect="plain" round>
            <el-icon style="margin-right: 4px;" class="is-loading"><Loading /></el-icon>
            v0.2.0 &middot; Electron {{ systemInfo.electronVersion }}
          </el-tag>
        </template>
      </el-empty>
    </el-main>

    <!-- 有任务 -->
    <el-container v-else style="overflow: hidden;">
      <!-- 任务概览条 -->
      <el-header style="height: auto; padding: 14px 20px; background: #fff; border-bottom: 1px solid var(--el-border-color-lighter);">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <el-tag :type="statusTagType" effect="dark" round>{{ taskStatusText }}</el-tag>
            <span style="font-weight: 700; font-size: 15px; color: #303133;">{{ currentTask.name }}</span>
            <span v-if="currentTask.description" style="color: #909399; font-size: 13px;">{{ currentTask.description }}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <el-tag v-if="isExecuting || isCompleted" effect="plain" round>
              <el-icon style="margin-right: 2px;"><Timer /></el-icon>
              {{ formattedDuration }}
              <span style="margin: 0 4px; color: #dcdfe6;">|</span>
              {{ currentTask.currentStep }}/{{ currentTask.totalSteps }} 步骤
            </el-tag>
            <el-button v-if="isExecuting" type="danger" size="small" @click="cancelTask">
              <el-icon style="margin-right: 2px;"><Close /></el-icon>取消任务
            </el-button>
            <el-button v-if="isCompleted || hasError" size="small" @click="resetTask">
              <el-icon style="margin-right: 2px;"><RefreshRight /></el-icon>重置
            </el-button>
          </div>
        </div>
        <el-progress
          v-if="isExecuting || isCompleted"
          :percentage="currentTask.progress"
          :status="progressStatus"
          :stroke-width="6"
          style="margin-top: 10px;"
          :show-text="false"
        />
      </el-header>

      <!-- 完成横幅 -->
      <el-alert
        v-if="currentTask.status === 'completed'"
        type="success"
        :closable="false"
        style="border-radius: 0;"
      >
        <template #title>
          <span style="font-weight: 600;">任务执行完成</span> — 共 {{ currentTask.totalSteps }} 步，耗时 {{ formattedDuration }}
        </template>
      </el-alert>
      <el-alert
        v-if="hasError"
        type="error"
        :closable="false"
        style="border-radius: 0;"
      >
        <template #title>
          <span style="font-weight: 600;">任务执行失败</span>
          <span v-if="currentTask.error" style="margin-left: 8px;">{{ currentTask.error }}</span>
        </template>
      </el-alert>

      <!-- 主内容 -->
      <el-container style="overflow: hidden;">
        <!-- 左侧：步骤 -->
        <el-aside width="300px" style="background: #fff; border-right: 1px solid var(--el-border-color-lighter); display: flex; flex-direction: column; overflow: hidden;">
          <div style="padding: 12px 16px; border-bottom: 1px solid var(--el-border-color-extra-light); display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 13px; font-weight: 700; color: #606266;">测试步骤</span>
            <el-badge :value="steps.length" type="info" />
          </div>
          <div style="flex: 1; overflow-y: auto; padding: 8px;">
            <div v-if="steps.length === 0" style="text-align: center; padding: 40px 0;">
              <el-icon class="is-loading" :size="24" color="#c0c4cc"><Loading /></el-icon>
              <p style="color: #c0c4cc; font-size: 12px; margin-top: 8px;">加载中...</p>
            </div>
            <el-scrollbar v-else>
              <div style="padding: 4px;">
                <el-card
                  v-for="step in steps"
                  :key="step.id"
                  shadow="hover"
                  :class="['step-card', step.status]"
                  style="margin-bottom: 6px; border-radius: 8px;"
                  :body-style="{ padding: '10px 14px' }"
                >
                  <div style="display: flex; align-items: flex-start; gap: 10px;">
                    <el-icon v-if="step.status === 'pending'" :size="20" color="#c0c4cc"><CircleCheck /></el-icon>
                    <el-icon v-else-if="step.status === 'running'" :size="20" color="#409eff" class="is-loading"><Loading /></el-icon>
                    <el-icon v-else-if="step.status === 'success'" :size="20" color="#67c23a"><CircleCheckFilled /></el-icon>
                    <el-icon v-else-if="step.status === 'failed'" :size="20" color="#f56c6c"><CircleCloseFilled /></el-icon>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-size: 13px; font-weight: 600;" :style="{ color: step.status === 'pending' ? '#c0c4cc' : '#303133' }">{{ step.action }}</div>
                      <div v-if="step.description" style="font-size: 11px; color: #909399; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ step.description }}</div>
                      <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                        <el-tag v-if="step.status !== 'pending'" size="small" type="info" effect="plain" round style="font-size: 10px;">{{ step.duration }}ms</el-tag>
                        <span v-if="step.status === 'failed' && step.error" style="font-size: 10px; color: #f56c6c; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ step.error }}</span>
                      </div>
                    </div>
                  </div>
                </el-card>
              </div>
            </el-scrollbar>
          </div>
        </el-aside>

        <!-- 右侧：Tabs -->
        <el-main style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
          <el-tabs v-model="activeTab" style="--el-tabs-header-height: 42px; padding: 0 16px;">
            <el-tab-pane label="执行日志" name="logs">
              <template #label>
                <span>执行日志 <el-badge v-if="currentTask.logs.length" :value="currentTask.logs.length" :max="99" type="primary" style="margin-left: 4px;" /></span>
              </template>
            </el-tab-pane>
            <el-tab-pane label="执行详情" name="details" />
            <el-tab-pane name="recording">
              <template #label>
                <span style="display: flex; align-items: center; gap: 4px;">
                  <el-icon><VideoCamera /></el-icon>
                  录制回放
                  <el-icon v-if="currentTask.videoPath" color="#67c23a" :size="8"><CircleCheckFilled /></el-icon>
                </span>
              </template>
            </el-tab-pane>
          </el-tabs>

          <!-- 日志 Tab -->
          <div v-show="activeTab === 'logs'" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
            <div style="padding: 6px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--el-border-color-extra-light);">
              <el-radio-group v-model="logFilter" size="small">
                <el-radio-button v-for="f in logFilters" :key="f.value" :value="f.value">{{ f.label }}</el-radio-button>
              </el-radio-group>
              <el-button size="small" text type="danger" @click="clearLogs">清空</el-button>
            </div>
            <div class="log-terminal" style="flex: 1; overflow-y: auto; margin: 8px;">
              <el-empty v-if="filteredLogs.length === 0" description="暂无日志" :image-size="48" />
              <div
                v-for="log in filteredLogs"
                :key="log.id"
                :class="['log-entry', log.level]"
              >
                <span style="color: #6e7681; flex-shrink: 0; font-size: 10px; width: 56px; text-align: right;">{{ formatTime(log.timestamp) }}</span>
                <span :style="{ color: logLevelColorMap[log.level] || '#8b949e', flexShrink: 0, fontSize: '10px', fontWeight: 800, width: '12px', textAlign: 'center' }">{{ logLevelIcon(log.level) }}</span>
                <span :style="{ color: logTextColor[log.level] || '#d4d4d4', flex: 1, wordBreak: 'break-all' }">{{ log.message }}</span>
              </div>
            </div>
          </div>

          <!-- 详情 Tab -->
          <div v-show="activeTab === 'details'" style="flex: 1; overflow-y: auto; padding: 16px;">
            <div style="max-width: 800px; margin: 0 auto;">
              <!-- 任务信息 -->
              <el-descriptions title="任务信息" :column="2" border style="margin-bottom: 20px;">
                <el-descriptions-item label="任务名称">{{ currentTask.name || '-' }}</el-descriptions-item>
                <el-descriptions-item label="描述">{{ currentTask.description || '-' }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="statusTagType" size="small" effect="dark">{{ taskStatusText }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="进度">
                  <el-progress :percentage="currentTask.progress" :status="progressStatus" :stroke-width="10" style="width: 120px;" />
                </el-descriptions-item>
                <el-descriptions-item label="步骤">{{ currentTask.currentStep }} / {{ currentTask.totalSteps }}</el-descriptions-item>
                <el-descriptions-item label="耗时">
                  <el-tag effect="plain" round>{{ formattedDuration }}</el-tag>
                </el-descriptions-item>
              </el-descriptions>

              <!-- 步骤统计 -->
              <h4 style="font-size: 14px; font-weight: 700; color: #606266; margin-bottom: 12px;">步骤统计</h4>
              <el-row :gutter="12" style="margin-bottom: 20px;">
                <el-col :span="6">
                  <el-statistic title="总步骤" :value="currentTask.totalSteps" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="通过" :value="completedSteps" style="--el-statistic-title-color: #67c23a;" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="失败" :value="failedSteps" style="--el-statistic-title-color: #f56c6c;" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="待执行" :value="currentTask.totalSteps - completedSteps - failedSteps" />
                </el-col>
              </el-row>

              <!-- 步骤明细表 -->
              <h4 style="font-size: 14px; font-weight: 700; color: #606266; margin-bottom: 12px;">步骤明细</h4>
              <el-table :data="steps" stripe style="margin-bottom: 20px;" size="small">
                <el-table-column type="index" label="#" width="50" />
                <el-table-column prop="action" label="操作" min-width="120">
                  <template #default="{ row }">
                    <span style="font-weight: 600;">{{ row.action }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" min-width="160">
                  <template #default="{ row }">
                    <span style="color: #909399;">{{ row.description || '-' }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="90" align="center">
                  <template #default="{ row }">
                    <el-tag :type="stepStatusTagType(row.status)" size="small" effect="plain">{{ stepStatusText(row.status) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="耗时" width="90" align="right">
                  <template #default="{ row }">
                    <span style="font-family: monospace; color: #909399; font-size: 12px;">{{ row.status === 'pending' ? '-' : row.duration + 'ms' }}</span>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 失败详情 -->
              <template v-if="failedStepDetails.length > 0">
                <el-alert type="error" :closable="false" style="margin-bottom: 12px;">
                  <template #title><span style="font-weight: 700;">失败步骤详情</span></template>
                </el-alert>
                <el-card
                  v-for="step in failedStepDetails"
                  :key="step.id"
                  shadow="never"
                  style="margin-bottom: 8px; border-color: #fab6b6;"
                >
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <el-icon color="#f56c6c"><CircleCloseFilled /></el-icon>
                    <span style="font-weight: 700; color: #f56c6c;">{{ step.action }}</span>
                    <el-tag size="small" type="danger" effect="plain" round>{{ step.duration }}ms</el-tag>
                  </div>
                  <el-input
                    v-if="step.error"
                    type="textarea"
                    :model-value="step.error"
                    readonly
                    :rows="2"
                    style="font-family: monospace; font-size: 12px;"
                  />
                  <p v-if="step.description" style="font-size: 12px; color: #f56c6c; margin-top: 6px;">{{ step.description }}</p>
                </el-card>
              </template>
            </div>
          </div>

          <!-- 录制回放 Tab -->
          <div v-show="activeTab === 'recording'" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
            <!-- 执行中 -->
            <div v-if="isExecuting" style="flex: 1; display: flex; align-items: center; justify-content: center;">
              <el-empty :image-size="80" description=" ">
                <template #image>
                  <el-icon class="is-loading" :size="48" color="#409eff"><VideoCamera /></el-icon>
                </template>
                <template #description>
                  <p style="font-weight: 600; color: #606266;">任务执行中，正在录制...</p>
                  <p style="font-size: 12px; color: #909399;">执行完成后即可回看</p>
                </template>
              </el-empty>
            </div>
            <!-- 有视频 -->
            <div v-else-if="currentTask.videoPath" style="flex: 1; display: flex; flex-direction: column; padding: 16px;">
              <el-card shadow="never" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;" :body-style="{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }">
                <template #header>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <el-icon color="#f56c6c"><VideoCamera /></el-icon>
                      <span style="font-weight: 600;">执行录制</span>
                      <el-tag size="small" effect="plain" round>{{ currentTask.name }}</el-tag>
                    </div>
                    <el-button size="small" text type="primary" @click="openVideoExternal">
                      <el-icon style="margin-right: 2px;"><TopRight /></el-icon>在播放器中打开
                    </el-button>
                  </div>
                </template>
                <div style="flex: 1; background: #000; display: flex; align-items: center; justify-content: center;">
                  <video :src="videoUrl" controls style="max-width: 100%; max-height: 100%;"></video>
                </div>
              </el-card>
            </div>
            <!-- 无视频 -->
            <div v-else style="flex: 1; display: flex; align-items: center; justify-content: center;">
              <el-empty :image-size="80" description=" ">
                <template #image>
                  <el-icon :size="48" color="#c0c4cc"><VideoCamera /></el-icon>
                </template>
                <template #description>
                  <p style="font-weight: 600; color: #909399;">暂无录制</p>
                  <p style="font-size: 12px; color: #c0c4cc;">执行任务后将自动录制浏览器操作过程</p>
                </template>
              </el-empty>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-container>

    <!-- 底部状态栏 -->
    <el-footer style="height: 28px; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--el-border-color-extra-light); background: #fff; font-size: 11px; color: #909399;">
      <div style="display: flex; gap: 12px;">
        <span>Node {{ systemInfo.nodeVersion }}</span>
        <span>Electron {{ systemInfo.electronVersion }}</span>
      </div>
      <div style="display: flex; gap: 12px;">
        <span>{{ memoryUsage }}</span>
        <span>{{ uptime }}</span>
      </div>
    </el-footer>

    <!-- 设置对话框 -->
    <el-dialog v-model="showSettings" title="客户端设置" width="420px" :close-on-click-modal="false">
      <el-form label-width="100px" label-position="left">
        <el-form-item label="客户端名称">
          <el-input v-model="clientNameInput" placeholder="例如：海涛的MacBook" clearable maxlength="30" show-word-limit />
          <div style="font-size: 11px; color: #909399; margin-top: 4px;">设置后在 Web 控制台可方便识别你的电脑</div>
        </el-form-item>
        <el-form-item label="主机名">
          <el-input :model-value="clientInfo.hostname" disabled />
        </el-form-item>
        <el-form-item label="系统用户">
          <el-input :model-value="clientInfo.username" disabled />
        </el-form-item>
        <el-form-item label="平台">
          <el-input :model-value="`${clientInfo.platform} / ${clientInfo.arch}`" disabled />
        </el-form-item>
        <el-form-item label="版本">
          <el-input :model-value="clientInfo.version" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="saveClientName">保存</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useTaskExecution } from '../composables/useTaskExecution'

const {
  connectionState,
  currentTask,
  steps,
  isExecuting,
  isCompleted,
  hasError,
  formattedDuration,
  cancelTask,
  resetTask,
  clearLogs,
  initTaskExecution,
  destroyTaskExecution,
} = useTaskExecution()

const activeTab = ref<'logs' | 'details' | 'recording'>('logs')
const logFilter = ref<string>('all')

const showSettings = ref(false)
const clientNameInput = ref('')
const clientInfo = ref({ hostname: '', username: '', platform: '', arch: '', version: '', clientName: '' })

const loadClientInfo = async () => {
  try {
    const { ipcRenderer } = window.require('electron')
    const info = await ipcRenderer.invoke('client:getInfo')
    clientInfo.value = info
    clientNameInput.value = info.clientName || ''
  } catch {}
}

const saveClientName = async () => {
  try {
    const { ipcRenderer } = window.require('electron')
    await ipcRenderer.invoke('client:setName', clientNameInput.value)
    showSettings.value = false
    ElMessage.success('客户端名称已保存')
    loadClientInfo()
  } catch {}
}

const videoUrl = computed(() => {
  if (!currentTask.videoPath) return ''
  return `video://${encodeURIComponent(currentTask.videoPath)}`
})

const openVideoExternal = () => {
  if (!currentTask.videoPath) return
  const { ipcRenderer } = window.require('electron')
  ipcRenderer.invoke('video:openExternal', currentTask.videoPath)
}

const systemInfo = ref({
  platform: process.platform,
  arch: process.arch,
  nodeVersion: process.version,
  electronVersion: process.versions.electron,
})

const memoryUsage = ref('0 MB')
const uptime = ref('0:00')
let perfTimer: ReturnType<typeof setInterval> | null = null

const logFilters = [
  { label: '全部', value: 'all' },
  { label: '信息', value: 'info' },
  { label: '成功', value: 'success' },
  { label: '警告', value: 'warning' },
  { label: '错误', value: 'error' },
]

const connectionText = computed(() => {
  const m: Record<string, string> = { disconnected: '未连接', connecting: '连接中...', connected: '已连接', reconnecting: '重连中...', failed: '连接失败' }
  return m[connectionState.value] || '未知'
})

const connectionTagType = computed(() => {
  const m: Record<string, string> = { connected: 'success', connecting: 'warning', reconnecting: 'warning', disconnected: 'danger', failed: 'danger' }
  return m[connectionState.value] || 'info'
})

const taskStatusText = computed(() => {
  const m: Record<string, string> = { pending: '等待中', running: '执行中', completed: '已完成', failed: '失败', cancelled: '已取消' }
  return m[currentTask.status] || '未知'
})

const statusTagType = computed(() => {
  const m: Record<string, string> = { pending: 'warning', running: 'primary', completed: 'success', failed: 'danger', cancelled: 'info' }
  return m[currentTask.status] || 'info'
})

const progressStatus = computed(() => {
  if (hasError.value) return 'exception'
  if (currentTask.status === 'completed') return 'success'
  return undefined
})

const completedSteps = computed(() => steps.value.filter((s: any) => s.status === 'success').length)
const failedSteps = computed(() => steps.value.filter((s: any) => s.status === 'failed').length)
const failedStepDetails = computed(() => steps.value.filter((s: any) => s.status === 'failed'))

const filteredLogs = computed(() => {
  if (logFilter.value === 'all') return currentTask.logs
  return currentTask.logs.filter((log: any) => log.level === logFilter.value)
})

const logLevelColorMap: Record<string, string> = {
  info: '#409eff', success: '#67c23a', warning: '#e6a23c', error: '#f56c6c', debug: '#909399',
}

const logTextColor: Record<string, string> = {
  info: '#a9b1d6', success: '#73daca', warning: '#e0af68', error: '#f7768e', debug: '#565f89',
}

const formatTime = (ts: number) => {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

const logLevelIcon = (level: string) => ({ info: 'i', success: '+', warning: '!', error: 'x', debug: 'd' }[level] || 'i')

const stepStatusText = (status: string) => ({ pending: '待执行', running: '执行中', success: '通过', failed: '失败' }[status] || status)
const stepStatusTagType = (status: string) => ({ pending: 'info', running: 'primary', success: 'success', failed: 'danger' }[status] || 'info')

const updatePerf = () => {
  const u = process.memoryUsage()
  memoryUsage.value = `${Math.round(u.heapUsed / 1024 / 1024)} MB`
  const s = Math.floor(process.uptime())
  uptime.value = s >= 3600 ? `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m` : `${Math.floor(s/60)}m ${s%60}s`
}

onMounted(() => {
  initTaskExecution()
  updatePerf()
  perfTimer = setInterval(updatePerf, 5000)
  loadClientInfo()
})

onUnmounted(() => {
  if (perfTimer) clearInterval(perfTimer)
  destroyTaskExecution()
})
</script>
