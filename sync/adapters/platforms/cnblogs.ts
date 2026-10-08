/**
 * 博客园 (cnblogs.com) 适配器
 */
import { CodeAdapter, type ImageUploadResult } from '../code-adapter'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { PublishOptions } from '../types'
import { createLogger } from '../../lib/logger'

const logger = createLogger('Cnblogs')

export class CnblogsAdapter extends CodeAdapter {
  readonly meta: PlatformMeta = {
    id: 'cnblogs',
    name: '博客园',
    icon: 'https://www.cnblogs.com/favicon.ico',
    homepage: 'https://www.cnblogs.com',
    capabilities: ['article', 'draft', 'image_upload'],
    category: '技术社区',
    syncMode: 'api',
  }

  /** 预处理配置: 博客园使用 Markdown 格式 */
  readonly preprocessConfig = {
    outputFormat: 'markdown' as const,
  }

  private xsrfToken: string | null = null

  /** 博客园 API 需要的 Header 规则 */
  private readonly HEADER_RULES = [
    {
      urlFilter: '*://i.cnblogs.com/*',
      headers: {
        'Origin': 'https://i.cnblogs.com',
        'Referer': 'https://i.cnblogs.com/',
      },
      resourceTypes: ['xmlhttprequest'],
    },
    {
      urlFilter: '*://upload.cnblogs.com/*',
      headers: {
        'Origin': 'https://i.cnblogs.com',
        'Referer': 'https://i.cnblogs.com/',
      },
      resourceTypes: ['xmlhttprequest'],
    },
  ]

  /**
   * 从 cookie 中获取 XSRF-TOKEN
   */
  private async getXsrfToken(): Promise<string | null> {
    if (this.xsrfToken) {
      return this.xsrfToken
    }

    try {
      // 先访问页面以触发 cookie 设置
      await this.runtime.fetch('https://i.cnblogs.com/posts/edit', {
        method: 'GET',
        credentials: 'include',
      })

      // 使用 cookies API 获取 XSRF-TOKEN
      if (this.runtime.getCookie) {
        logger.debug('Trying to get XSRF-TOKEN via getCookie API...')

        // 尝试不同的域名格式
        const domains = ['i.cnblogs.com', '.cnblogs.com', 'cnblogs.com']
        for (const domain of domains) {
          const value = await this.runtime.getCookie(domain, 'XSRF-TOKEN')
          logger.debug(`getCookie ${domain} result:`, value ? `${value.substring(0, 30)}...` : 'null')
          if (value) {
            this.xsrfToken = value
            logger.debug('Got XSRF-TOKEN from cookies API')
            return this.xsrfToken
          }
        }
      } else {
        logger.warn('getCookie API not available')
      }

      logger.warn('Could not find XSRF-TOKEN')
      return null
    } catch (error) {
      logger.error('Failed to get XSRF-TOKEN:', error)
      return null
    }
  }

  async checkAuth(): Promise<AuthResult> {
    try {
      const response = await this.runtime.fetch('https://home.cnblogs.com/user/CurrentUserInfo', {
        method: 'GET',
        credentials: 'include',
      })

      const text = await response.text()

      // 解析 HTML 响应获取用户信息
      // 页面结构: <a href="/u/xxx/"><img class="pfs" src="..."></a>
      const avatarMatch = text.match(/<img[^>]+class="pfs"[^>]+src="([^"]+)"/)
      const linkMatch = text.match(/href="\/u\/([^/]+)\/"/)

      if (!linkMatch) {
        return { isAuthenticated: false }
      }

      const uid = linkMatch[1]
      const avatar = avatarMatch ? avatarMatch[1] : undefined

      return {
        isAuthenticated: true,
        userId: uid,
        username: uid,
        avatar,
      }
    } catch (error) {
      logger.debug('checkAuth: not logged in -', error)
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    return this.withHeaderRules(this.HEADER_RULES, async () => {
      logger.info('Starting publish to cnblogs...')

      // 1. Get XSRF-TOKEN
      const xsrfToken = await this.getXsrfToken()
      logger.info('XSRF-TOKEN:', xsrfToken ? `${xsrfToken.substring(0, 20)}...` : 'null')
      if (!xsrfToken) {
        throw new Error('获取 XSRF-TOKEN 失败，请刷新页面后重试')
      }

      // 保存 xsrfToken 供 uploadImageByUrl 使用
      this.xsrfToken = xsrfToken

      // 2. 处理图片上传
      let markdown = article.markdown || ''
      logger.debug('Markdown before processImages:', markdown.substring(0, 200))

      markdown = await this.processImages(
        markdown,
        (src) => this.uploadImageByUrl(src),
        {
          skipPatterns: ['cnblogs.com', 'img2024.cnblogs.com', 'img2023.cnblogs.com'],
          onProgress: options?.onImageProgress,
        }
      )

      logger.debug('Markdown after processImages:', markdown.substring(0, 200))

      // 3. Build request headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-xsrf-token': xsrfToken,
      }

      logger.debug('Request headers:', JSON.stringify(headers))
      logger.debug('Markdown content length:', markdown.length)

      // 4. 创建草稿
      const response = await this.runtime.fetch('https://i.cnblogs.com/api/posts', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          id: null,
          postType: 2, // 2 = 文章, 1 = 随笔
          accessPermission: 0,
          title: article.title,
          url: null,
          postBody: markdown,
          categoryIds: null,
          categories: null,
          collectionIds: [],
          inSiteCandidate: false,
          inSiteHome: false,
          siteCategoryId: null,
          blogTeamIds: null,
          isPublished: false,
          displayOnHomePage: false,
          isAllowComments: true,
          includeInMainSyndication: false,
          isPinned: false,
          showBodyWhenPinned: false,
          isOnlyForRegisterUser: false,
          isUpdateDateAdded: false,
          entryName: null,
          description: null,
          featuredImage: null,
          tags: null,
          password: null,
          publishAt: null,
          datePublished: new Date().toISOString(),
          dateUpdated: null,
          isMarkdown: true,
          isDraft: true,
          autoDesc: null,
          changePostType: false,
          blogId: 0,
          author: null,
          removeScript: false,
          clientInfo: null,
          changeCreatedTime: false,
          canChangeCreatedTime: false,
          isContributeToImpressiveBugActivity: false,
          usingEditorId: 5,
          sourceUrl: null,
        }),
      })

      // 检查响应
      const responseText = await response.text()
      logger.debug('Create post response:', response.status, responseText.substring(0, 300))

      if (!response.ok) {
        // 检查是否是认证错误
        if (response.status === 401 || response.status === 403) {
          throw new Error('未登录或登录已过期，请重新登录博客园')
        }
        throw new Error(`创建草稿失败: ${response.status} - ${responseText}`)
      }

      let responseData: { id?: number; blogId?: number; error?: string }
      try {
        responseData = JSON.parse(responseText)
      } catch {
        throw new Error(`创建草稿失败: 响应不是有效 JSON - ${responseText.substring(0, 100)}`)
      }

      if (!responseData.id) {
        throw new Error(responseData.error || '创建草稿失败: 无效响应')
      }

      const postId = String(responseData.id)
      const draftUrl = `https://i.cnblogs.com/articles/edit;postId=${postId}`

      logger.debug('Draft created:', postId)

      return this.createResult(true, {
        postId,
        postUrl: draftUrl,
        draftOnly: options?.draftOnly ?? true,
      })
    }).catch((error) => this.createResult(false, {
      error: (error as Error).message,
    }))
  }

  /**
   * 上传图片到博客园
   * 使用新版 CORS 上传接口
   */
  protected async uploadImageByUrl(src: string): Promise<ImageUploadResult> {
    if (!this.xsrfToken) {
      throw new Error('XSRF-TOKEN 未获取')
    }

    // 下载图片
    const imageResponse = await fetch(src)
    if (!imageResponse.ok) {
      throw new Error('图片下载失败: ' + src)
    }
    const imageBlob = await imageResponse.blob()

    // 构建 FormData
    const formData = new FormData()
    formData.append('image', imageBlob, 'image.png')
    formData.append('app', 'blog')
    formData.append('uploadType', 'Select')

    // 上传图片
    const uploadResponse = await this.runtime.fetch(
      'https://upload.cnblogs.com/v2/images/cors-upload',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'x-xsrf-token': this.xsrfToken,
        },
        body: formData,
      }
    )

    const responseText = await uploadResponse.text()
    logger.debug('Image upload raw response:', responseText)

    if (!uploadResponse.ok) {
      throw new Error(`图片上传失败: ${uploadResponse.status} - ${responseText}`)
    }

    let res: Record<string, unknown>
    try {
      res = JSON.parse(responseText)
    } catch {
      throw new Error(`图片上传失败: 响应不是 JSON - ${responseText.substring(0, 100)}`)
    }

    logger.debug('Image upload parsed response:', JSON.stringify(res))

    // 尝试不同的响应格式
    const imageUrl = res.data || res.url || res.imageUrl || res.src
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error(`图片上传失败: 无法获取图片 URL - ${JSON.stringify(res)}`)
    }

    logger.info('Image uploaded:', imageUrl)
    return {
      url: imageUrl,
    }
  }
}
