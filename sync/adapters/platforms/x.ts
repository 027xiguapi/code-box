/**
 * X (Twitter) 适配器
 *
 * X 的发帖接口使用 GraphQL + 客户端 bearer / csrf 校验，且草稿接口未公开，
 * 因此采用「编辑器辅助」方式：打开撰写框并填充内容（纯文本），
 * 由用户确认后发布或保存草稿。
 *
 * 登录检测：GET https://x.com/i/api/1.1/account/settings.json
 * （使用 Web 端公开 bearer + ct0 cookie 作为 csrf token）
 */
import { EditorAssistAdapter, type EditorAssistConfig } from '../editor-assist'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { PublishOptions } from '../types'
import { createLogger } from '../../lib/logger'

const logger = createLogger('X')

/** X Web 端公开 bearer token */
const X_WEB_BEARER =
  'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'

export class XAdapter extends EditorAssistAdapter {
  readonly meta: PlatformMeta = {
    id: 'x',
    name: 'X (Twitter)',
    icon: 'https://abs.twimg.com/favicons/twitter.3.ico',
    homepage: 'https://x.com',
    capabilities: ['article'],
    category: '海外',
    experimental: true,
    syncMode: 'editor',
  }

  readonly editorConfig: EditorAssistConfig = {
    editorUrl: 'https://x.com/compose/post',
    titleSelectors: [],
    editorSelectors: [
      '[data-testid^="tweetTextarea"]',
      'div[role="textbox"][contenteditable="true"]',
      '.public-DraftEditor-content',
      '[contenteditable="true"]'
    ],
    hint: '已在 X 撰写框填充内容，请确认后发布或保存草稿（长文建议使用 X Articles）',
    waitBeforeFill: 5000,
    // X 为纯文本编辑器
    textOnly: true,
  }

  async checkAuth(): Promise<AuthResult> {
    try {
      if (!this.runtime.getCookie) {
        return { isAuthenticated: false, error: '当前环境不支持读取 Cookie' }
      }

      const csrfToken = await this.runtime.getCookie('x.com', 'ct0')
      if (!csrfToken) {
        return { isAuthenticated: false }
      }

      const res = await this.get<{
        screen_name?: string
        name?: string
        profile_image_url_https?: string
      }>('https://x.com/i/api/1.1/account/settings.json', {
        authorization: `Bearer ${X_WEB_BEARER}`,
        'x-csrf-token': csrfToken,
        'x-twitter-active-user': 'yes',
        'x-twitter-auth-type': 'OAuth2Session',
        'x-twitter-client-language': 'zh-cn',
      })

      if (!res?.screen_name) {
        return { isAuthenticated: false }
      }

      return {
        isAuthenticated: true,
        userId: res.screen_name,
        username: res.name || res.screen_name,
        avatar: res.profile_image_url_https,
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
