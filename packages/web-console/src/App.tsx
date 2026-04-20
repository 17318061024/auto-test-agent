/**
 * 网页控制台主应用
 */

import { useState, useEffect } from 'react'
import './App.css'

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

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])

  // 加载 Mock 任务
  useEffect(() => {
    loadMockTasks()
  }, [])

  const loadMockTasks = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/tasks/mock')
      const data = await response.json()
      setTasks([data])
      setSelectedTask(data)
      addLog('✅ Mock 任务已加载', 'info')
    } catch (error) {
      addLog('❌ 加载任务失败', 'error')
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
    setLogs((prev) => [...prev, logEntry])
  }

  const toggleLogExpand = (id: string) => {
    setLogs((prev) =>
      prev.map((log) =>
        log.id === id ? { ...log, expanded: !log.expanded } : log
      )
    )
  }

  const handleStart = async () => {
    if (!selectedTask) {
      addLog('⚠️ 请先选择任务', 'warning')
      return
    }

    setIsLoading(true)
    addLog('🚀 开始执行任务...', 'info')
    addLog(`📋 任务: ${selectedTask.name}`, 'info')
    addLog(`📝 描述: ${selectedTask.description}`, 'info')

    try {
      // 1. 创建任务
      addLog('1️⃣ 创建任务...', 'process')
      const createResponse = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTask),
      })
      const task = await createResponse.json()
      addLog(`✅ 任务已创建: ${task.id}`, 'success')

      // 2. 运行任务
      addLog('2️⃣ 运行任务...', 'process')
      const runResponse = await fetch(`http://localhost:3000/api/tasks/${task.id}/run`, {
        method: 'POST',
      })
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
      setIsLoading(false)
    }
  }

  const handleClearLogs = () => {
    setLogs([])
    addLog('🗑️  日志已清空', 'info')
  }

  const simulateTaskProgress = (taskId: string) => {
    const steps = [
      { action: '打开页面 https://www.google.com/webhp', duration: 2000, mayFail: false },
      { action: '在搜索框中输入"华为"', duration: 1000, mayFail: false },
      { action: '点击搜索按钮', duration: 1500, mayFail: false },
      { action: '等待结果加载', duration: 2000, mayFail: true }, // 这步可能失败
    ]

    let currentStep = 0

    const executeStep = () => {
      if (currentStep >= steps.length) {
        addLog('✅ 任务执行完成！', 'success')
        addLog('📊 结果已返回给服务端', 'success')
        setIsLoading(false)
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

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🤖 auto-test-agent</h1>
      <p style={{ color: '#666' }}>自动化测试网页控制台</p>

      <div style={{ marginTop: '30px', display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
        {/* 左侧：任务选择 */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <h2>📋 Mock 任务</h2>

          {selectedTask && (
            <div style={{ marginTop: '20px' }}>
              <h3>{selectedTask.name}</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>{selectedTask.description}</p>

              <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
                <h4>执行步骤：</h4>
                <ol style={{ paddingLeft: '20px', margin: '10px 0' }}>
                  <li>打开页面 https://www.google.com/webhp</li>
                  <li>在搜索框中输入"华为"</li>
                  <li>点击搜索按钮</li>
                  <li>等待结果加载</li>
                </ol>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleStart}
                  disabled={isLoading}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    background: isLoading ? '#ccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {isLoading ? '⏳ 执行中...' : '🚀 START'}
                </button>

                <button
                  onClick={handleClearLogs}
                  disabled={isLoading}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    background: isLoading ? '#ccc' : '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  🗑️ 清空日志
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：执行日志 */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0 }}>📊 执行日志</h2>
            <span style={{ fontSize: '12px', color: '#666' }}>
              {logs.length} 条日志
            </span>
          </div>
          <div
            style={{
              marginTop: '20px',
              background: '#1e1e1e',
              padding: '15px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '13px',
              height: '400px',
              overflowY: 'auto',
            }}
          >
            {logs.length === 0 ? (
              <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                等待执行...
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => log.type === 'error' && toggleLogExpand(log.id)}
                  style={{
                    marginBottom: '8px',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: log.type === 'error' ? 'pointer' : 'default',
                    border: log.type === 'error' ? '1px solid #f44336' : 'none',
                    background: log.type === 'error' ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      color:
                        log.type === 'success'
                          ? '#4CAF50'
                          : log.type === 'error'
                          ? '#f44336'
                          : log.type === 'warning'
                          ? '#ff9800'
                          : log.type === 'process'
                          ? '#2196F3'
                          : '#00ff00',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}>
                      {log.type === 'error' ? '❌' : log.type === 'success' ? '✅' : log.type === 'warning' ? '⚠️ ' : 'ℹ️'}
                    </span>
                    <span style={{
                      color: log.type === 'error' ? '#ffcdd2' : '#00ff00',
                      fontSize: '13px',
                    }}>
                      {log.timestamp}
                    </span>
                    <span style={{
                      color: log.type === 'error' ? '#ffcdd2' : '#00ff00',
                      fontSize: '13px',
                      flex: 1,
                    }}>
                      {log.message}
                    </span>
                    {log.type === 'error' && (
                      <span style={{ color: '#ffcdd2', fontSize: '16px', fontWeight: 'bold' }}>
                        {log.expanded ? '▼' : '▶'}
                      </span>
                    )}
                  </div>

                  {log.type === 'error' && log.expanded && log.details && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '12px',
                        background: 'rgba(244, 67, 54, 0.1)',
                        border: '1px solid #f44336',
                        borderRadius: '4px',
                      }}
                    >
                      <div style={{ color: '#ffcdd2', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                        🔍 错误详情
                      </div>
                      {log.details.error && (
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ color: '#ff8a80', fontSize: '12px', marginBottom: '4px' }}>
                            错误信息:
                          </div>
                          <div style={{ color: '#ffcdd2', fontSize: '12px', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '2px' }}>
                            {log.details.error}
                          </div>
                        </div>
                      )}
                      {log.details.stack && (
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ color: '#ff8a80', fontSize: '12px', marginBottom: '4px' }}>
                            堆栈信息:
                          </div>
                          <div style={{ color: '#ffcdd2', fontSize: '11px', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '2px', maxHeight: '100px', overflow: 'auto', wordBreak: 'break-all' }}>
                            {log.details.stack}
                          </div>
                        </div>
                      )}
                      {log.details.solution && (
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ color: '#81c784', fontSize: '12px', marginBottom: '4px' }}>
                            💡 解决方案:
                          </div>
                          <div style={{ color: '#c8e6c9', fontSize: '12px', whiteSpace: 'pre-line', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '2px' }}>
                            {log.details.solution}
                          </div>
                        </div>
                      )}
                      {log.details.duration && (
                        <div style={{ color: '#ffcdd2', fontSize: '12px' }}>
                          ⏱️ 耗时: {log.details.duration}ms
                        </div>
                      )}
                      {log.details.step && (
                        <div style={{ color: '#ffcdd2', fontSize: '12px' }}>
                          📍 失败步骤: {log.details.step}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div style={{ marginTop: '30px', padding: '15px', background: '#e3f2fd', borderRadius: '4px' }}>
        <h3>📖 使用说明</h3>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>左侧显示 Mock 任务详情</li>
          <li>点击 <strong>START</strong> 按钮启动 agent</li>
          <li>Agent 自动读取服务端脚本指令</li>
          <li>执行任务并实时显示进度</li>
          <li><strong style={{ color: '#f44336' }}>点击红色错误日志查看详细分析</strong></li>
        </ol>
      </div>
    </div>
  )
}

export default App
