/**
 * 报告 API 路由
 */

import { Router } from 'express'
import { ReportStore } from '../storage/ReportStore.js'

export function createReportsRouter(): Router {
  const router = Router()
  const reportStore = new ReportStore()

  // 获取所有报告
  router.get('/', (req, res) => {
    const reports = reportStore.getAll()
    res.json(reports)
  })

  // 获取单个报告
  router.get('/:id', (req, res) => {
    const report = reportStore.get(req.params.id)
    if (!report) {
      return res.status(404).json({ error: '报告不存在' })
    }
    res.json(report)
  })

  return router
}
