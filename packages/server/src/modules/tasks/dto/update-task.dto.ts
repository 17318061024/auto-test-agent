/**
 * 更新任务 DTO
 */

import { IsString, IsArray, IsObject, IsOptional, IsEnum } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'
import { CreateTaskDto } from './create-task.dto.js'

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsEnum(['pending', 'running', 'completed', 'failed'])
  @IsOptional()
  status?: 'pending' | 'running' | 'completed' | 'failed'
}
