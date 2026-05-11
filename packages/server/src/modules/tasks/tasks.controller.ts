/**
 * 任务控制器
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common'
import { TasksService } from './tasks.service.js'
import { CreateTaskDto } from './dto/create-task.dto.js'
import { UpdateTaskDto } from './dto/update-task.dto.js'
import { RunTaskDto } from './dto/run-task.dto.js'

@Controller('api/tasks')
export class TasksController {
  constructor(
    @Inject(TasksService) private readonly tasksService: TasksService,
  ) {}

  @Get()
  findAll() {
    return this.tasksService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id)
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.tasksService.delete(id)
  }

  @Post(':id/run')
  run(@Param('id') id: string, @Body() runTaskDto: RunTaskDto) {
    return this.tasksService.run(id, runTaskDto.clientId)
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.tasksService.cancel(id)
  }

  @Get(':id/reports')
  getReports(@Param('id') id: string) {
    return this.tasksService.getReports(id)
  }
}
