/**
 * 小红书适配器
 *
 * 小红书创作者平台的发布接口需要 x-s / x-t 浏览器端签名，
 * 直接调用会被风控拦截，因此采用「编辑器辅助」方式：
 * 打开「写长文」编辑器并自动填充标题与正文，由用户确认后发布。
 *
 * 登录检测：GET https://creator.xiaohongshu.com/api/galaxy/user/info
 */
import { EditorAssistAdapter, type EditorAssistConfig } from '../editor-assist'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { PublishOptions } from '../types'
import { createLogger } from '../../lib/logger'

const logger = createLogger('Xiaohongshu')

interface XhsUserInfo {
  userId?: string
  nickName?: string
  userName?: string
  userImage?: string
  avatar?: string
}

export class XiaohongshuAdapter extends EditorAssistAdapter {
  readonly meta: PlatformMeta = {
    id: 'xiaohongshu',
    name: '小红书',
    icon: 'https://www.xiaohongshu.com/favicon.ico',
    homepage: 'https://creator.xiaohongshu.com',
    capabilities: ['article'],
    category: '主流自媒体',
    experimental: true,
    syncMode: 'editor',
  }

  readonly editorConfig: EditorAssistConfig = {
    // target=article 直达「写长文」编辑器
    editorUrl: 'https://creator.xiaohongshu.com/publish/publish?target=article',
    titleSelectors: [
      'input[placeholder*="标题"]',
      'input[placeholder*="填写标题"]',
      'input[class*="title"]'
    ],
    editorSelectors: [
      '.tiptap.ProseMirror[contenteditable="true"]',
      '.ProseMirror[contenteditable="true"]',
      '[contenteditable="true"][class*="editor"]',
      'div[contenteditable="true"]'
    ],
    removeSelectors: ['.tiptap-topic', '.xhs-topic'],
    hint: '小红书长文草稿保存在「草稿箱 → 长文笔记」，请确认后发布',
    waitBeforeFill: 4500,
  }

  async checkAuth(): Promise<AuthResult> {
    try {
      const res = await this.get<{ success?: boolean; data?: XhsUserInfo }>(
        'https://creator.xiaohongshu.com/api/galaxy/user/info'
      )

      const data = res?.data

      if (!data || (!data.userId && !data.nickName && !data.userName)) {
        return { isAuthenticated: false }
      }

      return {
        isAuthenticated: true,
        userId: data.userId ? String(data.userId) : undefined,
        username: data.nickName || data.userName,
        avatar: data.userImage || data.avatar,
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
