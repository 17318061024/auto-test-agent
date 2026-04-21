<template>
  <div class="task-editor">
    <div class="header">
      <h2>📝 任务编辑器</h2>
      <div class="actions">
        <button
          @click="createNewTask"
          class="btn btn-primary"
        >
          ➕ 新建任务
        </button>
        <button
          @click="saveTask"
          :disabled="!isTaskModified"
          class="btn btn-success"
        >
          💾 保存任务
        </button>
        <button
          @click="runTask"
          :disabled="!isTaskValid"
          class="btn btn-primary"
        >
          🚀 运行任务
        </button>
      </div>
    </div>

    <!-- 任务基本信息 -->
    <div class="section">
      <h3>基本信息</h3>
      <div class="form-group">
        <label>任务名称</label>
        <input
          v-model="task.name"
          type="text"
          placeholder="输入任务名称"
          class="form-control"
        >
      </div>

      <div class="form-group">
        <label>任务描述</label>
        <textarea
          v-model="task.description"
          placeholder="输入任务描述"
          class="form-control"
          rows="3"
        ></textarea>
      </div>
    </div>

    <!-- 执行步骤 -->
    <div class="section">
      <div class="section-header">
        <h3>🔧 执行步骤</h3>
        <button
          @click="addStep"
          class="btn btn-secondary btn-sm"
        >
          ➕ 添加步骤
        </button>
      </div>

      <div class="steps-container">
        <div
          v-for="(step, index) in task.steps"
          :key="index"
          class="step-item"
          :class="{ 'step-error': step.error }"
        >
          <div class="step-header">
            <span class="step-number">{{ index + 1 }}</span>
            <select
              v-model="step.action"
              class="form-control form-control-sm"
              style="width: 150px"
            >
              <option value="goto">页面导航</option>
              <option value="click">点击元素</option>
              <option value="fill">填写输入</option>
              <option value="wait">等待</option>
              <option value="hover">悬停</option>
              <option value="assert">断言</option>
            </select>
            <button
              @click="removeStep(index)"
              class="btn btn-danger btn-sm"
              title="删除步骤"
            >
              🗑️
            </button>
            <button
              @click="moveStep(index, 'up')"
              :disabled="index === 0"
              class="btn btn-secondary btn-sm"
              title="上移"
            >
              ⬆️
            </button>
            <button
              @click="moveStep(index, 'down')"
              :disabled="index === task.steps.length - 1"
              class="btn btn-secondary btn-sm"
              title="下移"
            >
              ⬇️
            </button>
          </div>

          <div class="step-content">
            <!-- 根据操作类型显示不同的参数 -->
            <div v-if="step.action === 'goto'" class="step-params">
              <div class="form-group">
                <label>URL地址</label>
                <input
                  v-model="step.params.url"
                  type="text"
                  placeholder="https://example.com"
                  class="form-control"
                >
              </div>
            </div>

            <div v-else-if="step.action === 'click' || step.action === 'hover'" class="step-params">
              <div class="form-group">
                <label>元素选择器或描述</label>
                <input
                  v-model="step.params.selector"
                  type="text"
                  :placeholder="step.action === 'click' ? 'button, .submit-btn' : 'nav a'"
                  class="form-control"
                >
              </div>
            </div>

            <div v-else-if="step.action === 'fill'" class="step-params">
              <div class="form-group">
                <label>输入框选择器</label>
                <input
                  v-model="step.params.selector"
                  type="text"
                  placeholder="#username, input[name=\"user\"]"
                  class="form-control"
                >
              </div>
              <div class="form-group">
                <label>填写内容</label>
                <input
                  v-model="step.params.value"
                  type="text"
                  placeholder="要填写的文本"
                  class="form-control"
                >
              </div>
            </div>

            <div v-else-if="step.action === 'wait'" class="step-params">
              <div class="form-group">
                <label>等待时间（毫秒）</label>
                <input
                  v-model.number="step.params.duration"
                  type="number"
                  placeholder="1000"
                  class="form-control"
                >
              </div>
            </div>

            <div v-else-if="step.action === 'assert'" class="step-params">
              <div class="form-group">
                <label>断言类型</label>
                <select
                  v-model="step.params.assertion"
                  class="form-control"
                >
                  <option value="visible">元素可见</option>
                  <option value="text">文本内容</option>
                  <option value="url">页面URL</option>
                </select>
              </div>
              <div class="form-group">
                <label>期望值</label>
                <input
                  v-model="step.params.expected"
                  type="text"
                  placeholder="期望的值"
                  class="form-control"
                >
              </div>
            </div>

            <!-- 通用参数 -->
            <div class="form-group">
              <label>步骤描述（可选）</label>
              <input
                v-model="step.description"
                type="text"
                placeholder="描述此步骤的作用"
                class="form-control"
              >
            </div>

            <div class="form-group">
              <label>超时时间（毫秒）</label>
              <input
                v-model.number="step.timeout"
                type="number"
                placeholder="5000"
                class="form-control form-control-sm"
                style="width: 150px"
              >
            </div>
          </div>
        </div>

        <div v-if="task.steps.length === 0" class="empty-state">
          暂无执行步骤，点击"添加步骤"开始创建
        </div>
      </div>
    </div>

    <!-- 任务配置 -->
    <div class="section">
      <h3>⚙️ 任务配置</h3>
      <div class="config-grid">
        <div class="form-group">
          <label>重试次数</label>
          <input
            v-model.number="task.config.retries"
            type="number"
            min="0"
            max="5"
            class="form-control"
          >
        </div>
        <div class="form-group">
          <label>步骤超时（毫秒）</label>
          <input
            v-model.number="task.config.timeout"
            type="number"
            min="1000"
            step="1000"
            class="form-control"
          >
        </div>
        <div class="form-group">
          <label>无头模式</label>
          <select
            v-model="task.config.headless"
            class="form-control"
          >
            <option :value="true">是（后台运行）</option>
            <option :value="false">否（显示浏览器）</option>
          </select>
        </div>
        <div class="form-group">
          <label>截图设置</label>
          <select
            v-model="task.config.screenshots"
            class="form-control"
          >
            <option value="on">始终截图</option>
            <option value="off">不截图</option>
            <option value="only-on-failure">仅在失败时截图</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 脚本预览 -->
    <div class="section">
      <div class="section-header">
        <h3>📄 脚本预览</h3>
        <button
          @click="copyScript"
          class="btn btn-secondary btn-sm"
        >
          📋 复制脚本
        </button>
      </div>

      <div class="script-preview">
        <pre><code>{{ generateScript() }}</code></pre>
      </div>
    </div>

    <!-- 任务模板 -->
    <div class="section">
      <div class="section-header">
        <h3>📚 任务模板</h3>
      </div>
      <div class="template-grid">
        <div
          v-for="(template, index) in taskTemplates"
          :key="index"
          class="template-card"
          @click="loadTemplate(template)"
        >
          <div class="template-icon">{{ template.icon }}</div>
          <div class="template-name">{{ template.name }}</div>
          <div class="template-desc">{{ template.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

/**
 * 任务步骤接口
 */
interface TaskStep {
  action: string
  params: Record<string, any>
  description?: string
  timeout?: number
  error?: string
}

/**
 * 任务配置接口
 */
interface TaskConfig {
  retries: number
  timeout: number
  headless: boolean
  screenshots: 'on' | 'off' | 'only-on-failure'
}

/**
 * 任务接口
 */
interface Task {
  id: string
  name: string
  description?: string
  steps: TaskStep[]
  config: TaskConfig
}

// 当前任务
const task = ref<Task>({
  id: '',
  name: '',
  description: '',
  steps: [],
  config: {
    retries: 3,
    timeout: 5000,
    headless: false,
    screenshots: 'only-on-failure',
  },
})

// 原始任务（用于检测修改）
const originalTask = ref<Task | null>(null)

// 任务模板
const taskTemplates = ref([
  {
    name: 'Google搜索',
    icon: '🔍',
    description: '打开Google并搜索关键词',
    steps: [
      { action: 'goto', params: { url: 'https://www.google.com' } },
      { action: 'fill', params: { selector: 'textarea[name="q"]', value: '测试搜索' } },
      { action: 'click', params: { selector: 'input[value="Google Search"]' } },
    ],
  },
  {
    name: '表单填写',
    icon: '📝',
    description: '填写并提交表单',
    steps: [
      { action: 'goto', params: { url: 'https://example.com/form' } },
      { action: 'fill', params: { selector: '#username', value: 'testuser' } },
      { action: 'fill', params: { selector: '#password', value: 'password123' } },
      { action: 'click', params: { selector: 'button[type="submit"]' } },
    ],
  },
  {
    name: '登录验证',
    icon: '🔐',
    description: '验证登录功能',
    steps: [
      { action: 'goto', params: { url: 'https://example.com/login' } },
      { action: 'fill', params: { selector: '#email', value: 'user@example.com' } },
      { action: 'fill', params: { selector: '#password', value: 'password' } },
      { action: 'click', params: { selector: 'button[type="submit"]' } },
      { action: 'assert', params: { assertion: 'url', expected: '/dashboard' } },
    ],
  },
])

// 计算属性
const isTaskModified = computed(() => {
  return JSON.stringify(task.value) !== JSON.stringify(originalTask.value)
})

const isTaskValid = computed(() => {
  return task.value.name.trim() !== '' &&
         task.value.steps.length > 0 &&
         task.value.steps.every(step => {
           if (step.action === 'goto') return !!step.params?.url
           if (step.action === 'fill') return !!step.params?.selector && !!step.params?.value
           if (step.action === 'click' || step.action === 'hover') return !!step.params?.selector
           return true
         })
})

// 方法
const createNewTask = () => {
  task.value = {
    id: `task-${Date.now()}`,
    name: '',
    description: '',
    steps: [],
    config: {
      retries: 3,
      timeout: 5000,
      headless: false,
      screenshots: 'only-on-failure',
    },
  }
  originalTask.value = null
}

const saveTask = () => {
  console.log('💾 保存任务:', task.value)
  // TODO: 调用API保存任务
  originalTask.value = JSON.parse(JSON.stringify(task.value))
  alert('任务已保存！')
}

const runTask = () => {
  if (!isTaskValid.value) {
    alert('请完善任务信息')
    return
  }

  console.log('🚀 运行任务:', task.value)
  // TODO: 调用API运行任务
  alert(`任务 "${task.value.name}" 开始执行！`)
}

const addStep = () => {
  task.value.steps.push({
    action: 'goto',
    params: { url: '' },
    description: '',
    timeout: task.value.config.timeout,
  })
}

const removeStep = (index: number) => {
  task.value.steps.splice(index, 1)
}

const moveStep = (index: number, direction: 'up' | 'down') => {
  const steps = task.value.steps
  const newIndex = direction === 'up' ? index - 1 : index + 1

  if (newIndex >= 0 && newIndex < steps.length) {
    const temp = steps[index]
    steps[index] = steps[newIndex]
    steps[newIndex] = temp
  }
}

const generateScript = () => {
  let script = `// ${task.value.name || '未命名任务'}\n`
  script += `// 描述: ${task.value.description || '无描述'}\n\n`

  task.value.steps.forEach((step, index) => {
    script += `// 步骤 ${index + 1}: ${step.description || step.action}\n`
    script += `await ${step.action}(${JSON.stringify(step.params).replace(/"/g, "'")})\n\n`
  })

  return script
}

const copyScript = () => {
  const script = generateScript()
  navigator.clipboard.writeText(script)
  alert('脚本已复制到剪贴板')
}

const loadTemplate = (template: any) => {
  if (confirm(`加载模板"${template.name}"？这将覆盖当前任务。`)) {
    task.value.name = template.name
    task.value.description = template.description
    task.value.steps = [...template.steps]
  }
}

// 生命周期
onMounted(() => {
  console.log('📝 任务编辑器已加载')
})
</script>

<style scoped>
.task-editor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
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
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.section h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.form-control-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1976d2;
}

.btn-success {
  background: #4caf50;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #45a049;
}

.btn-secondary {
  background: #757575;
  color: white;
}

.btn-secondary:hover {
  background: #616161;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover {
  background: #d32f2f;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.steps-container {
  min-height: 100px;
}

.step-item {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
}

.step-error {
  border-color: #f44336;
  background: #ffebee;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.step-number {
  background: #2196f3;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.step-params {
  display: grid;
  gap: 10px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.script-preview {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

.script-preview pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.empty-state {
  text-align: center;
  color: #9e9e9e;
  padding: 40px 20px;
  border: 2px dashed #e0e0e0;
  border-radius: 4px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.template-card {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  background: #e3f2fd;
  border-color: #2196f3;
  transform: translateY(-2px);
}

.template-icon {
  font-size: 32px;
  text-align: center;
  margin-bottom: 10px;
}

.template-name {
  font-weight: 600;
  text-align: center;
  margin-bottom: 5px;
}

.template-desc {
  font-size: 12px;
  color: #666;
  text-align: center;
}
</style>
