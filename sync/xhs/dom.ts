/**
 * 小红书页面 DOM 提取与笔记链接收集（只在页面环境使用）
 */
import {
  extractInitialState,
  findNoteInState,
  normalizeImageUrl,
  normalizeStateNote,
  parseNoteId,
  type XhsNote
} from "./core"

export interface NoteLink {
  url: string
  noteId: string
  title?: string
}

function textOf(element: Element | null): string {
  if (!element) return ""
  const htmlElement = element as HTMLElement
  return (htmlElement.innerText || element.textContent || "").trim()
}

/** 从页面里的 inline script 读取服务端渲染状态 */
export function readStateFromDocument(doc: Document): any | null {
  const scripts = doc.querySelectorAll("script")
  for (const script of Array.from(scripts)) {
    const text = script.textContent || ""
    if (
      !text.includes("__INITIAL_STATE__") &&
      !text.includes("__INITIAL_SSR_STATE__")
    ) {
      continue
    }
    const state = extractInitialState(text)
    if (state) return state
  }
  return null
}

function getNoteRoot(doc: Document): HTMLElement | null {
  return doc.querySelector<HTMLElement>("#noteContainer")
}

/** 当前笔记页的图片地址：swiper loop 模式按 data-swiper-slide-index 去重排序 */
function getDomImages(doc: Document): string[] {
  const root = getNoteRoot(doc)
  if (!root) return []

  const indexed = new Map<number, string>()
  root
    .querySelectorAll<HTMLElement>(".swiper-slide[data-swiper-slide-index]")
    .forEach((slide) => {
      const index = Number(slide.getAttribute("data-swiper-slide-index"))
      if (Number.isNaN(index) || indexed.has(index)) return
      const img = slide.querySelector<HTMLImageElement>(".img-container img")
      const url = img?.currentSrc || img?.src
      if (url) indexed.set(index, normalizeImageUrl(url))
    })

  if (indexed.size > 0) {
    return [...indexed.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, url]) => url)
  }

  const seen = new Set<string>()
  const images: string[] = []
  root
    .querySelectorAll<HTMLImageElement>(
      ".note-slider img, .media-container img, .swiper-slide img"
    )
    .forEach((img) => {
      const url = normalizeImageUrl(img.currentSrc || img.src)
      if (!url || seen.has(url)) return
      seen.add(url)
      images.push(url)
    })
  return images
}

function getDomTags(doc: Document): string[] {
  const root = getNoteRoot(doc) || doc
  const tags: string[] = []
  const seen = new Set<string>()
  root.querySelectorAll("a.tag, .tag").forEach((element) => {
    const tag = textOf(element).replace(/^#/, "").trim()
    if (!tag || seen.has(tag.toLowerCase())) return
    seen.add(tag.toLowerCase())
    tags.push(tag)
  })
  return tags
}

/** 从 DOM 提取当前笔记（不依赖 __INITIAL_STATE__） */
export function extractNoteFromDom(
  doc: Document,
  url: string,
  fallbackId = ""
): XhsNote | null {
  const noteId = parseNoteId(url) || fallbackId
  const title =
    textOf(doc.querySelector("#noteContainer #detail-title")) ||
    textOf(doc.querySelector("#noteContainer .title")) ||
    doc.title.replace(/\s*-\s*小红书.*$/, "").trim()

  const desc = textOf(
    doc.querySelector(
      "#noteContainer #detail-desc, #noteContainer .note-content .desc, #noteContainer .desc"
    )
  )

  const images = getDomImages(doc)
  const tags = getDomTags(doc)

  // 没有笔记容器、正文和图片时，说明当前不是有效的笔记详情页，
  // 避免把站点标题当成笔记内容发布
  if (!getNoteRoot(doc) && !desc && images.length === 0) return null

  if (!title && !desc && images.length === 0) return null

  return {
    id: noteId,
    url,
    title,
    desc,
    author: textOf(
      doc.querySelector(
        "#noteContainer .author-wrapper .username, #noteContainer .author .name"
      )
    ),
    publishedAt: textOf(
      doc.querySelector(
        "#noteContainer .bottom-left .date, #noteContainer .date"
      )
    ),
    images,
    tags
  }
}

function mergeNotes(
  stateNote: XhsNote | null,
  domNote: XhsNote | null
): XhsNote | null {
  if (!stateNote && !domNote) return null
  if (!stateNote) return domNote
  if (!domNote) return stateNote

  const images = stateNote.images.length > 0 ? stateNote.images : domNote.images
  const tags: string[] = []
  const seen = new Set<string>()
  for (const tag of [...stateNote.tags, ...domNote.tags]) {
    const key = tag.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    tags.push(tag)
  }

  return {
    id: stateNote.id || domNote.id,
    url: stateNote.url || domNote.url,
    title: stateNote.title || domNote.title,
    desc: stateNote.desc || domNote.desc,
    author: stateNote.author || domNote.author,
    publishedAt: stateNote.publishedAt || domNote.publishedAt,
    images,
    tags
  }
}

/**
 * 读取当前页面的笔记：优先用服务端渲染的 __INITIAL_STATE__（信息最全），
 * 读不到时回退到 DOM（兼容从信息流点开、脚本状态已过期的情况）。
 */
export function extractNoteFromPage(
  doc: Document,
  url: string
): XhsNote | null {
  const noteId = parseNoteId(url)

  let stateNote: XhsNote | null = null
  try {
    const state = readStateFromDocument(doc)
    if (state) {
      const found = findNoteInState(state, noteId)
      if (found) {
        const normalized = normalizeStateNote(
          found.raw,
          found.id || noteId,
          url
        )
        // SPA 切换笔记后 inline script 可能还是上一篇的状态，ID 不一致就交给 DOM
        if (
          normalized &&
          (!noteId || !normalized.id || normalized.id === noteId)
        ) {
          stateNote = normalized
        }
      }
    }
  } catch (error) {
    console.warn("[CodeBox] 解析小红书页面状态失败，回退到 DOM", error)
  }

  const domNote = extractNoteFromDom(doc, url, noteId)
  return mergeNotes(stateNote, domNote)
}

/** 收集页面上所有笔记链接（个人主页、搜索、信息流等） */
export function collectNoteLinks(
  doc: Document,
  currentUrl?: string
): NoteLink[] {
  const base =
    currentUrl || doc.location?.href || "https://www.xiaohongshu.com/"
  const links = new Map<string, NoteLink>()

  doc.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href") || ""
    if (
      !href.includes("/explore/") &&
      !href.includes("/discovery/item/") &&
      !href.includes("/note/") &&
      !href.includes("/user/profile/")
    ) {
      return
    }

    let absolute = ""
    try {
      absolute = new URL(href, base).toString()
    } catch {
      return
    }

    const noteId = parseNoteId(absolute)
    if (!noteId || links.has(noteId)) return

    const title =
      (anchor.getAttribute("title") || anchor.getAttribute("aria-label") || "")
        .trim()
        .slice(0, 100) || undefined

    links.set(noteId, { url: absolute, noteId, title })
  })

  // 笔记详情页本身也算一篇
  const currentId = parseNoteId(base)
  if (currentId && getNoteRoot(doc) && !links.has(currentId)) {
    links.set(currentId, { url: base, noteId: currentId })
  }

  return [...links.values()]
}
