/**
 * NestJS 应用主模块
 */

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TasksModule } from './modules/tasks/tasks.module.js'
import { ClientsModule } from './modules/clients/clients.module.js'
import { ReportsModule } from './modules/reports/reports.module.js'
import { MockModule } from './modules/mock/mock.module.js'
import { WebsocketModule } from './modules/websocket/websocket.module.js'
import { StorageModule } from './modules/storage/storage.module.js'
import { HealthController } from './modules/health/health.controller.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    StorageModule,
    WebsocketModule,
    TasksModule,
    ClientsModule,
    ReportsModule,
    MockModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
