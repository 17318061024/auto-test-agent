/**
 * Mock 控制器
 */

import { Controller, Get, Inject } from '@nestjs/common'
import { MockService } from './mock.service.js'

@Controller('api/mock')
export class MockController {
  constructor(@Inject(MockService) private readonly mockService: MockService) {}

  @Get()
  getMockTask() {
    return this.mockService.getMockTask()
  }
}
