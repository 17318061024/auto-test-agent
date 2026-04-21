/**
 * 创建任务 DTO
 */

import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject } from 'class-validator'

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsString()
  @IsNotEmpty()
  script: string

  @IsArray()
  @IsOptional()
  steps?: any[]

  @IsObject()
  @IsOptional()
  config?: Record<string, any>
}
