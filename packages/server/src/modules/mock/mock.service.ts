/**
 * Mock 服务
 */

import { Injectable } from '@nestjs/common'

@Injectable()
export class MockService {
  getMockTask() {
    return {
      id: 'mock-task-1',
      name: '百度搜索测试',
      description: '在百度上搜索"华为"并验证结果',
      script: `// 在百度上搜索"华为"
await open('https://www.baidu.com')
await aiInput('搜索输入框', '华为')
await aiTap('百度一下搜索按钮')
await aiWaitFor('搜索结果已加载')`,
      steps: [
        { action: 'open', params: ['https://www.baidu.com'], description: '打开百度首页' },
        { action: 'aiInput', params: ['搜索输入框', '华为'], description: '在搜索框中输入"华为"' },
        { action: 'aiTap', params: ['百度一下搜索按钮'], description: '点击搜索按钮' },
        { action: 'aiWaitFor', params: ['搜索结果已加载'], description: '等待搜索结果出现' },
      ],
      config: {
        timeout: 30000,
        retries: 1,
      },
      status: 'pending' as const,
    }
  }
}
