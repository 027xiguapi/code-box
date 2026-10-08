/**
 * 编辑器辅助适配器基类（半自动同步）
 *
 * 适用场景：
 * - 平台未公开发布接口，或接口需要浏览器端签名（x-s / x-t 等）与风控校验
 * - 社区常用的做法是「打开官方编辑器 + 自动填充内容」，再由用户确认发布
 *
 * 流程：
 * 1. 打开平台编辑器页面（新标签页）
 * 2. 等待加载完成后注入填充脚本：写入标题、正文（富文本）
 * 3. 返回结果，提示用户在编辑器中确认并保存草稿/发布
 *
 * 注意：填充脚本通过 chrome.scripting.executeScript 注入，
 * 因此必须是自包含的纯函数（不能引用模块作用域变量）。
 */
import type { Article, SyncResult } from '../types'
import type { PublishOptions } from './types'
import { CodeAdapter } from './code-adapter'
import { createLogger } from '../lib/logger'

const logger = createLogger('EditorAssist')

/**
 * 注入到编辑器的填充脚本（必须自包含）
 */
export function fillEditorScript(payload: {
  title: string
  html: string
  text: string
  titleSelectors: string[]
  editorSelectors: string[]
  removeSelectors: string[]
}): {
  titleFilled: boolean
  contentFilled: boolean
  editorFound: boolean
  hint?: string
} {
  const { title, html, text, titleSelectors, editorSelectors, removeSelectors } = payload

  function isVisible(el: Element): boolean {
    const rect = (el as HTMLElement).getBoundingClientRect?.()
    if (!rect) return false
    return rect.width > 0 && rect.height > 0
  }

  function queryAny(selectors: string[], root: ParentNode = document): HTMLElement | null {
    for (const sel of selectors) {
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(sel))
      const visible = nodes.find(isVisible) || nodes[0]
      if (visible) return visible
    }
    return null
  }

  function setNativeValue(el: HTMLElement, value: string) {
    const proto =
      el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : el instanceof HTMLInputElement
          ? HTMLInputElement.prototype
          : null
    const descriptor = proto && Object.getOwnPropertyDescriptor(proto, 'value')
    if (descriptor && descriptor.set) {
      descriptor.set.call(el, value)
    } else {
      ;(el as HTMLInputElement).value = value
    }
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  }

  function insertRichHtml(el: HTMLElement, content: string) {
    el.focus()

    // 清空已有内容
    const selection = window.getSelection()
    if (selection) {
      const range = document.createRange()
      range.selectNodeContents(el)
      selection.removeAllRanges()
      selection.addRange(range)
    }

    let ok = false
    try {
      ok = document.execCommand('insertHTML', false, content)
    } catch {
      ok = false
    }

    // execCommand 失败时退化为直接写入 innerHTML
    if (!ok || !el.textContent || el.textContent.trim().length === 0) {
      el.innerHTML = content
      el.dispatchEvent(
        new InputEvent('input', { bubbles: true, inputType: 'insertText' })
      )
    }

    el.dispatchEvent(new Event('change', { bubbles: true }))
  }

  const result: {
    titleFilled: boolean
    contentFilled: boolean
    editorFound: boolean
    hint?: string
  } = { titleFilled: false, contentFilled: false, editorFound: false }

  // 1. 填充标题
  if (title) {
    const titleEl = queryAny(titleSelectors)
    if (titleEl) {
      if (titleEl instanceof HTMLInputElement || titleEl instanceof HTMLTextAreaElement) {
        setNativeValue(titleEl, title)
        result.titleFilled = true
      } else if (titleEl.isContentEditable) {
        insertRichHtml(titleEl, title.replace(/</g, '&lt;'))
        result.titleFilled = true
      }
    }
  }

  // 2. 填充正文
  const editorEl = queryAny(editorSelectors)
  if (editorEl) {
    result.editorFound = true

    // 清理编辑器内的干扰元素
    for (const sel of removeSelectors) {
      try {
        editorEl.querySelectorAll(sel).forEach((child) => child.remove())
      } catch {
        // 忽略无效选择器
      }
    }

    if (editorEl.isContentEditable) {
      insertRichHtml(editorEl, html || text)
      result.contentFilled = true
    } else if (
      editorEl instanceof HTMLTextAreaElement ||
      editorEl instanceof HTMLInputElement
    ) {
      setNativeValue(editorEl, text || html)
      result.contentFilled = true
    }

    // 部分编辑器使用 ProseMirror，需要额外触发一次 input 让框架同步状态
    editorEl.dispatchEvent(new Event('input', { bubbles: true }))
  }

  if (!result.editorFound) {
    result.hint = '未找到编辑器容器，请手动粘贴内容'
  }

  return result
}

export interface EditorAssistConfig {
  /** 编辑器页面地址 */
  editorUrl: string
  /** 标题输入框选择器（按优先级） */
  titleSelectors?: string[]
  /** 正文编辑器选择器（按优先级） */
  editorSelectors?: string[]
  /** 填充前需要从编辑器里移除的元素 */
  removeSelectors?: string[]
  /** 填入编辑器后给用户的提示 */
  hint?: string
  /** 等待页面渲染的时间（毫秒，默认 3000） */
  waitBeforeFill?: number
  /** 纯文本编辑器（如 X）：内容以纯文本插入，不做富文本解析 */
  textOnly?: boolean
  /** 内容最大长度（超出截断，0 表示不限制） */
  maxLength?: number
}

/**
 * 编辑器辅助适配器
 */
export abstract class EditorAssistAdapter extends CodeAdapter {
  abstract readonly editorConfig: EditorAssistConfig

  /**
   * 打开编辑器并填充内容
   */
  protected async openEditorAndFill(
    article: Article,
    options?: PublishOptions
  ): Promise<SyncResult> {
    const config = this.editorConfig

    if (!this.runtime.tabs) {
      throw new Error('当前运行环境不支持打开编辑器，请在扩展中运行')
    }

    logger.info('Opening editor:', config.editorUrl)

    const tab = await this.runtime.tabs.create(config.editorUrl, true)
    await this.runtime.tabs.waitForLoad(tab.id)
    await this.delay(config.waitBeforeFill ?? 3000)

    let text = article.markdown || article.html || ''
    if (config.maxLength && text.length > config.maxLength) {
      text = text.slice(0, config.maxLength)
    }

    const html = config.textOnly ? plainTextToHtml(text) : article.html || ''

    const filled = await this.runtime.tabs.executeScript(
      tab.id,
      fillEditorScript,
      [
        {
          title: article.title,
          html,
          text,
          titleSelectors: config.titleSelectors || DEFAULT_TITLE_SELECTORS,
          editorSelectors: config.editorSelectors || DEFAULT_EDITOR_SELECTORS,
          removeSelectors: config.removeSelectors || []
        }
      ]
    )

    logger.debug('Fill result:', filled)

    const message =
      filled?.hint ||
      config.hint ||
      '已打开编辑器并自动填充内容，请确认后保存草稿或发布'

    const success = Boolean(filled?.contentFilled || filled?.titleFilled)

    return this.createResult(success, {
      postUrl: config.editorUrl,
      draftOnly: options?.draftOnly ?? false,
      message,
      error: success ? undefined : '未能在编辑器中定位输入框，请手动粘贴内容'
    })
  }
}

/** 通用标题选择器 */
const DEFAULT_TITLE_SELECTORS = [
  'input[placeholder*="标题"]',
  'input[placeholder*="请输入标题"]',
  'textarea[placeholder*="标题"]',
  'input[class*="title"]',
  'textarea[class*="title"]',
  '[contenteditable="true"][class*="title"]',
  'h1[contenteditable="true"]'
]

/** 通用正文编辑器选择器 */
const DEFAULT_EDITOR_SELECTORS = [
  '.ProseMirror[contenteditable="true"]',
  '.tiptap[contenteditable="true"]',
  '[contenteditable="true"][class*="editor"]',
  '[contenteditable="true"][class*="content"]',
  'div[role="textbox"][contenteditable="true"]',
  'textarea[placeholder*="正文"]',
  'textarea[class*="editor"]'
]

/**
 * 纯文本转 HTML（保留换行的安全文本）
 */
function plainTextToHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}
