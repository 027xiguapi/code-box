/**
 * 搜狐焦点适配器
 *
 * 参考 wechatsync 驱动（Focus）实现：
 * - 登录检测：GET https://mp-fe-pc.focus.cn/user/status
 * - 保存草稿：POST https://mp-fe-pc.focus.cn/news/info/publishNewsInfo
 * - 图片上传：POST https://mp-fe-pc.focus.cn/common/image/upload?type=2
 */
import { CodeAdapter, type ImageUploadResult } from '../code-adapter'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { PublishOptions } from '../types'
import { createLogger } from '../../lib/logger'

const logger = createLogger('Sohufocus')

interface FocusAuthData {
  uid?: string | number
  accountName?: string
  picUrl?: string
}

export class SohufocusAdapter extends CodeAdapter {
  readonly meta: PlatformMeta = {
    id: 'sohufocus',
    name: '搜狐焦点',
    icon: 'https://mp.focus.cn/favicon.ico',
    homepage: 'https://mp.focus.cn/fe/index.html#/info/draft',
    capabilities: ['article', 'draft', 'image_upload'],
    category: '房产',
    syncMode: 'api',
  }

  /** 搜狐焦点对多余空白敏感，压缩 HTML 标签间空白 */
  readonly preprocessConfig = {
    outputFormat: 'html' as const,
    compactHtml: true,
    removeIframes: true,
    removeComments: true,
    removeEmptyElements: true,
  }

  private account: FocusAuthData | null = null

  async checkAuth(): Promise<AuthResult> {
    try {
      const res = await this.get<{ data?: FocusAuthData }>(
        'https://mp-fe-pc.focus.cn/user/status?'
      )

      const data = res?.data

      if (data?.uid) {
        this.account = data
        return {
          isAuthenticated: true,
          userId: String(data.uid),
          username: data.accountName,
          avatar: data.picUrl,
        }
      }

      return { isAuthenticated: false }
    } catch (error) {
      logger.debug('checkAuth failed:', error)
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    try {
      logger.info('Starting publish...')

      if (!this.account) {
        const auth = await this.checkAuth()
        if (!auth.isAuthenticated) {
          throw new Error('请先登录搜狐焦点（https://mp.focus.cn）')
        }
      }

      let content = article.html || article.markdown || ''
      content = content.replace(/>[\t\s]*</g, '><')

      content = await this.processImages(
        content,
        (src) => this.uploadImageByUrl(src),
        {
          skipPatterns: ['focus.cn', '51f.com'],
          onProgress: options?.onImageProgress,
        }
      )

      const payload = {
        projectIds: [],
        newsBasic: {
          id: '',
          cityId: 0,
          title: article.title,
          category: 1,
          headImg: article.cover || '',
          newsAbstract: article.summary || '',
          isGuide: 0,
          // 4 = 草稿
          status: 4,
        },
        newsContent: {
          content,
        },
        videoIds: [],
      }

      const res = await this.postJson<{ code?: number; data?: { id?: string }; msg?: string }>(
        'https://mp-fe-pc.focus.cn/news/info/publishNewsInfo',
        payload
      )

      const articleId = res?.data?.id

      if (!articleId) {
        throw new Error(`保存草稿失败：${res?.msg || JSON.stringify(res).slice(0, 200)}`)
      }

      return this.createResult(true, {
        postId: String(articleId),
        postUrl: `https://mp.focus.cn/fe/index.html#/info/subinfo/${articleId}`,
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
    const imageResponse = await fetch(src)
    if (!imageResponse.ok) {
      throw new Error('图片下载失败: ' + src)
    }
    const blob = await imageResponse.blob()

    const formData = new FormData()
    formData.append('image', blob, `${Date.now()}.jpg`)

    const res = await this.postMultipart<{ code?: number; data?: string }>(
      'https://mp-fe-pc.focus.cn/common/image/upload?type=2',
      formData
    )

    if (res?.code !== 200 || !res.data) {
      throw new Error('图片上传失败')
    }

    return {
      url: `https://t-img.51f.com/sh740wsh${res.data}`,
      attrs: {
        'data-key': res.data,
      },
    }
  }
}
