/**
 * 微博适配器
 */
import { CodeAdapter, type ImageUploadResult } from '../code-adapter'
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { PublishOptions } from '../types'
import { createLogger } from '../../lib/logger'
import { parseMarkdownImages } from '../../lib/markdown-images'

const logger = createLogger('Weibo')

interface WeiboUserConfig {
  uid: string
  nick: string
  avatar_large: string
}

export class WeiboAdapter extends CodeAdapter {
  readonly meta: PlatformMeta = {
    id: 'weibo',
    name: '微博',
    icon: 'https://weibo.com/favicon.ico',
    homepage: 'https://card.weibo.com/article/v5/editor',
    capabilities: ['article', 'draft', 'image_upload', 'cover'],
    category: '主流自媒体',
    syncMode: 'api',
  }

  /** 预处理配置: 微博使用 HTML 格式 */
  readonly preprocessConfig = {
    outputFormat: 'html' as const,
  }

  private userConfig: WeiboUserConfig | null = null

  /** 微博 API 需要的 Header 规则 */
  private readonly HEADER_RULES = [
    {
      urlFilter: '*://card.weibo.com/*',
      headers: {
        'Origin': 'https://card.weibo.com',
        'Referer': 'https://card.weibo.com/article/v5/editor',
      },
      resourceTypes: ['xmlhttprequest'],
    },
    {
      urlFilter: '*://picupload.weibo.com/*',
      headers: {
        'Origin': 'https://weibo.com',
        'Referer': 'https://weibo.com/',
      },
      resourceTypes: ['xmlhttprequest'],
    },
  ]

  async checkAuth(): Promise<AuthResult> {
    try {
      const config = await this.getUserConfig()

      if (config?.uid) {
        return {
          isAuthenticated: true,
          userId: config.uid,
          username: config.nick,
          avatar: config.avatar_large,
        }
      }

      return { isAuthenticated: false }
    } catch (error) {
      logger.debug('checkAuth: not logged in -', error)
      return { isAuthenticated: false, error: (error as Error).message }
    }
  }

  /**
   * 获取用户配置 (从编辑器页面解析)
   */
  private async getUserConfig(): Promise<WeiboUserConfig | null> {
    if (this.userConfig) {
      return this.userConfig
    }

    const response = await this.runtime.fetch('https://card.weibo.com/article/v5/editor', {
      credentials: 'include',
    })
    const html = await response.text()

    const configMatch = html.match(/config:\s*JSON\.parse\('(.+?)'\)/)
    if (!configMatch) {
      logger.error('Failed to find config in HTML')
      return null
    }

    try {
      const configJson = configMatch[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\')
      const config = JSON.parse(configJson)

      if (!config.uid) {
        return null
      }

      this.userConfig = {
        uid: String(config.uid),
        nick: config.nick || '',
        avatar_large: config.avatar_large || '',
      }

      logger.debug('User config:', this.userConfig)
      return this.userConfig
    } catch (e) {
      logger.error('Failed to parse config:', e)
      return null
    }
  }

  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    return this.withHeaderRules(this.HEADER_RULES, async () => {
      logger.info('Starting publish...')

      const config = await this.getUserConfig()
      if (!config?.uid) {
        throw new Error('请先登录微博')
      }

      // Use pre-processed HTML content directly
      let content = article.html || ''

      content = content.replace(/>\s+</g, '><')
      content = await this.processWeiboImages(content, options?.onImageProgress)

      const createReqId = this.generateReqId()
      const createResponse = await this.runtime.fetch(
        `https://card.weibo.com/article/v5/aj/editor/draft/create?uid=${config.uid}&_rid=${createReqId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'accept': 'application/json, text/plain, */*',
            'SN-REQID': createReqId,
          },
          body: new URLSearchParams({}),
        }
      )
      const createRes = await createResponse.json() as {
        code: number
        msg?: string
        data?: { id: string }
      }

      if (createRes.code !== 100000 || !createRes.data?.id) {
        throw new Error(createRes.msg || '创建草稿失败')
      }

      const postId = createRes.data.id
      logger.debug('Created draft:', postId)

      let coverUrl = ''
      if (article.cover) {
        try {
          const coverResult = await this.uploadImageByUrl(article.cover)
          coverUrl = coverResult.url
        } catch (e) {
          logger.warn('Failed to upload cover:', e)
        }
      }

      const saveReqId = this.generateReqId()
      const saveResponse = await this.runtime.fetch(
        `https://card.weibo.com/article/v5/aj/editor/draft/save?uid=${config.uid}&id=${postId}&_rid=${saveReqId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'accept': 'application/json, text/plain, */*',
            'SN-REQID': saveReqId,
          },
          body: new URLSearchParams({
            id: postId,
            title: article.title,
            subtitle: '',
            type: '',
            status: '0',
            publish_at: '',
            error_msg: '',
            error_code: '0',
            collection: '[]',
            free_content: '',
            content: content,
            cover: coverUrl,
            summary: '',
            writer: '',
            extra: 'null',
            is_word: '0',
            article_recommend: '[]',
            follow_to_read: '1',
            isreward: '1',
            pay_setting: '{"ispay":0,"isvclub":0}',
            source: '0',
            action: '1',
            content_type: '0',
            save: '1',
          }),
        }
      )
      const saveRes = await saveResponse.json() as {
        code: string | number
        msg?: string
      }

      logger.debug('Save response:', saveRes)

      const code = String(saveRes.code)
      if (code !== '100000') {
        throw new Error(saveRes.msg || `保存失败 (错误码: ${code})`)
      }

      const draftUrl = `https://card.weibo.com/article/v5/editor#/draft/${postId}`

      return this.createResult(true, {
        postId: postId,
        postUrl: draftUrl,
        draftOnly: options?.draftOnly ?? true,
      })
    }).catch((error) => this.createResult(false, {
      error: (error as Error).message,
    }))
  }

  private generateReqId(): string {
    const input = `${this.userConfig?.uid}&${Date.now()}`
    const base64 = btoa(input)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
    let result = base64
    while (result.length < 43) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result.slice(0, 43)
  }

  protected async uploadImageByUrl(src: string): Promise<ImageUploadResult> {
    if (src.startsWith('data:')) {
      logger.debug('Uploading data URI image via direct upload')
      return this.uploadDataUri(src)
    }

    const config = await this.getUserConfig()
    if (!config?.uid) {
      throw new Error('请先登录微博')
    }

    const reqId = this.generateReqId()

    try {
      const uploadRes = await this.runtime.fetch(
        `https://card.weibo.com/article/v5/aj/editor/plugins/asyncuploadimg?uid=${config.uid}&_rid=${reqId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'accept': 'application/json, text/plain, */*',
            'SN-REQID': reqId,
          },
          body: new URLSearchParams({ 'urls[0]': src }),
        }
      )

      const uploadData = await uploadRes.json()
      logger.debug('Async upload response:', uploadData)
    } catch (e) {
      logger.warn('Async upload request failed, will try polling anyway:', e)
    }

    const imgDetail = await this.waitForImageDone(src)
    const imgUrl = `https://wx3.sinaimg.cn/large/${imgDetail.pid}.jpg`

    return {
      url: imgUrl,
      attrs: {
        'data-pid': imgDetail.pid,
      },
    }
  }

  async uploadImageBase64(imageData: string, mimeType: string): Promise<ImageUploadResult> {
    const dataUri = `data:${mimeType};base64,${imageData}`
    return this.uploadDataUri(dataUri)
  }

  private async uploadDataUri(dataUri: string): Promise<ImageUploadResult> {
    const match = dataUri.match(/^data:([^;]+);base64,(.+)$/)
    if (!match) {
      throw new Error('Invalid data URI format')
    }

    const mimeType = match[1]
    const base64Data = match[2]

    const binaryStr = atob(base64Data)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: mimeType })

    logger.debug(`Uploading blob: ${mimeType}, size: ${blob.size}`)

    const reqId = this.generateReqId()
    const uploadUrl = `https://picupload.weibo.com/interface/pic_upload.php?app=miniblog&s=json&p=1&data=1&url=&markpos=1&logo=0&nick=&file_source=4&_rid=${reqId}`

    const response = await this.runtime.fetch(uploadUrl, {
      method: 'POST',
      credentials: 'include',
      body: blob,
    })

    const result = await response.json() as {
      code?: string
      data?: {
        pics?: {
          pic_1?: {
            pid: string
            width: number
            height: number
          }
        }
      }
    }

    logger.debug('Direct upload response:', result)

    if (!result.data?.pics?.pic_1?.pid) {
      throw new Error('图片上传失败: ' + JSON.stringify(result))
    }

    const pid = result.data.pics.pic_1.pid
    const imgUrl = `https://wx3.sinaimg.cn/large/${pid}.jpg`

    return {
      url: imgUrl,
      attrs: {
        'data-pid': pid,
      },
    }
  }

  private async processWeiboImages(
    content: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<string> {
    // Content is pre-processed, use directly
    const processedContent = content

    const figureImgRegex = /<figure[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*>[\s\S]*?<\/figure>/gi
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi
    const matches: { full: string; src: string; hasFigure: boolean }[] = []

    let match
    const figureMatches = new Set<string>()
    while ((match = figureImgRegex.exec(processedContent)) !== null) {
      matches.push({ full: match[0], src: match[1], hasFigure: true })
      figureMatches.add(match[1])
    }

    while ((match = imgRegex.exec(processedContent)) !== null) {
      if (!figureMatches.has(match[1])) {
        matches.push({ full: match[0], src: match[1], hasFigure: false })
      }
    }

    for (const mdMatch of parseMarkdownImages(processedContent)) {
      matches.push({ full: mdMatch.full, src: mdMatch.src, hasFigure: false })
    }

    if (matches.length === 0) {
      return processedContent
    }

    logger.info(`Found ${matches.length} images to process`)

    let result = processedContent
    const uploadedMap = new Map<string, { pid: string; url: string }>()
    let processed = 0

    for (const { full, src, hasFigure } of matches) {
      if (!src) continue

      if (src.includes('sinaimg.cn') || src.includes('weibo.com')) {
        logger.debug(`Skipping weibo image: ${src}`)
        continue
      }

      if (src.startsWith('data:')) {
        continue
      }

      processed++
      onProgress?.(processed, matches.length)

      try {
        let imgInfo = uploadedMap.get(src)

        if (!imgInfo) {
          logger.debug(`Uploading image ${processed}/${matches.length}: ${src}`)
          const uploadResult = await this.uploadImageByUrl(src)
          const pid = uploadResult.attrs?.['data-pid'] as string || ''
          imgInfo = { pid, url: uploadResult.url }
          uploadedMap.set(src, imgInfo)
        }

        let replacement: string
        if (hasFigure) {
          replacement = full.replace(
            /<img[^>]+src="[^"]+"[^>]*>/i,
            `<img src="${imgInfo.url}" data-pid="${imgInfo.pid}" />`
          )
        } else {
          replacement = `<figure class="image"><img src="${imgInfo.url}" data-pid="${imgInfo.pid}" /></figure>`
        }

        result = result.replace(full, replacement)
        logger.debug(`Image uploaded: ${imgInfo.url}`)
      } catch (error) {
        logger.error(`Failed to upload image: ${src}`, error)
      }

      await this.delay(300)
    }

    return result
  }

  private async waitForImageDone(src: string): Promise<{
    pid: string
    url: string
    task_status_code: number
  }> {
    const config = await this.getUserConfig()
    const maxAttempts = 30

    for (let i = 0; i < maxAttempts; i++) {
      const reqId = this.generateReqId()
      const response = await this.runtime.fetch(
        `https://card.weibo.com/article/v5/aj/editor/plugins/asyncimginfo?uid=${config!.uid}&_rid=${reqId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'accept': 'application/json, text/plain, */*',
            'SN-REQID': reqId,
          },
          body: new URLSearchParams({ 'urls[0]': src }),
        }
      )

      const res = await response.json() as {
        data?: Array<{ pid: string; url: string; task_status_code: number }>
      }

      const item = res.data?.[0]
      const statusCode = item?.task_status_code
      if (statusCode === 1 && item) {
        logger.debug('Image upload complete:', item)
        return item
      }

      if (statusCode === 2) {
        // task_status_code === 2 表示失败，不要继续轮询
        throw new Error('图片上传失败')
      }

      await this.delay(1000)
    }

    throw new Error('图片上传超时')
  }
}
