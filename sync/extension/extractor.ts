/**
 * 文章提取器（运行在 Content Script / 页面环境）
 *
 * 提取策略（参考 wechatsync/Wechatsync）：
 * 1. 站点专属提取：微信公众号、掘金、CSDN、知乎等常见文章站
 * 2. 站点配置表：命中域名时按配置选择正文容器
 * 3. 通用提取：按文本密度评分挑选最优正文容器（自动过滤导航/评论/广告）
 *
 * 内容格式：在页面端用 Turndown + 原生 DOM 转 Markdown，
 * 平台专属 HTML 预处理由 content-processor 完成。
 */
import { htmlToMarkdownNative } from '../lib/turndown'
import {
  backupAndSimplifyCodeBlocks,
  preprocessContentDOM,
  restoreCodeBlocks
} from './content-processor'

export interface ExtractedArticle {
  title: string
  markdown: string
  html?: string
  summary?: string
  cover?: string
  source: {
    url: string
    platform: string
  }
}

// ============ 站点配置表 ============

interface SiteExtractConfig {
  domains: string[]
  platform: string
  contentSelector: string
  titleSelectors?: string[]
  removeSelectors?: string[]
  unwrapHeadingSelectors?: string[]
}

const SITE_CONFIGS: SiteExtractConfig[] = [
  {
    domains: ['juejin.cn'],
    platform: 'juejin',
    contentSelector: '.markdown-body',
    titleSelectors: ['h1.article-title', '.article-title'],
    removeSelectors: ['.copy-code-btn', '.code-block-extension-header', '.article-end-mask']
  },
  {
    domains: ['blog.csdn.net', 'devpress.csdn.net'],
    platform: 'csdn',
    contentSelector: '#content_views',
    titleSelectors: ['h1.title-article', '.article-title-box h1'],
    removeSelectors: ['.hide-article-box', '.blog-code-operate', '.recommend-box']
  },
  {
    domains: ['zhihu.com'],
    platform: 'zhihu',
    contentSelector: '.RichContent-inner, .Post-RichTextContainer, .AnswerCard .RichText',
    titleSelectors: ['h1.Post-Title', '.QuestionHeader-title'],
    removeSelectors: ['.ContentItem-actions', '.Reward', '.Post-SideActions', '.RichContent-actions']
  },
  {
    domains: ['jianshu.com'],
    platform: 'jianshu',
    contentSelector: 'article',
    titleSelectors: ['h1.title', '.article .title'],
    removeSelectors: ['.follow-detail', '.support-author', '#free-reward-panel']
  },
  {
    domains: ['cnblogs.com'],
    platform: 'cnblogs',
    contentSelector: '#cnblogs_post_body',
    titleSelectors: ['#cb_post_title_url', 'a.postTitle2'],
    removeSelectors: ['.postDesc', '#blog_post_info_block']
  },
  {
    domains: ['segmentfault.com'],
    platform: 'segmentfault',
    contentSelector: '.article__content, article',
    titleSelectors: ['h1.article__title', 'h1']
  },
  {
    domains: ['oschina.net'],
    platform: 'oschina',
    contentSelector: '.article-detail, .content',
    titleSelectors: ['h1.header', '.article-detail h1']
  },
  {
    domains: ['51cto.com'],
    platform: '51cto',
    contentSelector: '.article-content, #result',
    titleSelectors: ['h1.article-title', '.article-title', 'h1']
  },
  {
    domains: ['imooc.com'],
    platform: 'imooc',
    contentSelector: '.article-content, .course-content',
    titleSelectors: ['h1.title', '.article-title', 'h1']
  },
  {
    domains: ['github.com'],
    platform: 'github',
    contentSelector: '.markdown-body',
    titleSelectors: ['[itemprop="name"] a', '.AppHeader-context-item-label'],
    removeSelectors: [
      '.anchor',
      'a[aria-hidden="true"]',
      '.octicon',
      '.zeroclipboard-container',
      '.btn-octicon'
    ],
    unwrapHeadingSelectors: ['.markdown-heading']
  },
  {
    domains: ['sohu.com'],
    platform: 'sohu',
    contentSelector: '#mp-editor, article',
    titleSelectors: ['h1', '.article-title']
  },
  {
    domains: ['baijiahao.baidu.com'],
    platform: 'baijiahao',
    contentSelector: '#article, .article-content',
    titleSelectors: ['h2', '.article-title']
  },
  {
    domains: ['toutiao.com'],
    platform: 'toutiao',
    contentSelector: 'article, .article-content, .syl-article-base',
    titleSelectors: ['h1', '.article-title']
  },
  {
    domains: ['douban.com'],
    platform: 'douban',
    contentSelector: '#link-report, .note, .article',
    titleSelectors: ['h1', '.note-title']
  },
  {
    domains: ['yuque.com'],
    platform: 'yuque',
    contentSelector: '.yuque-doc-content, .ne-viewer-body, .lake-content',
    titleSelectors: ['.doc-title', 'h1']
  },
  {
    domains: ['woshipm.com'],
    platform: 'woshipm',
    contentSelector: '.article-content, .post-content',
    titleSelectors: ['h1', '.article-title']
  },
  {
    domains: ['xueqiu.com'],
    platform: 'xueqiu',
    contentSelector: '.article__bd__detail, .status-content',
    titleSelectors: ['h1.article__bd__title', '.article__bd__title']
  },
  {
    domains: ['eastmoney.com'],
    platform: 'eastmoney',
    contentSelector: '#ContentBody, .article-body',
    titleSelectors: ['h1', '.title']
  },
  {
    domains: ['bilibili.com'],
    platform: 'bilibili',
    contentSelector: '#read-article-holder, .article-holder',
    titleSelectors: ['h1.article-title', '.title-container h1']
  },
  {
    domains: ['medium.com'],
    platform: 'medium',
    contentSelector: 'article',
    titleSelectors: ['h1']
  },
  {
    domains: ['zhuanlan.zhihu.com'],
    platform: 'zhihu',
    contentSelector: '.Post-RichTextContainer',
    titleSelectors: ['h1.Post-Title']
  }
]

function findSiteConfig(hostname: string): SiteExtractConfig | undefined {
  return SITE_CONFIGS.find((config) =>
    config.domains.some(
      (domain) => hostname === domain || hostname.endsWith('.' + domain)
    )
  )
}

// ============ 工具 ============

function getMeta(property: string): string | undefined {
  const el =
    document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`) ||
    document.querySelector<HTMLMetaElement>(`meta[name="${property}"]`)
  return el?.content?.trim() || undefined
}

function pickTitle(selectors?: string[]): string {
  if (selectors) {
    for (const sel of selectors) {
      const el = document.querySelector(sel)
      const text = el?.textContent?.trim()
      if (text) return text
    }
  }

  const h1 = document.querySelector('h1')?.textContent?.trim()
  if (h1) return h1

  return (
    getMeta('og:title') ||
    getMeta('title') ||
    document.title.replace(/[|_-]\s*[^|_-]*$/, '').trim() ||
    document.title
  )
}

/**
 * 克隆正文容器并做基础清理（代码块简化、懒加载图片补全、去噪）
 */
function buildContentHtml(contentEl: Element, removeSelectors?: string[]): string {
  const codeBlockBackups = backupAndSimplifyCodeBlocks(contentEl)

  try {
    const cloned = contentEl.cloneNode(true) as HTMLElement
    restoreCodeBlocks(codeBlockBackups)

    if (removeSelectors?.length) {
      for (const sel of removeSelectors) {
        try {
          cloned.querySelectorAll(sel).forEach((el) => el.remove())
        } catch {
          // 忽略无效选择器
        }
      }
    }

    // 通用去噪
    cloned
      .querySelectorAll(
        'script, style, link, noscript, iframe, .share, .comment, .comments, .recommend, .ad, .advertisement, [class*="toolbar"]'
      )
      .forEach((el) => el.remove())

    // 懒加载图片
    cloned.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
      const dataSrc =
        img.getAttribute('data-src') ||
        img.getAttribute('data-original') ||
        img.getAttribute('data-echo') ||
        img.getAttribute('data-lazy-src') ||
        img.getAttribute('data-actualsrc')
      if (dataSrc && (!img.src || img.src.startsWith('data:'))) {
        img.setAttribute('src', dataSrc)
      }
      img.removeAttribute('srcset')
      img.removeAttribute('data-src')
    })

    preprocessContentDOM(cloned)

    return cloned.innerHTML
  } catch (error) {
    restoreCodeBlocks(codeBlockBackups)
    throw error
  }
}

function buildArticle(
  title: string,
  contentEl: Element,
  platform: string,
  removeSelectors?: string[]
): ExtractedArticle {
  const html = buildContentHtml(contentEl, removeSelectors)
  const markdown = htmlToMarkdownNative(html)

  return {
    title,
    markdown,
    html,
    summary: getMeta('description') || getMeta('og:description'),
    cover: getMeta('og:image') || getMeta('twitter:image'),
    source: {
      url: window.location.href,
      platform
    }
  }
}

// ============ 微信公众号 ============

function extractWeixinArticle(): ExtractedArticle | null {
  const title =
    document.querySelector('#activity-name')?.textContent?.trim() ||
    document.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim()

  const contentEl =
    document.querySelector('#js_content') || document.querySelector('#img-content')

  if (!title || !contentEl) return null

  return buildArticle(title, contentEl, 'weixin')
}

// ============ 通用提取 ============

const GENERIC_CANDIDATES = [
  'article',
  '.article-content',
  '.post-content',
  '.entry-content',
  '.markdown-body',
  '.RichText',
  '[itemprop="articleBody"]',
  '#content',
  '.content',
  'main'
]

/**
 * 按文本密度评分挑选最优正文容器
 */
function pickBestCandidate(): Element | null {
  let best: Element | null = null
  let bestScore = 0

  for (const selector of GENERIC_CANDIDATES) {
    const nodes = Array.from(document.querySelectorAll(selector))

    for (const node of nodes) {
      const text = node.textContent || ''
      const textLength = text.replace(/\s/g, '').length
      if (textLength < 200) continue

      // 链接密度过高通常是导航/目录，降权
      const linkText = Array.from(node.querySelectorAll('a'))
        .map((a) => a.textContent || '')
        .join('')
      const linkRatio = linkText.length / Math.max(textLength, 1)

      const score = textLength * (1 - Math.min(linkRatio, 0.8))

      if (score > bestScore) {
        bestScore = score
        best = node
      }
    }
  }

  return best
}

function extractGenericArticle(): ExtractedArticle | null {
  const siteConfig = findSiteConfig(window.location.hostname)

  if (siteConfig) {
    const contentEl = document.querySelector(siteConfig.contentSelector)
    if (contentEl) {
      return buildArticle(
        pickTitle(siteConfig.titleSelectors),
        contentEl,
        siteConfig.platform,
        siteConfig.removeSelectors
      )
    }
  }

  const candidate = pickBestCandidate()
  if (candidate) {
    return buildArticle(pickTitle(), candidate, 'generic')
  }

  // 最后手段：body
  const textLength = (document.body?.textContent || '').replace(/\s/g, '').length
  if (textLength > 200) {
    return buildArticle(pickTitle(), document.body, 'body')
  }

  return null
}

// ============ 对外入口 ============

/**
 * 提取当前页面的文章
 */
export function extractArticle(): ExtractedArticle | null {
  const url = window.location.href

  if (url.includes('mp.weixin.qq.com')) {
    const article = extractWeixinArticle()
    if (article) return article
  }

  return extractGenericArticle()
}

/**
 * 轻量探测：当前页面是否像一篇文章（用于界面提示）
 */
export function detectArticle(): { title: string; wordCount: number } | null {
  const article = extractArticle()
  if (!article) return null

  return {
    title: article.title,
    wordCount: (article.markdown || '').replace(/\s/g, '').length
  }
}
