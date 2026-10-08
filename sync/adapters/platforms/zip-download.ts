/**
 * Markdown 压缩包下载适配器
 *
 * 将文章导出为 Markdown + 图片的 ZIP 压缩包：
 * - article.md: Markdown 文件
 * - images/: 图片目录，所有图片使用相对路径引用
 *
 * 使用 chrome.downloads API 直接触发下载，避免大文件传递问题
 */
import type { Article, AuthResult, SyncResult, PlatformMeta } from '../../types'
import type { PublishOptions } from '../types'
import { CodeAdapter } from '../code-adapter'
import { htmlToMarkdown } from '../../lib/turndown'
import { createLogger } from '../../lib/logger'
import { parseMarkdownImages } from '../../lib/markdown-images'
import JSZip from 'jszip'

const logger = createLogger('ZipDownload')

export class ZipDownloadAdapter extends CodeAdapter {
  readonly meta: PlatformMeta = {
    id: 'zip-download',
    name: 'Markdown 压缩包',
    icon: 'https://cdn-icons-png.flaticon.com/512/337/337946.png',
    homepage: '',
    capabilities: ['article'],
    category: '建站/CMS',
    syncMode: 'api',
  }

  /**
   * 本地导出不需要认证
   */
  async checkAuth(): Promise<AuthResult> {
    return {
      isAuthenticated: true,
      username: '本地下载',
    }
  }

  /**
   * 导出为 ZIP 压缩包
   */
  async publish(article: Article, options?: PublishOptions): Promise<SyncResult> {
    try {
      const zip = new JSZip()
      const imgFolder = zip.folder('images')!

      // 获取 Markdown 内容
      let markdown = article.markdown || htmlToMarkdown(article.html || '')

      if (!markdown.trim()) {
        return this.createResult(false, {
          error: '文章内容为空',
        })
      }

      // 添加标题
      const title = article.title || '未命名文章'
      if (!markdown.startsWith('# ')) {
        markdown = `# ${title}\n\n${markdown}`
      }

      // 处理图片：下载并替换为相对路径
      const { processedMarkdown, imageCount } = await this.processImagesForZip(
        markdown,
        imgFolder,
        options?.onImageProgress
      )

      // 写入 Markdown 文件
      zip.file('article.md', processedMarkdown)

      // 生成 ZIP Blob
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      })

      // 使用 runtime.downloads 下载
      const filename = this.sanitizeFilename(title) + '.zip'

      if (!this.runtime.downloads) {
        return this.createResult(false, {
          error: '当前环境不支持下载功能',
        })
      }

      const downloadId = await this.runtime.downloads.download(blob, filename, true)
      logger.info(`Download started: ${filename}, id: ${downloadId}`)

      return this.createResult(true, {
        postId: String(downloadId),
        postUrl: '', // 本地下载，无链接
        message: `已下载 ${filename}（${imageCount} 张图片）`,
      })
    } catch (error) {
      logger.error('ZIP download failed:', error)
      return this.createResult(false, {
        error: (error as Error).message,
      })
    }
  }

  /**
   * 处理 Markdown 中的图片：下载并添加到 ZIP
   */
  private async processImagesForZip(
    markdown: string,
    imgFolder: JSZip,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ processedMarkdown: string; imageCount: number }> {
    const matches = parseMarkdownImages(markdown)

    if (matches.length === 0) {
      return { processedMarkdown: markdown, imageCount: 0 }
    }

    logger.info(`Found ${matches.length} images to process`)

    // 生成时间戳前缀（精确到秒）
    const timestamp = Math.floor(Date.now() / 1000)

    let processedMarkdown = markdown
    let imageIndex = 0
    let completed = 0
    const urlToFilename = new Map<string, string>() // 去重：相同 URL 使用相同文件名

    const uniqueUrls: string[] = []
    for (const { src } of matches) {
      if (src.startsWith('data:')) {
        logger.debug('Skipping data URI image')
        continue
      }
      if (!urlToFilename.has(src)) {
        urlToFilename.set(src, '')
        uniqueUrls.push(src)
      }
    }

    if (uniqueUrls.length === 0) {
      return { processedMarkdown: markdown, imageCount: 0 }
    }

    const downloadOne = async (src: string) => {
      try {
        const response = await this.runtime.fetch(src, {
          credentials: 'omit',
        })

        if (!response.ok) {
          logger.warn(`Failed to download image: ${src}, status: ${response.status}`)
          return
        }

        const blob = await response.blob()
        const ext = this.getImageExtension(src, blob.type)
        imageIndex++
        const filename = `image_${timestamp}_${String(imageIndex).padStart(3, '0')}.${ext}`

        imgFolder.file(filename, blob)
        urlToFilename.set(src, filename)

        logger.debug(`Downloaded image: ${filename}`)
      } catch (error) {
        logger.warn(`Failed to download image: ${src}`, error)
      } finally {
        completed++
        onProgress?.(completed, uniqueUrls.length)
      }
    }

    const runPool = async (limit: number) => {
      let cursor = 0
      const workers = Array.from({ length: Math.min(limit, uniqueUrls.length) }, async () => {
        while (cursor < uniqueUrls.length) {
          const current = cursor
          cursor++
          await downloadOne(uniqueUrls[current])
        }
      })
      await Promise.all(workers)
    }

    await runPool(4)

    for (const { full, alt, src } of matches) {
      const filename = urlToFilename.get(src)
      if (filename) {
        processedMarkdown = processedMarkdown.replace(full, `![${alt}](images/${filename})`)
      }
    }

    return {
      processedMarkdown,
      imageCount: Array.from(urlToFilename.values()).filter(Boolean).length,
    }
  }

  /**
   * 获取图片扩展名
   */
  private getImageExtension(url: string, mimeType: string): string {
    // 优先从 MIME 类型获取
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'image/bmp': 'bmp',
      'image/x-icon': 'ico',
    }

    if (mimeType && mimeMap[mimeType]) {
      return mimeMap[mimeType]
    }

    // 从 URL 提取
    const urlMatch = url.match(/\.(png|jpe?g|gif|webp|svg|bmp|ico)(?:\?|$)/i)
    if (urlMatch) {
      return urlMatch[1].toLowerCase().replace('jpeg', 'jpg')
    }

    // 默认 png
    return 'png'
  }

  /**
   * 清理文件名，移除非法字符
   */
  private sanitizeFilename(name: string): string {
    return name
      .replace(/[<>:"/\\|?*]/g, '_') // Windows 非法字符
      .replace(/[\x00-\x1f]/g, '') // 控制字符
      .replace(/\.+$/, '') // 末尾的点
      .trim()
      .slice(0, 200) // 限制长度
      || 'article'
  }
}
