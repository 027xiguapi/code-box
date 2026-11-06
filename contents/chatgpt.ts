import { saveAs } from "file-saver"
import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*", "https://chat.openai.com/*"],
  run_at: "document_idle"
}

const MARKDOWN_BUTTON_ID = "codebox-chatgpt-markdown"
const IMAGE_BUTTON_ID = "codebox-chatgpt-images"

const MESSAGE_SELECTOR = [
  '[data-user-message-bubble="true"]',
  '[data-markdown-text-style="assistant-message"]',
  '[data-message-author-role="user"]',
  '[data-message-author-role="assistant"]'
].join(", ")

const turndownService = Turndown()

type Role = "user" | "assistant"

interface ChatMessage {
  key: string
  role: Role
  markdown: string
  images: string[]
}

const BUTTON_STYLE: Partial<CSSStyleDeclaration> = {
  position: "fixed",
  right: "24px",
  zIndex: "2147483646",
  padding: "8px 16px",
  border: "none",
  borderRadius: "999px",
  background: "#10a37f",
  color: "#fff",
  fontSize: "13px",
  fontWeight: "600",
  lineHeight: "1.4",
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.22)",
  transition: "transform 0.15s ease, opacity 0.15s ease"
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getConversationTitle() {
  const raw = document.title.replace(/\s*[-|·]\s*ChatGPT.*$/i, "").trim()
  return raw || "ChatGPT 对话"
}

function safeFileName(name: string) {
  return (
    name
      .replace(/[\\/:*?"<>|\r\n]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80) || "ChatGPT 对话"
  )
}

function getRole(el: HTMLElement): Role {
  const role = el.getAttribute("data-message-author-role")
  if (role === "user" || role === "assistant") return role
  if (el.hasAttribute("data-user-message-bubble")) return "user"
  return "assistant"
}

function getMessageKey(el: HTMLElement, role: Role) {
  const withId = el.closest("[data-chatgpt-selection-message-id]")
  const messageId = withId?.getAttribute("data-chatgpt-selection-message-id")
  if (messageId) return `${role}:${messageId}`

  const legacyId = el.closest("[data-message-id]")?.getAttribute("data-message-id")
  if (legacyId) return `${role}:${legacyId}`

  const unitKey = el
    .closest("[data-content-search-unit-key]")
    ?.getAttribute("data-content-search-unit-key")
  if (unitKey) return `${role}:${unitKey}`

  return `${role}:${(el.innerText || "").slice(0, 140)}`
}

function extractUserText(el: HTMLElement) {
  const textEl = el.querySelector<HTMLElement>('[dir="auto"]') || el
  const text = textEl.innerText?.trim() || ""
  // 保留用户输入的换行（Markdown 硬换行）
  return text ? text.replace(/\n/g, "  \n") : ""
}

function collectMessageImages(el: HTMLElement) {
  return [...el.querySelectorAll<HTMLImageElement>("img")]
    .filter((img) => !img.closest('[class*="avatar"], [class*="Avatar"]'))
    .map((img) => img.currentSrc || img.src)
    .filter((src) => /^https?:\/\//i.test(src))
}

function extractMessage(el: HTMLElement, role: Role): ChatMessage {
  const images = collectMessageImages(el)
  let markdown = ""
  if (role === "user") {
    markdown = extractUserText(el)
  } else {
    // 助手消息是富文本（段落/列表/代码块/表格/图片），直接转 Markdown
    const contentEl =
      el.querySelector<HTMLElement>('[data-markdown-text-style="assistant-message"]') ||
      el.querySelector<HTMLElement>(".markdown") ||
      el
    markdown = turndownService.turndown(contentEl.innerHTML).trim()
  }
  return { key: getMessageKey(el, role), role, markdown, images }
}

function getMessageElements() {
  return [...document.querySelectorAll<HTMLElement>(MESSAGE_SELECTOR)]
}

function getScrollRoot(): HTMLElement {
  const doc = document.scrollingElement as HTMLElement
  if (doc && doc.scrollHeight > doc.clientHeight + 100) return doc

  const candidates = [...document.querySelectorAll<HTMLElement>("div, main")]
    .filter((el) => {
      const style = getComputedStyle(el)
      return (
        /(auto|scroll)/.test(style.overflowY) &&
        el.scrollHeight > el.clientHeight + 100
      )
    })
    .sort((a, b) => b.scrollHeight - a.scrollHeight)
  return candidates[0] || doc
}

/**
 * ChatGPT 会虚拟化长对话，只渲染视口附近的 turn。
 * 从顶部逐屏向下滚动，收集每次渲染出来的消息（按 turn/message id 去重）。
 */
async function collectAllMessages(): Promise<ChatMessage[]> {
  const root = getScrollRoot()
  const originalTop = root.scrollTop
  const collected = new Map<string, ChatMessage>()

  const grab = () => {
    for (const el of getMessageElements()) {
      const role = getRole(el)
      const message = extractMessage(el, role)
      if (!collected.has(message.key)) collected.set(message.key, message)
    }
  }

  root.scrollTo({ top: 0 })
  await wait(500)
  grab()

  let stable = 0
  let guard = 0
  while (stable < 2 && guard++ < 300) {
    const before = collected.size
    root.scrollBy({ top: Math.max(300, root.clientHeight * 0.7) })
    await wait(350)
    grab()
    if (collected.size === before) stable++
    else stable = 0
  }

  root.scrollTo({ top: originalTop })
  return [...collected.values()]
}

function buildMarkdown(messages: ChatMessage[]) {
  const title = getConversationTitle()
  const lines: string[] = [`# ${title}`, "", `> 来源：${window.location.href}`, ""]

  for (const message of messages) {
    lines.push(message.role === "user" ? "## 用户" : "## ChatGPT", "")
    lines.push(message.markdown || "_（空消息）_", "")
  }

  return lines.join("\n")
}

async function downloadMarkdown(btn: HTMLButtonElement) {
  if (btn.disabled) return
  btn.disabled = true
  const originalText = btn.textContent
  try {
    btn.textContent = "收集消息中..."
    const messages = await collectAllMessages()
    if (messages.length === 0) {
      alert("未找到对话内容")
      return
    }
    btn.textContent = "生成 Markdown..."
    const markdown = buildMarkdown(messages)
    saveAs(
      new Blob([markdown], { type: "text/markdown;charset=utf-8" }),
      `${safeFileName(getConversationTitle())}.md`
    )
  } catch (error) {
    console.error("Failed to download chat markdown:", error)
    alert("下载 Markdown 失败，请重试")
  } finally {
    btn.disabled = false
    btn.textContent = originalText
  }
}

async function saveImages(btn: HTMLButtonElement) {
  if (btn.disabled) return
  btn.disabled = true
  const originalText = btn.textContent
  try {
    btn.textContent = "收集消息中..."
    const messages = await collectAllMessages()
    const images = [...new Set(messages.flatMap((message) => message.images))]
    if (images.length === 0) {
      alert("未找到对话中的图片")
      return
    }

    btn.textContent = `保存图片 (${images.length})...`
    // 图片 CDN 不支持 CORS，交给 background 下载
    const result = await sendToBackground<any, any>({
      name: "download",
      body: {
        action: "downloadImages",
        images,
        title: getConversationTitle()
      }
    })

    if (result?.code === 200) {
      alert(`已保存 ${result.count}/${images.length} 张图片`)
    } else {
      alert("保存图片失败，请重试")
    }
  } catch (error) {
    console.error("Failed to save chat images:", error)
    alert("保存图片失败，请重试")
  } finally {
    btn.disabled = false
    btn.textContent = originalText
  }
}

function createButton(
  id: string,
  text: string,
  bottom: string,
  onClick: (btn: HTMLButtonElement) => void
) {
  const btn = document.createElement("button")
  btn.id = id
  btn.type = "button"
  btn.textContent = text
  Object.assign(btn.style, BUTTON_STYLE, { bottom })
  btn.addEventListener("mouseenter", () => {
    if (!btn.disabled) {
      btn.style.transform = "translateY(-1px)"
      btn.style.opacity = "0.92"
    }
  })
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = ""
    btn.style.opacity = ""
  })
  btn.addEventListener("click", () => onClick(btn))
  return btn
}

function ensureButtons() {
  if (!document.body) return
  if (document.getElementById(MARKDOWN_BUTTON_ID)) return

  const markdownBtn = createButton(
    MARKDOWN_BUTTON_ID,
    "下载 Markdown",
    "160px",
    downloadMarkdown
  )
  const imageBtn = createButton(IMAGE_BUTTON_ID, "保存图片", "112px", saveImages)
  document.body.append(markdownBtn, imageBtn)
}

let visibilityTimer: number | undefined
function updateVisibility() {
  window.clearTimeout(visibilityTimer)
  visibilityTimer = window.setTimeout(() => {
    ensureButtons()
    const visible = getMessageElements().length > 0
    for (const id of [MARKDOWN_BUTTON_ID, IMAGE_BUTTON_ID]) {
      const btn = document.getElementById(id) as HTMLButtonElement | null
      if (btn) btn.style.display = visible ? "block" : "none"
    }
  }, 150)
}

function start() {
  ensureButtons()
  updateVisibility()
  const observer = new MutationObserver(updateVisibility)
  observer.observe(document.body, { childList: true, subtree: true })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start)
} else {
  start()
}
