import type { Cookie, HeaderRule } from '../types'

/**
 * 运行时接口抽象
 * 支持在浏览器扩展和 Node.js 环境中复用核心逻辑
 */
export interface RuntimeInterface {
  /** 运行时类型标识 */
  readonly type: 'extension' | 'node'

  /**
   * HTTP 请求
   * 在扩展环境自动携带 cookies，Node 环境需手动管理
   */
  fetch(url: string, options?: RequestInit): Promise<Response>

  /**
   * Cookie 管理
   */
  cookies: {
    get(domain: string): Promise<Cookie[]>
    set(cookie: Cookie): Promise<void>
    remove(name: string, domain: string): Promise<void>
  }

  /**
   * 获取单个 Cookie 值（便捷方法）
   * @param domain Cookie 域名
   * @param name Cookie 名称
   * @returns Cookie 值，不存在返回 null
   */
  getCookie?(domain: string, name: string): Promise<string | null>

  /**
   * 持久化存储
   */
  storage: {
    get<T>(key: string): Promise<T | null>
    set<T>(key: string, value: T): Promise<void>
    remove(key: string): Promise<void>
  }

  /**
   * 会话存储 (扩展重启后清空)
   */
  session: {
    get<T>(key: string): Promise<T | null>
    set<T>(key: string, value: T): Promise<void>
  }

  /**
   * Header 规则管理 (用于请求拦截)
   * 仅扩展环境支持
   */
  headerRules?: {
    add(rule: HeaderRule): Promise<string>
    remove(ruleId: string): Promise<void>
    clear(): Promise<void>
  }

  /**
   * 文件下载（仅扩展环境支持）
   */
  downloads?: {
    /**
     * 下载文件
     * @param blob 文件内容
     * @param filename 文件名
     * @param saveAs 是否弹出保存对话框
     * @returns 下载 ID
     */
    download(blob: Blob, filename: string, saveAs?: boolean): Promise<number>
  }

  /**
   * Tab 管理（仅扩展环境支持）
   */
  tabs?: {
    /**
     * 查找匹配 URL 的 tab
     */
    query(urlPattern: string): Promise<Array<{ id: number; url?: string }>>
    /**
     * 创建新 tab
     */
    create(url: string, active?: boolean): Promise<{ id: number }>
    /**
     * 等待 tab 加载完成
     */
    waitForLoad(tabId: number, timeout?: number): Promise<void>
    /**
     * 在 tab 的页面上下文中执行函数
     * @param tabId Tab ID
     * @param func 要执行的函数
     * @param args 函数参数
     * @returns 函数执行结果
     */
    executeScript<T, A extends unknown[]>(
      tabId: number,
      func: (...args: A) => T | Promise<T>,
      args: A
    ): Promise<T>
  }

  /**
   * DOM 操作
   * 扩展环境通过 Offscreen Document 实现
   * Node 环境使用 jsdom 或类似库
   */
  dom: {
    parseHTML(html: string): Promise<Document>
    querySelector(doc: Document, selector: string): Element | null
    querySelectorAll(doc: Document, selector: string): Element[]
    getTextContent(element: Element): string
    getInnerHTML(element: Element): string
  }
}

/**
 * 创建运行时的工厂函数类型
 */
export type RuntimeFactory = (config?: RuntimeConfig) => RuntimeInterface

/**
 * 运行时配置
 */
export interface RuntimeConfig {
  /** Node 环境：预加载的 cookies */
  cookies?: Record<string, Cookie[]>
  /** 请求超时时间 (ms) */
  timeout?: number
  /** 用户代理 */
  userAgent?: string
}
