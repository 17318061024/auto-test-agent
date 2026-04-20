/**
 * 页面上下文管理
 *
 * 功能：
 * 1. 保持 Page 对象
 * 2. 保持 Session（cookies, localStorage）
 * 3. 跨页面导航
 */

export class PageContext {
  private page: any // Playwright Page 对象
  private context: any // Playwright BrowserContext 对象
  private sessionData: Map<string, any> = new Map()

  constructor(page: any, context: any) {
    this.page = page
    this.context = context
  }

  /**
   * 保存 Session
   */
  async saveSession(): Promise<void> {
    // 保存 Cookies
    const cookies = await this.context.cookies()
    this.sessionData.set('cookies', cookies)

    // 保存 LocalStorage
    const localStorage = await this.page.evaluate(`() => {
      const storage = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          storage[key] = localStorage.getItem(key) || '';
        }
      }
      return storage;
    }`)
    this.sessionData.set('localStorage', localStorage)

    // 保存 SessionStorage
    const sessionStorage = await this.page.evaluate(`() => {
      const storage = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          storage[key] = sessionStorage.getItem(key) || '';
        }
      }
      return storage;
    }`)
    this.sessionData.set('sessionStorage', sessionStorage)

    console.log('✅ Session 已保存')
  }

  /**
   * 恢复 Session
   */
  async restoreSession(): Promise<void> {
    // 恢复 Cookies
    const cookies = this.sessionData.get('cookies')
    if (cookies) {
      await this.context.addCookies(cookies)
    }

    // 恢复 LocalStorage
    const localStorage = this.sessionData.get('localStorage')
    if (localStorage) {
      const script = `(data) => {
        const win = window;
        for (const [key, value] of Object.entries(data)) {
          win.localStorage.setItem(key, value);
        }
      }`
      await this.page.evaluate(script, localStorage)
    }

    // 恢复 SessionStorage
    const sessionStorage = this.sessionData.get('sessionStorage')
    if (sessionStorage) {
      const script = `(data) => {
        const win = window;
        for (const [key, value] of Object.entries(data)) {
          win.sessionStorage.setItem(key, value);
        }
      }`
      await this.page.evaluate(script, sessionStorage)
    }

    console.log('✅ Session 已恢复')
  }

  /**
   * 清除 Session
   */
  async clearSession(): Promise<void> {
    await this.context.clearCookies()
    await this.page.evaluate(`() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    }`)
    this.sessionData.clear()
    console.log('✅ Session 已清除')
  }

  /**
   * 获取页面
   */
  getPage(): any {
    return this.page
  }

  /**
   * 获取上下文
   */
  getContext(): any {
    return this.context
  }

  /**
   * 导航到新 URL
   */
  async navigate(url: string): Promise<void> {
    console.log(`🔗 导航到: ${url}`)
    await this.page.goto(url)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * 等待页面加载完成
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * 设置自定义数据
   */
  set(key: string, value: any): void {
    this.sessionData.set(key, value)
  }

  /**
   * 获取自定义数据
   */
  get(key: string): any {
    return this.sessionData.get(key)
  }

  /**
   * 检查是否有自定义数据
   */
  has(key: string): boolean {
    return this.sessionData.has(key)
  }
}
