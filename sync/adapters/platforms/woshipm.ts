/**
 * 人人都是产品经理 (woshipm.com) 适配器
 */
import { CodeAdapter, type ImageUploadResult } from '../code-adapter'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { PublishOptions } from '../types'
import { createLogger } from '../../lib/logger'

const logger = createLogger('Woshipm')

export class WoshipmAdapter extends CodeAdapter {
  readonly meta: PlatformMeta = {
    id: 'woshipm',
    name: '人人都是产品经理',
    icon: 'https://www.woshipm.com/favicon.ico',
    homepage: 'https://www.woshipm.com',
    capabilities: ['article', 'draft', 'image_upload'],
    category: '产品',
    syncMode: 'api',
  }

  /** 预处理配置: 人人都是产品经理使用 HTML 格式 */
  readonly preprocessConfig = {
    outputFormat: 'html' as const,
    removeEmptyLines: true,
  }

  private jltoken: string = ''

  /** 人人都是产品经理 API 需要的 Header 规则 */
  private readonly HEADER_RULES = [
    {
      urlFilter: '*://woshipm.com/wp-admin/admin-ajax.php*',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      resourceTypes: ['xmlhttprequest'],
    },
    {
      urlFilter: '*://woshipm.com/api2/*',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      resourceTypes: ['xmlhttprequest'],
    },
    {
      urlFilter: '*://woshipm.com/tensorflow/upyun/upload*',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      resourceTypes: ['xmlhttprequest'],
    },
  ]

  async checkAuth(): Promise<AuthResult> {
    try {
      // 1. 先获取用户页面以获取 uid
      const pageResponse = await this.runtime.fetch('https://www.woshipm.com/writing', {
        method: 'GET',
        credentials: 'include',
      })

      const pageText = await pageResponse.text()

      // 从页面提取 jltoken: "jltoken":"xxx"
      const jltokenMatch = pageText.match(/"jltoken"\s*:\s*"([^"]+)"/)
      if (jltokenMatch) {
        this.jltoken = jltokenMatch[1]
        logger.debug('Found jltoken')
      }

      // 从页面提取 uid: var userSettings = {"url":"\/","uid":"1585",...}
      const uidMatch = pageText.match(/var\s+userSettings\s*=\s*\{[^}]*"uid"\s*:\s*"(\d+)"/)
      if (!uidMatch) {
        return { isAuthenticated: false }
      }

      const uid = uidMatch[1]

      // 2. 调用 profile API 验证登录状态
      const response = await this.runtime.fetch(
        `https://www.woshipm.com/api2/user/profile?uid=${uid}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      )

      const data = await response.json() as {
        CODE?: number
        RESULT?: {
          userInfoVo?: {
            uid?: number
            nickName?: string
            avartar?: string  // API typo: avartar instead of avatar
          }
        }
      }

      if (data.CODE === 200 && data.RESULT?.userInfoVo?.uid) {
        return {
          isAuthenticated: true,
          userId: String(data.RESULT.userInfoVo.uid),
          username: data.RESULT.userInfoVo.nickName,
          avatar: data.RESULT.userInfoVo.avartar,
        }
      }

      return { isAuthenticated: false }
    } catch (error) {
      logger.debug('checkAuth: not logged in -', error)
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    return this.withHeaderRules(this.HEADER_RULES, async () => {
      logger.info('Starting publish...')

      // 1. 使用预处理好的 HTML（Content Script 已处理代码块、图片、特殊标签等）
      // 人人都是产品经理使用 HTML 格式
      let content = article.html || ''

      // 2. 处理图片
      content = await this.processImages(
        content,
        (src) => this.uploadImageByUrl(src),
        {
          skipPatterns: ['woshipm.com', 'image.woshipm.com'],
          onProgress: options?.onImageProgress,
        }
      )

      // 4. 创建草稿
      const createResponse = await this.runtime.fetch(
        'https://www.woshipm.com/wp-admin/admin-ajax.php',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: new URLSearchParams({
            action: 'add_draft',
            post_title: article.title,
            post_content: content,
          }),
        }
      )

      // 检查响应状态和内容
      const responseText = await createResponse.text()
      logger.debug('Create draft response:', createResponse.status, responseText.substring(0, 300))

      if (!createResponse.ok) {
        throw new Error(`创建草稿失败: ${createResponse.status} - ${responseText}`)
      }

      let createData: { post_id?: string | number; url?: string; success?: boolean; error?: string }
      try {
        createData = JSON.parse(responseText)
      } catch {
        throw new Error(`创建草稿失败: 响应不是有效 JSON - ${responseText.substring(0, 100)}`)
      }

      if (!createData.post_id) {
        throw new Error(createData.error || '创建草稿失败: 无效响应')
      }

      const draftId = String(createData.post_id)
      const draftUrl = createData.url || `https://www.woshipm.com/writing?pid=${draftId}`

      logger.debug('Draft created:', draftId)

      return this.createResult(true, {
        postId: draftId,
        postUrl: draftUrl,
        draftOnly: options?.draftOnly ?? true,
      })
    }).catch((error) => this.createResult(false, {
      error: (error as Error).message,
    }))
  }

  /**
   * 通过 Blob 上传图片（覆盖基类方法）
   */
  async uploadImage(file: Blob, filename?: string): Promise<string> {
    return this.uploadImageBinaryInternal(file, filename || 'image.png')
  }

  /**
   * 通过 URL 上传图片
   */
  protected async uploadImageByUrl(src: string): Promise<ImageUploadResult> {
    try {
      // 1. 下载图片（使用 runtime.fetch 以支持跨域）
      const imageResponse = await this.runtime.fetch(src, {
        credentials: 'omit',
      })
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`)
      }

      const blob = await imageResponse.blob()

      // 2. 上传到 woshipm
      const url = await this.uploadImageBinaryInternal(blob, this.getFilenameFromUrl(src))
      return { url }
    } catch (error) {
      logger.warn('Failed to upload image by URL:', src, error)
      return { url: src } // 失败时返回原 URL
    }
  }

  /**
   * 上传图片 (二进制方式) - 内部使用
   */
  private async uploadImageBinaryInternal(file: Blob, filename: string): Promise<string> {
    const formData = new FormData()
    formData.append('action', 'wpuf_insert_image')
    formData.append('name', filename)
    formData.append('files', file, filename)

    const headers: Record<string, string> = {
      'Origin': 'https://www.woshipm.com',
      'Referer': 'https://www.woshipm.com/writing',
    }
    if (this.jltoken) {
      headers['jlstar'] = `Bearer ${this.jltoken}`
    }

    const response = await this.runtime.fetch('https://www.woshipm.com/tensorflow/upyun/upload', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    })

    const data = await response.json() as {
      data?: Array<{ url?: string }>
      error?: string
    }

    if (data.data && data.data.length > 0 && data.data[0].url) {
      logger.debug('Uploaded image:', filename, '->', data.data[0].url)
      return data.data[0].url
    }

    throw new Error(data.error || 'Failed to upload image')
  }

  /**
   * 从 URL 提取文件名
   */
  private getFilenameFromUrl(url: string): string {
    try {
      const pathname = new URL(url).pathname
      const filename = pathname.split('/').pop() || 'image.png'
      return filename
    } catch {
      return 'image.png'
    }
  }
}
