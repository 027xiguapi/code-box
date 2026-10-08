/**
 * 抖音图文适配器
 *
 * 抖音创作者中心的图文/文章发布接口未公开且带风控校验（csrf_token + 风控参数），
 * 因此采用「编辑器辅助」方式：打开「发布文章」编辑器并自动填充标题与正文，
 * 由用户确认后保存草稿或发布。
 *
 * 登录检测：GET https://creator.douyin.com/web/api/media/user/info/
 */
import { EditorAssistAdapter, type EditorAssistConfig } from '../editor-assist'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { PublishOptions } from '../types'
import { createLogger } from '../../lib/logger'

const logger = createLogger('Douyin')

interface DouyinUserInfo {
  uid?: string
  nick_name?: string
  nickname?: string
  avatar_uri?: string
  avatar_url?: string
}

export class DouyinAdapter extends EditorAssistAdapter {
  readonly meta: PlatformMeta = {
    id: 'douyin',
    name: '抖音图文',
    icon: 'https://www.douyin.com/favicon.ico',
    homepage: 'https://creator.douyin.com',
    capabilities: ['article'],
    category: '主流自媒体',
    experimental: true,
    syncMode: 'editor',
  }

  readonly editorConfig: EditorAssistConfig = {
    // 文章编辑器（长文），default-tab=5 直达「发布文章」
    editorUrl:
      'https://creator.douyin.com/creator-micro/content/post/article?default-tab=5&enter_from=publish_page&media_type=article&type=new',
    titleSelectors: [
      'input[placeholder*="标题"]',
      'textarea[placeholder*="标题"]',
      'input[placeholder*="请输入文章标题"]',
      'input[class*="title"]'
    ],
    editorSelectors: [
      '.ProseMirror[contenteditable="true"]',
      '[contenteditable="true"][class*="editor"]',
      '[contenteditable="true"][class*="content"]',
      'div[contenteditable="true"]'
    ],
    hint: '已打开抖音「发布文章」编辑器并填充内容，请在草稿箱确认后发布',
    waitBeforeFill: 5000,
  }

  async checkAuth(): Promise<AuthResult> {
    try {
      const res = await this.get<{
        status_code?: number
        user_info?: DouyinUserInfo
        data?: DouyinUserInfo
      }>('https://creator.douyin.com/web/api/media/user/info/')

      const user = res?.user_info || res?.data

      if (!user || (!user.uid && !user.nick_name && !user.nickname)) {
        return { isAuthenticated: false }
      }

      return {
        isAuthenticated: true,
        userId: user.uid ? String(user.uid) : undefined,
        username: user.nick_name || user.nickname,
        avatar: user.avatar_url || user.avatar_uri,
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
