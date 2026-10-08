/**
 * 文章同步 - 内容提取与预处理 Content Script
 *
 * 职责：
 * 1. 响应同步面板的请求，提取当前页面的文章（标题 / HTML / Markdown / 封面）
 * 2. 为每个目标平台分别预处理内容（不同平台需要不同的 HTML 结构）
 *
 * 说明：Markdown 转换与平台预处理都依赖真实 DOM，
 * 因此放在页面环境执行，Service Worker / 扩展页面只负责调用平台接口。
 */
import type { PlasmoCSConfig } from "plasmo"

import { extractArticle } from "~sync/extension/extractor"
import {
  preprocessForPlatform,
  preprocessContentDOM
} from "~sync/extension/content-processor"
import { htmlToMarkdownNative } from "~sync/lib/turndown"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_idle",
  all_frames: false
}

interface PreprocessPayload {
  rawHtml: string
  platforms: string[]
  configs: Record<string, Record<string, unknown>>
}

/**
 * 为多个平台分别预处理内容
 */
function preprocessForMultiplePlatforms(payload: PreprocessPayload) {
  const { rawHtml, platforms, configs } = payload
  const results: Record<string, { html: string; markdown: string }> = {}

  for (const platformId of platforms) {
    const config = configs?.[platformId]

    if (config) {
      results[platformId] = preprocessForPlatform(rawHtml, config as any)
    } else {
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = rawHtml
      preprocessContentDOM(tempDiv)
      const html = tempDiv.innerHTML
      results[platformId] = {
        html,
        markdown: htmlToMarkdownNative(html)
      }
    }
  }

  return results
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== "object") return

  // 提取当前页面文章
  if (message.type === "CODEBOX_SYNC_EXTRACT") {
    try {
      const article = extractArticle()
      sendResponse({ success: Boolean(article), article })
    } catch (error) {
      sendResponse({ success: false, error: (error as Error).message })
    }
    return true
  }

  // 平台内容预处理
  if (message.type === "CODEBOX_SYNC_PREPROCESS") {
    try {
      const platformContents = preprocessForMultiplePlatforms(message.payload)
      sendResponse({ success: true, platformContents })
    } catch (error) {
      sendResponse({ success: false, error: (error as Error).message })
    }
    return true
  }

  // 探测页面是否可同步
  if (message.type === "CODEBOX_SYNC_PING") {
    sendResponse({ success: true, url: window.location.href })
    return true
  }
})
