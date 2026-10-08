/**
 * 51CTO 适配器
 * https://blog.51cto.com
 *
 * 新版图片上传流程:
 * 1. getUploadSign - 获取上传签名
 * 2. getUploadConfig - 获取腾讯云 COS 上传凭证
 * 3. 上传到腾讯云 COS
 */
import { CodeAdapter } from '../code-adapter'
import type { ImageUploadResult } from '../code-adapter'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'

interface UploadSignResponse {
  code: number
  msg: string
  data: {
    allows: string
    sizeLimit: number
    sizeLimitMessage: string
    url: string
    sign: string
  }
}

interface UploadConfigResponse {
  code: number
  msg: string
  data: {
    url: string
    fields: {
      key: string
      policy: string
      'x-amz-algorithm': string
      'x-amz-signature': string
      'x-amz-credential': string
      'X-Amz-Date': string
    }
  }
}

export class Cto51Adapter extends CodeAdapter {
  meta: PlatformMeta = {
    id: '51cto',
    name: '51CTO',
    icon: 'https://blog.51cto.com/favicon.ico',
    homepage: 'https://blog.51cto.com/blogger/publish',
    capabilities: ['article', 'draft', 'image_upload'],
    category: '技术社区',
    syncMode: 'api',
  }

  /** 预处理配置: 51CTO 使用 Markdown 格式 */
  readonly preprocessConfig = {
    outputFormat: 'markdown' as const,
  }

  private csrf: string | null = null

  /** 51CTO API 需要的 Header 规则 */
  private readonly HEADER_RULES = [
    {
      urlFilter: '*://blog.51cto.com/*',
      headers: {
        Origin: 'https://blog.51cto.com',
        Referer: 'https://blog.51cto.com/blogger/publish',
      },
      resourceTypes: ['xmlhttprequest'],
    },
  ]

  /**
   * 检查登录状态
   */
  async checkAuth(): Promise<AuthResult> {
    try {
      const response = await this.runtime.fetch('https://blog.51cto.com/blogger/publish', {
        credentials: 'include',
      })
      const html = await response.text()

      // 解析页面获取用户信息
      const imgMatch = html.match(/<li class="more user">\s*<a[^>]*href="([^"]+)"[^>]*>\s*<img[^>]*src="([^"]+)"/)
      if (!imgMatch) {
        return { isAuthenticated: false, error: '未登录' }
      }

      const userLink = imgMatch[1]
      const avatar = imgMatch[2]
      const uid = userLink.split('/').filter(Boolean).pop() || ''

      // 获取 csrf token
      const csrfMatch = html.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"/)
      if (csrfMatch) {
        this.csrf = csrfMatch[1]
      }

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
   * 获取上传签名
   */
  private async getUploadSign(): Promise<UploadSignResponse['data']> {
    const response = await this.runtime.fetch('https://blog.51cto.com/getUploadSign', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://blog.51cto.com/blogger/publish',
        'Origin': 'https://blog.51cto.com',
      },
      body: 'upload_type=image',
    })

    const res: UploadSignResponse = await response.json()
    if (res.code !== 0) {
      throw new Error(res.msg || '获取上传签名失败')
    }
    return res.data
  }

  /**
   * 获取上传配置 (腾讯云 COS 凭证)
   */
  private async getUploadConfig(
    uploadSign: string,
    ext: string,
    filename: string
  ): Promise<UploadConfigResponse['data']> {
    const response = await this.runtime.fetch('https://blog.51cto.com/getUploadConfig', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: new URLSearchParams({
        upload_type: 'image',
        upload_sign: uploadSign,
        ext: ext,
        name: filename,
      }).toString(),
    })

    const res: UploadConfigResponse = await response.json()
    if (res.code !== 0) {
      throw new Error(res.msg || '获取上传配置失败')
    }
    return res.data
  }

  /**
   * 上传图片到腾讯云 COS
   */
  private async uploadToCOS(
    cosUrl: string,
    fields: UploadConfigResponse['data']['fields'],
    file: File
  ): Promise<string> {
    const formData = new FormData()

    // 按顺序添加字段 (顺序很重要)
    formData.append('key', fields.key)
    formData.append('policy', fields.policy)
    formData.append('x-amz-algorithm', fields['x-amz-algorithm'])
    formData.append('x-amz-signature', fields['x-amz-signature'])
    formData.append('x-amz-credential', fields['x-amz-credential'])
    formData.append('X-Amz-Date', fields['X-Amz-Date'])
    formData.append('Content-Type', file.type)
    formData.append('file', file)

    const response = await this.runtime.fetch(cosUrl, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`上传到 COS 失败: ${response.status}`)
    }

    // 返回图片 URL (通过 51cto CDN)
    return `https://s2.51cto.com/${fields.key}`
  }

  /**
   * 上传图片
   */
  async uploadImageByUrl(url: string): Promise<ImageUploadResult> {
    // 下载图片
    const imageResponse = await this.runtime.fetch(url)
    const blob = await imageResponse.blob()

    // 确定文件扩展名和 MIME 类型
    const mimeType = blob.type || 'image/jpeg'
    const ext = mimeType.split('/')[1] || 'jpeg'
    const filename = `${Date.now()}.${ext}`
    const file = new File([blob], filename, { type: mimeType })

    // Step 1: 获取上传签名
    const signData = await this.getUploadSign()

    // Step 2: 获取上传配置
    const configData = await this.getUploadConfig(signData.sign, mimeType, filename)

    // Step 3: 上传到腾讯云 COS
    const imageUrl = await this.uploadToCOS(configData.url, configData.fields, file)

    return { url: imageUrl }
  }

  /**
   * 发布文章
   */
  async publish(article: Article): Promise<SyncResult> {
    const now = Date.now()
    return this.withHeaderRules(this.HEADER_RULES, async () => {
      // 确保已获取 csrf
      if (!this.csrf) {
        const auth = await this.checkAuth()
        if (!auth.isAuthenticated) {
          throw new Error('未登录')
        }
      }

      // 优先使用 markdown，处理图片
      const hasMarkdown = !!article.markdown
      let content = article.markdown || article.html || ''
      content = await this.processImages(content, (src) => this.uploadImageByUrl(src))

      // 构建请求数据
      const postData: Record<string, string> = {
        title: article.title,
        content: content,
        pid: '',
        cate_id: '',
        custom_id: '0',
        tag: '',
        abstract: '',
        banner_type: '0',
        blog_type: '1',
        copy_code: '1',
        is_hide: '0',
        top_time: '0',
        is_comment: '0',
        is_old: hasMarkdown ? '0' : '2',
        blog_id: '',
        did: '',
        work_id: '',
        class_id: '',
        subjectId: '',
        import_type: '-1',
        invite_code: '',
        raffle: '',
        orig: '',
        _csrf: this.csrf || '',
      }

      const response = await this.runtime.fetch('https://blog.51cto.com/blogger/draft', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
        },
        body: new URLSearchParams(postData).toString(),
      })

      const res = await response.json()

      if (res.status !== 1 || !res.data) {
        throw new Error(res.msg || '发布失败')
      }

      return {
        platform: this.meta.id,
        success: true,
        postId: String(res.data.did),
        postUrl: `https://blog.51cto.com/blogger/draft/${res.data.did}`,
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
