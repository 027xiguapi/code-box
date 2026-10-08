/**
 * 开源中国适配器
 * https://my.oschina.net
 */
import { CodeAdapter } from '../code-adapter'
import type { ImageUploadResult } from '../code-adapter'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
export class OschinaAdapter extends CodeAdapter {
  meta: PlatformMeta = {
    id: 'oschina',
    name: '开源中国',
    icon: 'https://www.oschina.net/favicon.ico',
    homepage: 'https://my.oschina.net',
    capabilities: ['article', 'draft', 'image_upload'],
    category: '技术社区',
    syncMode: 'api',
  }

  /** 预处理配置: 开源中国使用 Markdown 格式 */
  readonly preprocessConfig = {
    outputFormat: 'markdown' as const,
  }

  private userId: string | null = null

  /** 开源中国 API 需要的 Header 规则 */
  private readonly HEADER_RULES = [
    {
      urlFilter: '*://apiv1.oschina.net/oschinapi/*',
      headers: {
        Origin: 'https://my.oschina.net',
        Referer: 'https://my.oschina.net/',
      },
      resourceTypes: ['xmlhttprequest'],
    },
  ]

  /**
   * 检查登录状态
   */
  async checkAuth(): Promise<AuthResult> {
    try {
      const response = await this.runtime.fetch('https://apiv1.oschina.net/oschinapi/user/myDetails', {
        credentials: 'include',
      })
      const data = await response.json() as {
        success: boolean
        result?: {
          userId: number
          userVo?: {
            name: string
            portraitUrl: string
          }
        }
      }

      if (!data.success || !data.result?.userId) {
        return { isAuthenticated: false, error: '未登录' }
      }

      this.userId = String(data.result.userId)

      return {
        isAuthenticated: true,
        userId: this.userId,
        username: data.result.userVo?.name || this.userId,
        avatar: data.result.userVo?.portraitUrl,
      }
    } catch (error) {
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  /**
   * 上传图片
   */
  async uploadImageByUrl(url: string): Promise<ImageUploadResult> {
    if (!this.userId) {
      await this.checkAuth()
    }

    // 下载图片
    const imageResponse = await this.runtime.fetch(url)
    const blob = await imageResponse.blob()
    const filename = this.getFilenameFromUrl(url) || 'image'

    // 构建 FormData
    const formData = new FormData()
    formData.append('file', blob, filename)

    const response = await this.runtime.fetch(
      'https://apiv1.oschina.net/oschinapi/ai/creation/project/uploadDetail',
      {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }
    )

    const res = await response.json() as {
      success?: boolean
      result?: string
      message?: string
    }

    if (!res.success || !res.result) {
      throw new Error(res.message || '图片上传失败')
    }

    return { url: res.result }
  }

  private getFilenameFromUrl(url: string): string | null {
    try {
      const pathname = new URL(url).pathname
      const name = pathname.split('/').pop()
      return name && name.trim() ? name : null
    } catch {
      return null
    }
  }

  /**
   * 发布文章
   */
  async publish(article: Article): Promise<SyncResult> {
    const now = Date.now()

    return this.withHeaderRules(this.HEADER_RULES, async () => {
      // 确保已获取用户 ID
      if (!this.userId) {
        const auth = await this.checkAuth()
        if (!auth.isAuthenticated) {
          throw new Error('未登录')
        }
      }

      const rawMarkdown = article.markdown || ''
      const rawHtml = article.html || ''
      const useMarkdown = rawMarkdown.trim().length > 0

      let content = useMarkdown ? rawMarkdown : rawHtml
      content = await this.processImages(content, (src) => this.uploadImageByUrl(src))

      const response = await this.runtime.fetch(
        'https://apiv1.oschina.net/oschinapi/api/draft/save_draft',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: article.title,
            user: Number(this.userId),
            content,
            contentType: useMarkdown ? 1 : 2, // 1=markdown, 2=html
            catalog: 0,
            originUrl: '',
            privacy: true,
            disableComment: false,
          }),
        }
      )

      const res = await response.json() as {
        success?: boolean
        message?: string
        result?: { id?: number }
      }

      if (!res.success || !res.result?.id) {
        throw new Error(res.message || '发布失败')
      }

      const draftId = String(res.result.id)

      return {
        platform: this.meta.id,
        success: true,
        postId: draftId,
        postUrl: `https://my.oschina.net/u/${this.userId}/blog/write/draft/${draftId}`,
        draftOnly: true,
        timestamp: now,
      }
    }).catch((error) => ({
      platform: this.meta.id,
      success: false,
      error: (error as Error).message,
      timestamp: now,
    }))
  }
}
