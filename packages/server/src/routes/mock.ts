/**
 * @auto-test-agent/server
 *
 * Mock 任务 API 路由
 */

import { Router } from 'express'
import { MOCK_TASKS, getMockTask } from '../mock/tasks.js'
import { MockTaskExecutor } from '../mock/executor.js'

export function createMockRoutes(wsHandler: any): Router {
  const router = Router()

  // 获取所有 Mock 任务
  router.get('/', (req, res) => {
    res.json(MOCK_TASKS)
  })

  // 获取特定 Mock 任务
  router.get('/:id', (req, res) => {
    const task = MOCK_TASKS.find((t) => t.id === req.params.id)
    if (!task) {
      return res.status(404).json({ error: '任务不存在' })
    }
    res.json(task)
  })

  // 执行 Mock 任务
  router.post('/:id/execute', async (req, res) => {
    const task = MOCK_TASKS.find((t) => t.id === req.params.id)
    if (!task) {
      return res.status(404).json({ error: '任务不存在' })
    }

    console.log('\n🚀 开始执行 Mock 任务:', task.name)
    console.log('📋 任务描述:', task.description)

    const executor = new MockTaskExecutor({
      onProgress: (step, total, message) => {
        console.log(`\n⏳ 进度: ${step}/${total} - ${message}`)
        // 广播进度到所有连接的客户端
        wsHandler?.emit?.('task:progress', {
          taskId: task.id,
          currentStep: step,
          totalSteps: total,
          message,
        })
      },
      onComplete: (result) => {
        console.log('\n✅ 任务执行完成!')
        console.log('📊 结果:', JSON.stringify(result, null, 2))

        // 广播完成事件
        wsHandler?.emit?.('task:completed', result)
      },
      onError: (error) => {
        console.error('\n❌ 任务执行失败:', error)

        // 广播错误事件
        wsHandler?.emit?.('task:failed', {
          taskId: task.id,
          error: error.message,
        })
      },
    })

    try {
      const result = await executor.executeTask(task)
      res.json({
        success: true,
        result,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  })

  return router
}
