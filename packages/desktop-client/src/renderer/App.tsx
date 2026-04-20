/**
 * 桌面客户端主应用
 */

import { useState, useEffect } from 'react'

function App() {
  const [status, setStatus] = useState<'disconnected' | 'connected'>('disconnected')
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    // TODO: 连接 WebSocket
    console.log('初始化桌面客户端')
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">auto-test-agent</h1>
              <p className="text-sm text-gray-600">桌面客户端</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  status === 'connected'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {status === 'connected' ? '已连接' : '未连接'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 任务列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">任务列表</h2>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无任务
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <h3 className="font-medium">{task.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 状态信息 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">系统状态</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">服务器</span>
                  <span className="text-sm font-medium">localhost:3000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">版本</span>
                  <span className="text-sm font-medium">0.1.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">平台</span>
                  <span className="text-sm font-medium">Windows</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
