import { IsOptional, IsString } from 'class-validator'

export class RunTaskDto {
  @IsString()
  @IsOptional()
  clientId?: string
}
