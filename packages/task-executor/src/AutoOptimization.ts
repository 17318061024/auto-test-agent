/**
 * 自动优化模块
 *
 * 功能：
 * 1. 检测页面加载状态（Network Idle）
 * 2. 智能重试机制（最多3次）
 * 3. 补偿策略：等待 2 秒、刷新页面
 */

export interface NetworkIdleOptions {
  timeout?: number
  idleTime?: number
}

export interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  strategies?: Array<'wait' | 'refresh' | 'retry'>
}

export class AutoOptimization {
  private page: any // Playwright Page 对象

  constructor(page: any) {
    this.page = page
  }

  /**
   * 等待网络空闲
   */
  async waitForNetworkIdle(options: NetworkIdleOptions = {}): Promise<void> {
    const { timeout = 30000, idleTime = 2000 } = options

    try {
      // 等待页面网络空闲
      await this.page.waitForLoadState('networkidle', { timeout, idleTime })
      console.log('✅ 网络已空闲')
    } catch (error) {
      console.log('⚠️  等待网络空闲超时')
      throw error
    }
  }

  /**
   * 智能重试
   */
  async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<{ success: boolean; result?: T; error?: Error }> {
    const {
      maxRetries = 3,
      retryDelay = 2000,
      strategies = ['wait', 'retry'],
    } = options

    let lastError: Error | undefined

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`尝试执行第 ${attempt + 1}/${maxRetries} 次`)

        const result = await fn()
        console.log('✅ 执行成功')
        return { success: true, result }
      } catch (error) {
        lastError = error as Error
        console.log(`❌ 第 ${attempt + 1} 次尝试失败:`, error)

        // 如果是最后一次尝试，不再重试
        if (attempt === maxRetries - 1) {
          console.log('已达最大重试次数，放弃')
          break
        }

        // 执行补偿策略
        for (const strategy of strategies) {
          console.log(`执行补偿策略: ${strategy}`)

          switch (strategy) {
            case 'wait':
              await this.wait(retryDelay)
              break
            case 'refresh':
              await this.refresh()
              await this.wait(retryDelay)
              break
            case 'retry':
              // 直接重试，不做额外操作
              break
          }
        }
      }
    }

    return { success: false, error: lastError }
  }

  /**
   * 等待指定时间
   */
  private async wait(ms: number): Promise<void> {
    console.log(`⏳ 等待 ${ms}ms`)
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 刷新页面
   */
  private async refresh(): Promise<void> {
    console.log('🔄 刷新页面')
    await this.page.reload()
  }

  /**
   * 检查页面加载状态
   */
  async checkPageLoadState(): Promise<{
    loaded: boolean
    networkIdle: boolean
    domReady: boolean
  }> {
    try {
      const loaded = await this.page.evaluate(`() => document.readyState === 'complete'`)

      // 检查网络状态
      let networkIdle = false
      try {
        await this.page.waitForLoadState('networkidle', { timeout: 5000 })
        networkIdle = true
      } catch {
        networkIdle = false
      }

      // 检查 DOM 是否就绪
      const domReady = await this.page.evaluate(`() => document.readyState !== 'loading'`)

      return {
        loaded,
        networkIdle,
        domReady,
      }
    } catch (error) {
      console.log('检查页面状态失败:', error)
      return {
        loaded: false,
        networkIdle: false,
        domReady: false,
      }
    }
  }

  /**
   * 等待元素可交互
   */
  async waitForElementSelector(
    selector: string,
    options: { timeout?: number; state?: 'visible' | 'attached' | 'hidden' } = {}
  ): Promise<boolean> {
    const { timeout = 10000, state = 'visible' } = options

    try {
      await this.page.waitForSelector(selector, { timeout, state })
      console.log(`✅ 元素已就绪: ${selector}`)
      return true
    } catch (error) {
      console.log(`⚠️  元素未就绪: ${selector}`)
      return false
    }
  }

  /**
   * 智能等待元素
   */
  async smartWait(
    selector: string,
    options: { timeout?: number; retryInterval?: number } = {}
  ): Promise<boolean> {
    const { timeout = 10000, retryInterval = 500 } = options
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const exists = await this.page.locator(selector).count() > 0
      if (exists) {
        return true
      }
      await this.wait(retryInterval)
    }

    return false
  }

  /**
   * 预加载页面资源
   */
  async preloadResources(): Promise<void> {
    // 预加载常见资源
    const resourcesToPreload = [
      'script',
      'stylesheet',
      'font',
    ]

    await this.page.evaluate((resources: string[]) => {
      resources.forEach((type) => {
        // 预加载逻辑
        console.log(`预加载资源类型: ${type}`)
      })
    }, resourcesToPreload)
  }

  /**
   * 优化页面性能
   */
  async optimizePage(): Promise<void> {
    // 禁用不必要的功能
    await this.page.addInitScript(`
      () => {
        // 禁用动画
        const style = document.createElement('style');
        style.textContent = \`
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-delay: 0.01ms !important;
            transition-duration: 0.01ms !important;
            transition-delay: 0.01ms !important;
          }
        \`;
        document.head ? document.head.appendChild(style) : null;

        // 禁用图片懒加载
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach((img) => {
          img.removeAttribute('loading');
        });
      }
    `)

    console.log('✅ 页面性能优化完成')
  }

  /**
   * 监控页面性能
   */
  async monitorPerformance(): Promise<{
    loadTime: number
    domContentLoaded: number
    firstPaint: number
    firstContentfulPaint: number
  }> {
    const metrics = await this.page.evaluate(() => {
      const entries = (performance as any).getEntries()
      const navigation = entries.find((entry: any) => entry.entryType === 'navigation') as any

      if (!navigation) {
        return {
          loadTime: 0,
          domContentLoaded: 0,
          firstPaint: 0,
          firstContentfulPaint: 0,
        }
      }

      return {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstPaint: 0, // 需要使用 PerformanceObserver
        firstContentfulPaint: 0, // 需要使用 PerformanceObserver
      }
    })

    return metrics
  }
}
