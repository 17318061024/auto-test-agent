/**
 * 任务 API 路由
 */

import { Router } from 'express'
import { TaskStore } from '../storage/TaskStore.js'
import { ReportStore } from '../storage/ReportStore.js'
import { WSHandler } from '../websocket/handler.js'
import { validateTaskCreation, validateTaskUpdate } from '../middleware/validation.js'
import { logger } from '../utils/logger.js'

export function createTasksRouter(wsHandler: WSHandler): Router {
  const router = Router()
  const taskStore = new TaskStore()
  const reportStore = new ReportStore()

  // 获取所有任务
  router.get('/', (req, res) => {
    const tasks = taskStore.getAll()
    res.json(tasks)
  })

  // 获取单个任务
  router.get('/:id', (req, res) => {
    const task = taskStore.get(req.params.id)
    if (!task) {
      return res.status(404).json({ error: '任务不存在' })
    }
    res.json(task)
  })

  // 创建任务
  router.post('/', validateTaskCreation, (req, res) => {
    try {
      const task = taskStore.create({
        name: req.body.name,
        description: req.body.description,
        script: req.body.script,
        steps: req.body.steps,
        config: req.body.config || {},
        status: 'pending',
      })

      logger.taskStart(task.id, task.name)
      res.status(201).json(task)
    } catch (error) {
      logger.error('创建任务失败', error as Error)
      res.status(400).json({ error: '创建任务失败' })
    }
  })

  // 更新任务
  router.put('/:id', validateTaskUpdate, (req, res) => {
    const task = taskStore.update(req.params.id, req.body)
    if (!task) {
      return res.status(404).json({ error: '任务不存在' })
    }
    res.json(task)
  })

  // 删除任务
  router.delete('/:id', (req, res) => {
    const deleted = taskStore.delete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ error: '任务不存在' })
    }
    res.status(204).send()
  })

  // 运行任务
  router.post('/:id/run', (req, res) => {
    const task = taskStore.get(req.params.id)
    if (!task) {
      return res.status(404).json({ error: '任务不存在' })
    }

    // 获取在线客户端
    const clients = wsHandler.getOnlineClients()
    if (clients.length === 0) {
      return res.status(400).json({ error: '没有可用的客户端' })
    }

    // 分配任务给第一个在线客户端
    const client = clients[0]
    wsHandler.assignTask(client.id, task)

    // 更新任务状态
    taskStore.updateStatus(task.id, 'running')

    res.json({
      message: '任务已分配',
      taskId: task.id,
      clientId: client.id,
    })
  })

  // 取消任务
  router.post('/:id/cancel', (req, res) => {
    const task = taskStore.get(req.params.id)
    if (!task) {
      return res.status(404).json({ error: '任务不存在' })
    }

    if (task.status !== 'running') {
      return res.status(400).json({ error: '任务未在运行中' })
    }

    // TODO: 实现取消逻辑
    res.json({ message: '任务已取消' })
  })

  // 获取任务报告
  router.get('/:id/reports', (req, res) => {
    const reports = reportStore.getByTaskId(req.params.id)
    res.json(reports)
  })

  return router
}
