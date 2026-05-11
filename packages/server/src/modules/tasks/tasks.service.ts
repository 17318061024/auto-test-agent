/**
 * 任务服务
 */

import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common'
import { TaskService } from '../storage/task.service.js'
import { ClientService } from '../storage/client.service.js'
import { ReportService } from '../storage/report.service.js'
import { SocketGateway } from '../websocket/socket.gateway.js'
import { CreateTaskDto } from './dto/create-task.dto.js'
import { UpdateTaskDto } from './dto/update-task.dto.js'
import { logger } from '../../utils/logger.js'

@Injectable()
export class TasksService {
  constructor(
    @Inject(TaskService) private readonly taskService: TaskService,
    @Inject(ClientService) private readonly clientService: ClientService,
    @Inject(ReportService) private readonly reportService: ReportService,
    @Inject(SocketGateway) private readonly socketGateway: SocketGateway,
  ) {}

  create(createTaskDto: CreateTaskDto) {
    try {
      const task = this.taskService.create({
        ...createTaskDto,
        status: 'pending',
        steps: createTaskDto.steps || [],
        config: createTaskDto.config || {},
      })

      logger.taskStart(task.id, task.name)
      return task
    } catch (error) {
      logger.error('创建任务失败', error as Error)
      throw new BadRequestException('创建任务失败')
    }
  }

  findAll() {
    return this.taskService.findAll()
  }

  findOne(id: string) {
    const task = this.taskService.findOne(id)
    if (!task) {
      throw new NotFoundException('任务不存在')
    }
    return task
  }

  update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = this.taskService.update(id, updateTaskDto)
    if (!task) {
      throw new NotFoundException('任务不存在')
    }
    return task
  }

  delete(id: string) {
    const deleted = this.taskService.delete(id)
    if (!deleted) {
      throw new NotFoundException('任务不存在')
    }
  }

  run(id: string, clientId?: string) {
    const task = this.taskService.findOne(id)
    if (!task) {
      throw new NotFoundException('任务不存在')
    }

    let targetClient

    if (clientId) {
      // 指定客户端
      targetClient = this.clientService.findOnlineById(clientId)
      if (!targetClient) {
        throw new BadRequestException('指定的客户端不在线或不存在')
      }
    } else {
      // 自动选择第一个在线客户端
      const clients = this.socketGateway.getOnlineClients()
      if (clients.length === 0) {
        throw new BadRequestException('没有可用的客户端')
      }
      targetClient = clients[0]
    }

    // 检查该客户端是否已在执行任务
    const busyTasks = this.taskService.findAll().filter(
      t => t.assignedClientId === targetClient.id && t.status === 'running',
    )
    if (busyTasks.length > 0) {
      throw new BadRequestException('该客户端正在执行其他任务')
    }

    // 分配任务
    this.clientService.updateStatus(targetClient.id, 'busy')
    this.taskService.update(id, { status: 'running', assignedClientId: targetClient.id })
    this.socketGateway.assignTask(targetClient.id, task)

    return {
      message: '任务已分配',
      taskId: task.id,
      clientId: targetClient.id,
      clientName: targetClient.name,
    }
  }

  cancel(id: string) {
    const task = this.taskService.findOne(id)
    if (!task) {
      throw new NotFoundException('任务不存在')
    }

    if (task.status !== 'running') {
      throw new BadRequestException('任务未在运行中')
    }

    // TODO: 实现取消逻辑
    return { message: '任务已取消' }
  }

  getReports(id: string) {
    return this.reportService.findByTaskId(id)
  }
}
