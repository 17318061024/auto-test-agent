/**
 * 错误处理中间件
 */

import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 记录错误日志
  logger.error(`错误: ${error.message}`, error, {
    path: req.path,
    method: req.method,
    ip: req.ip,
  })

  // 判断是否为操作错误（可预期的错误）
  const isOperational = error.isOperational ?? false

  // 开发环境返回详细错误信息
  const isDevelopment = process.env.NODE_ENV === 'development'

  const statusCode = error.statusCode || 500
  const message = isOperational || isDevelopment ? error.message : '内部服务器错误'

  res.status(statusCode).json({
    error: message,
    ...(isDevelopment && {
      stack: error.stack,
      details: error,
    }),
    timestamp: Date.now(),
  })
}

export function notFoundHandler(req: Request, res: Response): void {
  logger.warn(`路径未找到: ${req.method} ${req.path}`)

  res.status(404).json({
    error: '路径未找到',
    path: req.path,
    method: req.method,
    timestamp: Date.now(),
  })
}

/**
 * 创建操作错误（可预期的错误）
 */
export function createOperationalError(message: string, statusCode: number = 400): AppError {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.isOperational = true
  return error
}

/**
 * 包装异步路由处理器以自动捕获错误
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
