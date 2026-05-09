/**
 * 健康检查控制器
 */

import { Controller, Get, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Controller()
export class HealthController {
  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      version: process.env.npm_package_version || '0.1.0',
      timestamp: Date.now(),
      uptime: process.uptime(),
      environment: this.configService.get('NODE_ENV', 'development'),
      server: {
        http: `http://localhost:${this.configService.get('PORT', '3000')}`,
        ws: `ws://localhost:${this.configService.get('WS_PORT', '3001')}`,
      }
    }
  }
}
