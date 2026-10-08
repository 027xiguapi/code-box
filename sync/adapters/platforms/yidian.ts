/**
 * 一点号适配器
 *
 * 参考 wechatsync 驱动（YiDian）实现：
 * - 登录检测：GET https://mp.yidianzixun.com 解析页面中 window.mpuser
 * - 保存草稿：POST https://mp.yidianzixun.com/model/Article
 * - 图片转存：GET /api/getImageFromUrl?src=<url>
 */
import { CodeAdapter, type ImageUploadResult } from '../code-adapter'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { PublishOptions } from '../types'
import { createLogger } from '../../lib/logger'
import { extractElementById, extractWindowObject } from '../../lib/js-object'

const logger = createLogger('Yidian')

export class YidianAdapter extends CodeAdapter {
  readonly meta: PlatformMeta = {
    id: 'yidian',
    name: '一点号',
    icon: 'https://www.yidianzixun.com/favicon.ico',
    homepage: 'https://mp.yidianzixun.com',
    capabilities: ['article', 'draft', 'image_upload'],
    category: '通用',
    syncMode: 'api',
  }

  /** 一点号使用 HTML 内容 */
  readonly preprocessConfig = {
    outputFormat: 'html' as const,
    removeIframes: true,
    removeComments: true,
    removeEmptyElements: true,
  }

  private mediaInfo: Record<string, unknown> | null = null

  async checkAuth(): Promise<AuthResult> {
    try {
      const response = await this.runtime.fetch('https://mp.yidianzixun.com/', {
        credentials: 'include',
      })
      const html = await response.text()

      // 页面中 <script id="__val_"> 里包含 window.mpuser = {...}
      const scriptText = extractElementById(html, '__val_') || html
      const mpuser = extractWindowObject(scriptText, 'window.mpuser') || extractWindowObject(html, 'mpuser')

      if (!mpuser?.id) {
        return { isAuthenticated: false }
      }

      this.mediaInfo = mpuser

      return {
        isAuthenticated: true,
        userId: String(mpuser.id),
        username: (mpuser.media_name as string) || undefined,
        avatar: (mpuser.media_pic as string) || undefined,
      }
    } catch (error) {
      logger.debug('checkAuth failed:', error)
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    try {
      logger.info('Starting publish...')

      if (!this.mediaInfo) {
        const auth = await this.checkAuth()
        if (!auth.isAuthenticated) {
          throw new Error('请先登录一点号（https://mp.yidianzixun.com）')
        }
      }

      let content = article.html || article.markdown || ''

      content = await this.processImages(
        content,
        (src) => this.uploadImageByUrl(src),
        {
          skipPatterns: ['yidianzixun.com', 'yidian.com'],
          onProgress: options?.onImageProgress,
        }
      )

      const body = {
        title: article.title,
        cate: '',
        cateB: '',
        coverType: 'default',
        covers: [],
        content,
        hasSubTitle: 0,
        subTitle: '',
        original: 0,
        reward: 0,
        videos: [],
        audios: [],
        votes: {
          vote_id: '',
          vote_options: [],
          vote_end_time: '',
          vote_title: '',
          vote_type: 1,
          isAdded: false,
        },
        images: [],
        goods: [],
        is_mobile: 0,
        status: 0,
        import_url: '',
        import_hash: '',
        image_urls: {},
        minTimingHour: 3,
        maxTimingDay: 7,
        tags: [],
        isPubed: false,
        lastSaveTime: '',
        dirty: false,
        editorType: 'articleEditor',
        activity_id: 0,
        join_activity: 0,
        notSaveToStore: true,
      }

      const response = await this.runtime.fetch(
        'https://mp.yidianzixun.com/model/Article',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )

      const data = (await response.json()) as { id?: string | number; msg?: string }

      if (!data?.id) {
        throw new Error(`保存草稿失败：${data?.msg || JSON.stringify(data).slice(0, 200)}`)
      }

      const draftId = String(data.id)

      return this.createResult(true, {
        postId: draftId,
        postUrl: `https://mp.yidianzixun.com/#/Writing/${draftId}`,
        draftOnly: options?.draftOnly ?? true,
      })
    } catch (error) {
      logger.error('publish failed:', error)
      return this.createResult(false, {
        error: (error as Error).message,
      })
    }
  }

  protected async uploadImageByUrl(src: string): Promise<ImageUploadResult> {
    const result = await this.runtime.fetch(
      `https://mp.yidianzixun.com/api/getImageFromUrl?src=${encodeURIComponent(src)}`,
      { credentials: 'include' }
    )

    const data = (await result.json()) as { status?: string; inner_addr?: string }

    if (data.status !== 'success' || !data.inner_addr) {
      throw new Error('图片转存失败')
    }

    return { url: data.inner_addr }
  }
}
