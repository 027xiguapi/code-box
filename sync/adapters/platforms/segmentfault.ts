/**
 * 思否 (Segmentfault) 适配器
 * https://segmentfault.com
 */
import { CodeAdapter } from '../code-adapter'
import type { ImageUploadResult } from '../code-adapter'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
export class SegmentfaultAdapter extends CodeAdapter {
  meta: PlatformMeta = {
    id: 'segmentfault',
    name: '思否',
    icon: 'https://imgcache.iyiou.com/Company/2016-05-11/cf-segmentfault.jpg',
    homepage: 'https://segmentfault.com/user/draft',
    capabilities: ['article', 'draft', 'image_upload'],
    category: '技术社区',
    syncMode: 'api',
  }

  /** 预处理配置: 思否使用 Markdown 格式 */
  readonly preprocessConfig = {
    outputFormat: 'markdown' as const,
  }

  private sessionToken: string | null = null

  /** 思否 API 需要的 Header 规则 */
  private readonly HEADER_RULES = [
    {
      urlFilter: '*://segmentfault.com/gateway/*',
      headers: {
        Origin: 'https://segmentfault.com',
        Referer: 'https://segmentfault.com/',
      },
      resourceTypes: ['xmlhttprequest'],
    },
  ]

  /**
   * 检查登录状态
   */
  async checkAuth(): Promise<AuthResult> {
    try {
      const response = await this.runtime.fetch('https://segmentfault.com/user/settings', {
        credentials: 'include',
      })
      const html = await response.text()

      // 匹配用户链接 href="/u/username"
      const userLinkMatch = html.match(/href="\/u\/([^"]+)"/)
      if (!userLinkMatch) {
        return { isAuthenticated: false, error: '未登录' }
      }

      const uid = userLinkMatch[1]

      // 匹配头像 URL (avatar-static.segmentfault.com)
      const avatarMatch = html.match(/src="(https:\/\/avatar-static\.segmentfault\.com\/[^"]+)"/)
      const avatar = avatarMatch ? avatarMatch[1] : undefined

      return {
        isAuthenticated: true,
        userId: uid,
        username: uid,
        avatar: avatar,
      }
    } catch (error) {
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  /**
   * 获取 session token
   */
  private async getSessionToken(): Promise<string> {
    const response = await this.runtime.fetch('https://segmentfault.com/write', {
      credentials: 'include',
    })
    const html = await response.text()

    // 新版 token 格式: serverData":{"Token":"xxx"
    const tokenMatch = html.match(/serverData":\s*\{\s*"Token"\s*:\s*"([^"]+)"/)
    if (tokenMatch) {
      return tokenMatch[1]
    }

    // 兼容旧版格式
    const markStr = 'window.g_initialProps = '
    const authIndex = html.indexOf(markStr)
    if (authIndex === -1) {
      throw new Error('获取 session token 失败')
    }

    const endIndex = html.indexOf(';\n\t</script>', authIndex)
    if (endIndex === -1) {
      throw new Error('解析 session token 失败')
    }

    const configStr = html.substring(authIndex + markStr.length, endIndex)

    try {
      const config = JSON.parse(configStr)
      const token = config?.global?.sessionInfo?.key
      if (!token) {
        throw new Error('session token 为空')
      }
      return token
    } catch (e) {
      throw new Error('解析 session token 失败: ' + (e as Error).message)
    }
  }

  /**
   * 上传图片
   */
  async uploadImageByUrl(url: string): Promise<ImageUploadResult> {
    if (!this.sessionToken) {
      throw new Error('未获取 token')
    }

    // 下载图片
    const imageResponse = await this.runtime.fetch(url)
    const blob = await imageResponse.blob()

    // 构建 FormData
    const formData = new FormData()
    formData.append('image', blob)

    const response = await this.runtime.fetch(
      'https://segmentfault.com/gateway/image',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          token: this.sessionToken,
        },
        body: formData,
      }
    )

    // 处理异常响应
    const text = await response.text()
    if (text === 'Unauthorized' || text.includes('禁言') || text.includes('锁定')) {
      throw new Error(text === 'Unauthorized' ? '未授权' : text)
    }

    let res
    try {
      res = JSON.parse(text)
    } catch {
      throw new Error('图片上传失败: ' + text)
    }

    // 新版返回格式: { url: "/img/xxx", result: "https://..." }
    // 旧版返回格式: [0, url, id] 或 [1, error_message]
    const imageUrl = res.result || (Array.isArray(res) ? (res[0] === 1 ? null : res[1] || `https://image-static.segmentfault.com/${res[2]}`) : null)
    if (!imageUrl) {
      throw new Error(Array.isArray(res) ? (res[1] || '图片上传失败') : '图片上传失败')
    }
    return { url: imageUrl }
  }

  /**
   * 发布文章
   */
  async publish(article: Article): Promise<SyncResult> {
    const now = Date.now()
    return this.withHeaderRules(this.HEADER_RULES, async () => {
      // 获取 session token
      this.sessionToken = await this.getSessionToken()

      // 优先使用 markdown，处理图片
      let content = article.markdown || article.html || ''
      content = await this.processImages(content, (src) => this.uploadImageByUrl(src))

      const postData = {
        title: article.title,
        tags: [],
        text: content,
        object_id: '',
        type: 'article',
      }

      const response = await this.runtime.fetch('https://segmentfault.com/gateway/draft', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          token: this.sessionToken,
          accept: '*/*',
        },
        body: JSON.stringify(postData),
      })

      // 处理异常响应
      const text = await response.text()
      if (text === 'Unauthorized' || text.includes('禁言') || text.includes('锁定')) {
        throw new Error(text === 'Unauthorized' ? '未授权' : text)
      }

      let res
      try {
        res = JSON.parse(text)
      } catch {
        throw new Error('发布失败: ' + text)
      }

      // 处理数组格式响应 [1, "error_message"]
      if (Array.isArray(res)) {
        if (res[0] === 1) {
          throw new Error(res[1] || '发布失败')
        }
        // [0, data] 成功格式
        const data = res[1]
        if (data?.id) {
          return {
            platform: this.meta.id,
            success: true,
            postId: data.id,
            postUrl: `https://segmentfault.com/write?draftId=${data.id}`,
            draftOnly: true,
            timestamp: now,
          }
        }
      }

      if (!res.id) {
        // 尝试多种错误字段
        const errorMsg = res.message || res.msg || res.error || res.errMsg || JSON.stringify(res)
        throw new Error(errorMsg)
      }

      return {
        platform: this.meta.id,
        success: true,
        postId: res.id,
        postUrl: `https://segmentfault.com/write?draftId=${res.id}`,
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
