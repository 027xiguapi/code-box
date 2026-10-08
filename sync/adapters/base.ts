import type { Article, AuthResult, SyncResult, PlatformMeta } from '../types'
import type { RuntimeInterface } from '../runtime/interface'
import type { PlatformAdapter } from './types'

/**
 * 适配器基类
 * 提供通用的请求处理和模板解析
 */
export abstract class BaseAdapter implements PlatformAdapter {
  abstract readonly meta: PlatformMeta
  protected runtime!: RuntimeInterface
  protected context: Record<string, unknown> = {}

  async init(runtime: RuntimeInterface): Promise<void> {
    this.runtime = runtime
  }

  abstract checkAuth(): Promise<AuthResult>
  abstract publish(article: Article): Promise<SyncResult>

  /**
   * 发送请求
   */
  protected async request<T = unknown>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await this.runtime.fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return response.json()
    }

    return response.text() as T
  }

  /**
   * 带重试的请求
   */
  protected async requestWithRetry<T = unknown>(
    url: string,
    options: RequestInit = {},
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error | null = null

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.request<T>(url, options)
      } catch (error) {
        lastError = error as Error
        if (i < maxRetries - 1) {
          await this.delay(1000 * (i + 1))
        }
      }
    }

    throw lastError
  }

  /**
   * 延迟
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 创建同步结果
   */
  protected createResult(
    success: boolean,
    data?: Partial<SyncResult>
  ): SyncResult {
    return {
      platform: this.meta.id,
      success,
      timestamp: Date.now(),
      ...data,
    }
  }
}
