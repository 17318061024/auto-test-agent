/**
 * 任务存储 (内存存储，生产环境请使用真实数据库)
 */

// 本地类型定义（临时）
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface TaskConfig {
  timeout?: number
  retries?: number
  headless?: boolean
}

export interface Task {
  id: string
  name: string
  description?: string
  script: string
  steps?: any[]
  config: TaskConfig
  status: TaskStatus
  createdAt: number
  updatedAt: number
}

export class TaskStore {
  private tasks: Map<string, Task> = new Map()

  constructor() {
    // 内存存储
  }

  /**
   * 创建任务
   */
  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const id = this.generateId()
    const now = Date.now()

    const newTask: Task = {
      id,
      ...task,
      createdAt: now,
      updatedAt: now,
    }

    this.tasks.set(id, newTask)
    return newTask
  }

  /**
   * 获取任务
   */
  get(id: string): Task | undefined {
    return this.tasks.get(id)
  }

  /**
   * 获取所有任务
   */
  getAll(): Task[] {
    return Array.from(this.tasks.values()).sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * 根据状态获取任务
   */
  getByStatus(status: TaskStatus): Task[] {
    return this.getAll().filter((task) => task.status === status)
  }

  /**
   * 更新任务
   */
  update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | undefined {
    const existing = this.tasks.get(id)
    if (!existing) return undefined

    const updated: Task = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    }

    this.tasks.set(id, updated)
    return updated
  }

  /**
   * 删除任务
   */
  delete(id: string): boolean {
    return this.tasks.delete(id)
  }

  /**
   * 更新任务状态
   */
  updateStatus(id: string, status: TaskStatus): Task | undefined {
    return this.update(id, { status })
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  close(): void {
    this.tasks.clear()
  }
}
