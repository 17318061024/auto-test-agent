/**
 * 任务存储服务
 */

import { Injectable } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'

export interface Task {
  id: string
  name: string
  description: string
  script: string
  steps: any[]
  config: Record<string, any>
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}

@Injectable()
export class TaskService {
  private tasks: Map<string, Task> = new Map()

  create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const task: Task = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.tasks.set(task.id, task)
    return task
  }

  findAll(): Task[] {
    return Array.from(this.tasks.values())
  }

  findOne(id: string): Task | undefined {
    return this.tasks.get(id)
  }

  update(id: string, data: Partial<Task>): Task | undefined {
    const task = this.tasks.get(id)
    if (!task) return undefined

    const updatedTask = {
      ...task,
      ...data,
      id: task.id, // 确保 ID 不被修改
      updatedAt: new Date().toISOString(),
    }
    this.tasks.set(id, updatedTask)
    return updatedTask
  }

  updateStatus(id: string, status: Task['status']): Task | undefined {
    return this.update(id, { status })
  }

  delete(id: string): boolean {
    return this.tasks.delete(id)
  }

  remove(): void {
    this.tasks.clear()
  }
}
