/**
 * Mock 任务示例
 */

export const MOCK_TASKS = [
  {
    id: 'task_mock_001',
    name: 'Google 搜索华为',
    description: '打开 Google 页面，搜索"华为"，点击 AI 模式按钮',
    script: `1. 打开页面 https://www.google.com/webhp
2. 在搜索框中输入"华为"
3. 点击搜索按钮
4. 点击 AI 模式按钮`,
    steps: [
      {
        id: 'step_1',
        action: 'navigate',
        params: {
          url: 'https://www.google.com/webhp',
        },
        description: '打开 Google 页面',
      },
      {
        id: 'step_2',
        action: 'input',
        params: {
          selector: 'textarea[name="q"]',
          value: '华为',
        },
        description: '在搜索框中输入"华为"',
      },
      {
        id: 'step_3',
        action: 'click',
        params: {
          selector: 'input[value="Google 搜索"]',
        },
        description: '点击搜索按钮',
      },
      {
        id: 'step_4',
        action: 'wait',
        params: {
          duration: 2000,
        },
        description: '等待结果加载',
      },
    ],
    config: {
      timeout: 30000,
      retries: 3,
      headless: false,
    },
    status: 'pending' as const,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

export async function getMockTask(taskId: string) {
  return MOCK_TASKS.find((task) => task.id === taskId)
}

export async function getAllMockTasks() {
  return MOCK_TASKS
}
