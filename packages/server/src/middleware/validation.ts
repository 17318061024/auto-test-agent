/**
 * 请求验证中间件
 */

import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

export class ValidationError extends Error {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validateTaskCreation(req: Request, res: Response, next: NextFunction): void {
  const { name, script, steps } = req.body

  const errors: Record<string, string> = {}

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.name = '任务名称不能为空'
  }

  if (!script || typeof script !== 'string' || script.trim().length === 0) {
    errors.script = '任务脚本不能为空'
  }

  if (steps && !Array.isArray(steps)) {
    errors.steps = '步骤必须是数组'
  }

  if (Object.keys(errors).length > 0) {
    logger.warn('任务创建验证失败', { errors })
    res.status(400).json({
      error: '请求数据验证失败',
      fields: errors,
    })
    return
  }

  next()
}

export function validateTaskUpdate(req: Request, res: Response, next: NextFunction): void {
  const { name, script, steps, status } = req.body

  const errors: Record<string, string> = {}

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    errors.name = '任务名称不能为空'
  }

  if (script !== undefined && (typeof script !== 'string' || script.trim().length === 0)) {
    errors.script = '任务脚本不能为空'
  }

  if (steps !== undefined && !Array.isArray(steps)) {
    errors.steps = '步骤必须是数组'
  }

  if (status !== undefined && !['pending', 'running', 'completed', 'failed', 'cancelled'].includes(status)) {
    errors.status = '无效的任务状态'
  }

  if (Object.keys(errors).length > 0) {
    logger.warn('任务更新验证失败', { errors })
    res.status(400).json({
      error: '请求数据验证失败',
      fields: errors,
    })
    return
  }

  next()
}

export function validateClientRegistration(req: Request, res: Response, next: NextFunction): void {
  const { name, version, platform } = req.body

  const errors: Record<string, string> = {}

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.name = '客户端名称不能为空'
  }

  if (!version || typeof version !== 'string' || version.trim().length === 0) {
    errors.version = '客户端版本不能为空'
  }

  if (!platform || typeof platform !== 'string' || platform.trim().length === 0) {
    errors.platform = '客户端平台不能为空'
  }

  if (Object.keys(errors).length > 0) {
    logger.warn('客户端注册验证失败', { errors })
    res.status(400).json({
      error: '请求数据验证失败',
      fields: errors,
    })
    return
  }

  next()
}

export function handleValidationError(error: Error, req: Request, res: Response, next: NextFunction): void {
  if (error instanceof ValidationError) {
    logger.warn('验证错误', { message: error.message, fields: error.fields })
    res.status(400).json({
      error: error.message,
      fields: error.fields,
    })
  } else {
    next(error)
  }
}
