/**
 * 网易号适配器
 *
 * 登录检测使用网易号官方接口，发布采用「编辑器辅助」方式：
 * 网易号未公开草稿保存接口，社区工具均通过浏览器操作编辑器完成，
 * 因此这里打开网易号发布页并自动填充标题与正文，由用户确认后存草稿。
 *
 * 参考 wechatsync 驱动（Mp163）：GET https://mp.163.com/wemedia/navinfo.do
 */
import { EditorAssistAdapter, type EditorAssistConfig } from '../editor-assist'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { PublishOptions } from '../types'
import { createLogger } from '../../lib/logger'

const logger = createLogger('Netease')

interface WemediaInfo {
  wemediaId?: string
  tname?: string
  icon?: string
}

export class NeteaseAdapter extends EditorAssistAdapter {
  readonly meta: PlatformMeta = {
    id: 'netease',
    name: '网易号',
    icon: 'https://mp.163.com/favicon.ico',
    homepage: 'https://mp.163.com',
    capabilities: ['article'],
    category: '通用',
    experimental: true,
    syncMode: 'editor',
  }

  readonly editorConfig: EditorAssistConfig = {
    editorUrl: 'https://mp.163.com/index.html#/article/add',
    titleSelectors: [
      'input[placeholder*="标题"]',
      'textarea[placeholder*="标题"]',
      'input[class*="title"]'
    ],
    editorSelectors: [
      '.ProseMirror[contenteditable="true"]',
      '[contenteditable="true"][class*="editor"]',
      '[contenteditable="true"][class*="content"]',
      'div[contenteditable="true"]'
    ],
    hint: '已打开网易号发布页并填充内容，请确认后保存草稿或发布',
    waitBeforeFill: 4000,
  }

  private account: WemediaInfo | null = null

  async checkAuth(): Promise<AuthResult> {
    try {
      const res = await this.get<{ code?: number; data?: WemediaInfo }>(
        `https://mp.163.com/wemedia/navinfo.do?_=${Date.now()}`
      )

      if (res?.code !== 1 || !res.data) {
        return { isAuthenticated: false }
      }

      this.account = res.data

      return {
        isAuthenticated: true,
        userId: res.data.wemediaId ? String(res.data.wemediaId) : undefined,
        username: res.data.tname,
        avatar: res.data.icon,
      }
    } catch (error) {
      logger.debug('checkAuth failed:', error)
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    return this.openEditorAndFill(article, options)
  }
}
