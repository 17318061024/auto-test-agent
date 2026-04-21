/**
 * Mock 服务
 */

import { Injectable } from '@nestjs/common'

@Injectable()
export class MockService {
  getMockTask() {
    return {
      id: 'mock-task-1',
      name: '搜索华为',
      description: '在 Google 上搜索"华为"并验证结果',
      script: `// 在 Google 上搜索"华为"
await open('https://www.google.com/webhp')
await fill('input[name="q"]', '华为')
await click('input[type="submit"]')
await waitForSelector('#search')`,
      steps: [
        { action: 'open', params: ['https://www.google.com/webhp'] },
        { action: 'fill', params: ['input[name="q"]', '华为'] },
        { action: 'click', params: ['input[type="submit"]'] },
        { action: 'waitForSelector', params: ['#search'] },
      ],
      config: {
        timeout: 30000,
        retries: 3,
      },
      status: 'pending' as const,
    }
  }
}
