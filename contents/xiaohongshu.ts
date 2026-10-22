import { saveAs } from "file-saver"
import JSZip from "jszip"
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.xiaohongshu.com/*"],
  run_at: "document_idle"
}

const BUTTON_ID = "codebox-xhs-download"

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

function ensureButton() {
  if (!document.body) return
  let btn = document.getElementById(BUTTON_ID) as HTMLButtonElement | null
  if (btn) return btn

  btn = document.createElement("button")
  btn.id = BUTTON_ID
  btn.type = "button"
  btn.textContent = "下载图文"
  btn.title = "下载当前笔记的图片与文字"
  Object.assign(btn.style, BUTTON_STYLE)
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
  btn.addEventListener("click", () => downloadNote(btn))
  document.body.appendChild(btn)
  return btn
}

// 只在笔记详情出现时显示按钮（列表页/其它页面隐藏）
let visibilityTimer: number | undefined
function updateVisibility() {
  window.clearTimeout(visibilityTimer)
  visibilityTimer = window.setTimeout(() => {
    const btn = ensureButton()
    if (btn) btn.style.display = getNoteRoot() ? "block" : "none"
  }, 100)
}

function start() {
  ensureButton()
  updateVisibility()
  const observer = new MutationObserver(updateVisibility)
  observer.observe(document.body, { childList: true, subtree: true })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start)
} else {
  start()
}
