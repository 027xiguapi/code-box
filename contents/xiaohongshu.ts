import { saveAs } from "file-saver"
import JSZip from "jszip"
import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

import type { SyncXhsResult } from "~sync/xhs/client"
import { collectNoteLinks, extractNoteFromPage } from "~sync/xhs/dom"
import { getXhsNaichaConfig, isXhsNaichaConfigReady } from "~sync/xhs/storage"

export const config: PlasmoCSConfig = {
  matches: ["https://www.xiaohongshu.com/*"],
  run_at: "document_idle"
}

const BUTTON_ID = "codebox-xhs-download"
const SYNC_BUTTON_ID = "codebox-xhs-sync"

const BUTTON_STYLE: Partial<CSSStyleDeclaration> = {
  position: "fixed",
  right: "24px",
  bottom: "96px",
  zIndex: "2147483646",
  padding: "10px 18px",
  border: "none",
  borderRadius: "999px",
  background: "#ff2442",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "600",
  lineHeight: "1.4",
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.22)",
  transition: "transform 0.15s ease, opacity 0.15s ease"
}

const SYNC_BUTTON_STYLE: Partial<CSSStyleDeclaration> = {
  ...BUTTON_STYLE,
  bottom: "156px",
  background: "#16a34a"
}

function getNoteRoot() {
  return document.querySelector<HTMLElement>("#noteContainer")
}

function getNoteTitle() {
  const title = document
    .querySelector("#noteContainer #detail-title")
    ?.textContent?.trim()
  return title || document.title.replace(/\s*-\s*小红书.*$/, "").trim()
}

function getNoteDesc() {
  return document
    .querySelector<HTMLElement>("#noteContainer #detail-desc")
    ?.innerText?.trim()
}

function getNoteAuthor() {
  return document
    .querySelector("#noteContainer .author-wrapper .username")
    ?.textContent?.trim()
}

function getNoteDate() {
  return document
    .querySelector("#noteContainer .bottom-left .date")
    ?.textContent?.trim()
}

function uniqueImages(imgs: HTMLImageElement[]) {
  const seen = new Set<string>()
  const urls: string[] = []
  for (const img of imgs) {
    const url = img.currentSrc || img.src
    if (url && !seen.has(url)) {
      seen.add(url)
      urls.push(url)
    }
  }
  return urls
}

/**
 * 笔记图片地址。swiper 的 loop 模式会额外渲染首尾 duplicate slide，
 * 以 data-swiper-slide-index 去重并按索引排序。
 */
function getNoteImages() {
  const note = getNoteRoot()
  if (!note) return []

  const indexed = new Map<number, string>()
  note
    .querySelectorAll<HTMLElement>(".swiper-slide[data-swiper-slide-index]")
    .forEach((slide) => {
      const index = Number(slide.getAttribute("data-swiper-slide-index"))
      if (Number.isNaN(index) || indexed.has(index)) return
      const img = slide.querySelector<HTMLImageElement>(".img-container img")
      const url = img?.currentSrc || img?.src
      if (url) indexed.set(index, url)
    })

  if (indexed.size > 0) {
    return [...indexed.entries()].sort((a, b) => a[0] - b[0]).map(([, url]) => url)
  }

  // 非 swiper 结构（如单图笔记）兜底：按 DOM 顺序去重
  return uniqueImages([...note.querySelectorAll<HTMLImageElement>(".note-slider img")])
}

function extFromBlob(blob: Blob, url: string) {
  const type = (blob.type || "").toLowerCase()
  if (type.includes("webp")) return "webp"
  if (type.includes("png")) return "png"
  if (type.includes("gif")) return "gif"
  if (type.includes("bmp")) return "bmp"
  if (type.includes("jpeg") || type.includes("jpg")) return "jpg"
  const match = url.match(/\.(webp|png|gif|bmp|jpe?g)(?:[?#]|$)/i)
  return match ? match[1].toLowerCase().replace("jpeg", "jpg") : "jpg"
}

function safeFileName(name: string) {
  return (
    name
      .replace(/[\\/:*?"<>|\r\n]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80) || "小红书图文"
  )
}

function buildMarkdown(params: {
  title: string
  desc?: string
  author?: string
  date?: string
  url: string
  images: { url: string; localPath?: string }[]
}) {
  const { title, desc, author, date, url, images } = params
  const lines: string[] = [`# ${title}`, ""]

  if (desc) lines.push(desc, "")

  if (images.length > 0) {
    images.forEach((image) => {
      lines.push(`![](${image.localPath || image.url})`, "")
    })
  }

  lines.push("---", "")
  if (author) lines.push(`- 作者：${author}`)
  if (date) lines.push(`- 日期：${date}`)
  lines.push(`- 链接：${url}`)
  return lines.join("\n")
}

async function downloadNote(btn: HTMLButtonElement) {
  if (btn.disabled) return

  if (!getNoteRoot()) {
    alert("请打开一篇图文笔记后再下载")
    return
  }

  const imageUrls = getNoteImages()
  if (imageUrls.length === 0) {
    alert("未找到笔记图片，视频笔记暂不支持下载")
    return
  }

  const title = getNoteTitle()
  const fileName = safeFileName(title)
  const zip = new JSZip()
  const images: { url: string; localPath?: string }[] = []

  btn.disabled = true
  btn.style.cursor = "default"
  btn.style.opacity = "0.75"
  try {
    for (let i = 0; i < imageUrls.length; i++) {
      btn.textContent = `下载中 ${i + 1}/${imageUrls.length}`
      const url = imageUrls[i]
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const blob = await response.blob()
        const ext = extFromBlob(blob, url)
        const localPath = `images/${String(i + 1).padStart(2, "0")}.${ext}`
        zip.file(localPath, blob)
        images.push({ url, localPath })
      } catch (error) {
        console.error(`Failed to download image ${i + 1}:`, error)
        images.push({ url })
      }
    }

    const markdown = buildMarkdown({
      title,
      desc: getNoteDesc(),
      author: getNoteAuthor(),
      date: getNoteDate(),
      url: window.location.href,
      images
    })
    zip.file(`${fileName}.md`, markdown)

    btn.textContent = "打包中..."
    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, `${fileName}.zip`)
  } catch (error) {
    console.error("Failed to download note:", error)
    alert("下载失败，请重试")
  } finally {
    btn.disabled = false
    btn.style.cursor = "pointer"
    btn.style.opacity = ""
    btn.textContent = "下载图文"
  }
}

function createActionButton(params: {
  id: string
  text: string
  title: string
  style: Partial<CSSStyleDeclaration>
  onClick: (btn: HTMLButtonElement) => void
}) {
  const btn = document.createElement("button")
  btn.id = params.id
  btn.type = "button"
  btn.textContent = params.text
  btn.title = params.title
  Object.assign(btn.style, params.style)
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
  btn.addEventListener("click", () => params.onClick(btn))
  document.body.appendChild(btn)
  return btn
}

function ensureButton() {
  if (!document.body) return
  let btn = document.getElementById(BUTTON_ID) as HTMLButtonElement | null
  if (btn) return btn

  btn = createActionButton({
    id: BUTTON_ID,
    text: "下载图文",
    title: "下载当前笔记的图片与文字",
    style: BUTTON_STYLE,
    onClick: (target) => downloadNote(target)
  })
  return btn
}

function formatSyncedAt(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

async function syncToNaicha(btn: HTMLButtonElement) {
  if (btn.disabled) return

  const originalText = "同步奶茶圈"
  let locked = false

  try {
    const config = await getXhsNaichaConfig()
    if (!isXhsNaichaConfigReady(config)) {
      if (
        confirm(
          "还没有配置奶茶圈接口（站点地址 / BOT_API_SECRET / 机器人账号 / 板块）。\n\n是否现在打开「小红书同步」页面配置？"
        )
      ) {
        sendToBackground({ name: "xhsSync", body: { action: "openPage" } }).catch(
          () => {}
        )
      }
      return
    }

    const note = extractNoteFromPage(document, window.location.href)
    if (!note) {
      alert("未能读取当前笔记内容，请等页面加载完成后再试")
      return
    }

    locked = true
    btn.disabled = true
    btn.style.cursor = "default"
    btn.style.opacity = "0.75"
    btn.textContent = "同步中..."

    let result = await sendToBackground<any, SyncXhsResult>({
      name: "xhsSync",
      body: { action: "syncOne", url: window.location.href, note }
    })

    if (result?.duplicate) {
      const when = formatSyncedAt(result.syncedAt)
      const confirmed = confirm(
        `《${result.title || note.title || "这篇笔记"}》${when ? `已于 ${when} ` : "已经"}同步过。\n\n是否重新同步？`
      )
      if (confirmed) {
        btn.textContent = "同步中..."
        result = await sendToBackground<any, SyncXhsResult>({
          name: "xhsSync",
          body: {
            action: "syncOne",
            url: window.location.href,
            note,
            force: true
          }
        })
      } else {
        btn.textContent = originalText
        return
      }
    }

    if (!result?.ok) {
      throw new Error(result?.error || "同步失败")
    }

    btn.textContent = result.pending ? "已提交审核 ✓" : "已同步 ✓"
    window.setTimeout(() => {
      btn.textContent = originalText
    }, 2500)
  } catch (error) {
    console.error("[CodeBox] 同步到奶茶圈失败", error)
    alert(
      `同步到奶茶圈失败：${(error as Error).message}\n\n如果扩展刚更新过，请刷新页面后重试。`
    )
    btn.textContent = originalText
  } finally {
    if (locked) {
      btn.disabled = false
      btn.style.cursor = "pointer"
      btn.style.opacity = ""
    }
  }
}

function ensureSyncButton() {
  if (!document.body) return
  let btn = document.getElementById(SYNC_BUTTON_ID) as HTMLButtonElement | null
  if (btn) return btn

  btn = createActionButton({
    id: SYNC_BUTTON_ID,
    text: "同步奶茶圈",
    title: "把当前笔记的正文和图片发布到奶茶圈",
    style: SYNC_BUTTON_STYLE,
    onClick: (target) => syncToNaicha(target)
  })
  return btn
}

// 只在笔记详情出现时显示按钮（列表页/其它页面隐藏）
let visibilityTimer: number | undefined
function updateVisibility() {
  window.clearTimeout(visibilityTimer)
  visibilityTimer = window.setTimeout(() => {
    const visible = Boolean(getNoteRoot())
    const downloadBtn = ensureButton()
    if (downloadBtn) downloadBtn.style.display = visible ? "block" : "none"
    const syncBtn = ensureSyncButton()
    if (syncBtn) syncBtn.style.display = visible ? "block" : "none"
  }, 100)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 收集当前页面上的笔记链接，可选自动滚动加载更多 */
async function collectLinksWithScroll(scroll: boolean) {
  const byId = new Map<string, ReturnType<typeof collectNoteLinks>[number]>()

  const harvest = () => {
    for (const link of collectNoteLinks(document, window.location.href)) {
      if (!byId.has(link.noteId)) byId.set(link.noteId, link)
    }
  }

  harvest()

  if (scroll) {
    let stable = 0
    let lastHeight = document.documentElement.scrollHeight
    // 个人主页/搜索页是无限滚动，最多滚动 30 次
    for (let i = 0; i < 30 && stable < 3; i++) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant" as ScrollBehavior
      })
      await delay(800)
      harvest()
      const height = document.documentElement.scrollHeight
      if (height === lastHeight) {
        stable += 1
      } else {
        stable = 0
      }
      lastHeight = height
    }
  }

  return [...byId.values()]
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== "object") return

  if (message.type === "CODEBOX_XHS_GET_NOTE") {
    try {
      sendResponse({
        note: extractNoteFromPage(document, window.location.href)
      })
    } catch (error) {
      sendResponse({ note: null, error: (error as Error).message })
    }
    return true
  }

  if (message.type === "CODEBOX_XHS_COLLECT_LINKS") {
    collectLinksWithScroll(Boolean(message.scroll))
      .then((links) => sendResponse({ links }))
      .catch((error) => sendResponse({ links: [], error: (error as Error).message }))
    return true
  }

  if (message.type === "CODEBOX_XHS_PING") {
    sendResponse({ ok: true, url: window.location.href })
    return true
  }
})

function start() {
  ensureButton()
  ensureSyncButton()
  updateVisibility()
  const observer = new MutationObserver(updateVisibility)
  observer.observe(document.body, { childList: true, subtree: true })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start)
} else {
  start()
}
