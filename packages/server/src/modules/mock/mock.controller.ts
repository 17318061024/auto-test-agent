/**
 * Mock 控制器
 */

import { Controller, Get } from '@nestjs/common'
import { MockService } from './mock.service.js'

@Controller('api/mock')
export class MockController {
  constructor(private readonly mockService: MockService) {}

  @Get()
  getMockTask() {
    return this.mockService.getMockTask()
  }
}
