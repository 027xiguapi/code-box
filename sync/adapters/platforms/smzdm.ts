/**
 * 什么值得买适配器
 *
 * 什么值得买文章编辑器（ProseMirror）没有公开的发布接口，社区方案均为
 * 浏览器端填充编辑器，因此采用「编辑器辅助」方式：
 * 打开写文章编辑器并自动填充标题与正文，由用户确认后发布（需人工审核）。
 *
 * 登录检测：读取 Cookie（smzdm_user / sess），并访问创作中心校验。
 */
import { EditorAssistAdapter, type EditorAssistConfig } from '../editor-assist'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { PublishOptions } from '../types'
import { createLogger } from '../../lib/logger'

const logger = createLogger('Smzdm')

/** 标题最长 30 字 */
const TITLE_LIMIT = 30

export class SmzdmAdapter extends EditorAssistAdapter {
  readonly meta: PlatformMeta = {
    id: 'smzdm',
    name: '什么值得买',
    icon: 'https://www.smzdm.com/favicon.ico',
    homepage: 'https://zhiyou.smzdm.com',
    capabilities: ['article'],
    category: '通用',
    experimental: true,
    syncMode: 'editor',
  }

  readonly editorConfig: EditorAssistConfig = {
    // 写文章编辑器（创作中心）
    editorUrl: 'https://post.smzdm.com/editor/',
    titleSelectors: [
      'input[placeholder*="标题"]',
      'textarea[placeholder*="标题"]',
      'input[class*="title"]',
      'textarea[class*="title"]'
    ],
    editorSelectors: [
      '.ProseMirror[contenteditable="true"]',
      '[contenteditable="true"][class*="editor"]',
      '[contenteditable="true"][class*="content"]',
      'div[contenteditable="true"]'
    ],
    hint: '已打开什么值得买编辑器并填充内容，请确认后发布（发布后需平台人工审核）',
    waitBeforeFill: 4500,
  }

  async checkAuth(): Promise<AuthResult> {
    try {
      if (!this.runtime.getCookie) {
        return { isAuthenticated: false, error: '当前环境不支持读取 Cookie' }
      }

      const userId =
        (await this.runtime.getCookie('.smzdm.com', 'smzdm_user')) ||
        (await this.runtime.getCookie('.smzdm.com', 'user_id'))

      const session =
        (await this.runtime.getCookie('.smzdm.com', 'sess')) ||
        (await this.runtime.getCookie('.smzdm.com', 'smzdm_sess'))

      if (!userId && !session) {
        return { isAuthenticated: false }
      }

      return {
        isAuthenticated: true,
        userId: userId || undefined,
      }
    } catch (error) {
      logger.debug('checkAuth failed:', error)
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    // 标题超过 30 字会被平台截断，这里主动截断并保留完整标题在正文首行
    const title =
      article.title.length > TITLE_LIMIT
        ? article.title.slice(0, TITLE_LIMIT - 1) + '…'
        : article.title

    return this.openEditorAndFill({ ...article, title }, options)
  }
}
