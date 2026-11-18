/**
 * 小红书笔记解析与奶茶圈帖子构造（纯逻辑，不依赖 DOM/chrome API）
 *
 * 小红书笔记页会把笔记详情放在 window.__INITIAL_STATE__
 * （部分移动端页面用 __INITIAL_SSR_STATE__），这里直接解析这段服务端渲染数据，
 * 不需要平台签名接口。页面 DOM 提取的兜底逻辑在 dom.ts。
 */

export interface XhsNote {
  id: string
  url: string
  title: string
  desc: string
  author?: string
  publishedAt?: string
  images: string[]
  tags: string[]
}

export interface NaichaPost {
  title: string
  content: string
  manualTags: string[]
}

export interface BuildPostOptions {
  /** 追加标签，合并到「小红书」和笔记标签之后 */
  tags?: string[]
  /** 最多保留的图片数量，默认 18 */
  maxImages?: number
}

const MAX_NOTE_IMAGES = 18
const MAX_POST_TAGS = 10
const MAX_TAG_UNITS = 24
const MAX_TITLE_UNITS = 80
const MAX_CONTENT_UNITS = 50000

const NOTE_PATH_PATTERN =
  /\/(?:explore|discovery\/item|note)\/([A-Za-z0-9]{16,32})/
const PROFILE_NOTE_PATH_PATTERN =
  /\/user\/profile\/[A-Za-z0-9]+\/([A-Za-z0-9]{16,32})/
const BARE_NOTE_ID_PATTERN = /^[A-Za-z0-9]{16,32}$/
const URL_TRAILING_PUNCTUATION = /[.,;:!?'")\]）】》》〉」』，。；：！？、]+$/

const INITIAL_STATE_MARKERS = [
  "window.__INITIAL_STATE__",
  "window.__INITIAL_SSR_STATE__",
  "__INITIAL_STATE__",
  "__INITIAL_SSR_STATE__"
]

/** 从完整链接、短链或裸 ID 里提取笔记 ID */
export function parseNoteId(raw: string | undefined | null): string {
  const value = (raw || "").trim()
  if (!value) return ""

  if (!value.includes("/") && !value.includes(":")) {
    return BARE_NOTE_ID_PATTERN.test(value) ? value : ""
  }

  try {
    const url = new URL(
      value.includes("://") ? value : `https://${value.replace(/^\/+/, "")}`
    )
    const match =
      url.pathname.match(NOTE_PATH_PATTERN) ||
      url.pathname.match(PROFILE_NOTE_PATH_PATTERN)
    if (match) return match[1]
    const queryId = url.searchParams.get("noteId") || ""
    if (BARE_NOTE_ID_PATTERN.test(queryId)) return queryId
  } catch {
    // 继续用正则兜底
  }

  const match =
    value.match(NOTE_PATH_PATTERN) || value.match(PROFILE_NOTE_PATH_PATTERN)
  return match ? match[1] : ""
}

/** 判断链接是否属于小红书域名 */
export function isXhsUrl(raw: string | undefined | null): boolean {
  const value = (raw || "").trim()
  if (!value) return false
  try {
    const url = new URL(
      value.includes("://") ? value : `https://${value.replace(/^\/+/, "")}`
    )
    const host = url.hostname.toLowerCase()
    return (
      host === "xiaohongshu.com" ||
      host.endsWith(".xiaohongshu.com") ||
      host === "xhslink.com" ||
      host.endsWith(".xhslink.com")
    )
  } catch {
    return false
  }
}

/** 判断是否是小红书短链（需要联网解析） */
export function isXhsShortLink(raw: string): boolean {
  try {
    const url = new URL(raw)
    const host = url.hostname.toLowerCase()
    return host === "xhslink.com" || host.endsWith(".xhslink.com")
  } catch {
    return false
  }
}

export function canonicalNoteUrl(noteId: string): string {
  return `https://www.xiaohongshu.com/explore/${noteId}`
}

/** 统一 http/https、协议相对地址等图片 URL */
export function normalizeImageUrl(raw: string | undefined | null): string {
  let value = (raw || "").trim()
  if (!value) return ""
  if (value.startsWith("//")) value = `https:${value}`
  if (value.startsWith("http://")) value = `https://${value.slice(7)}`
  return value
}

/**
 * 从一段文本里提取小红书笔记链接（支持整段分享文案、每行一个链接、裸笔记 ID）。
 * 结果按笔记 ID 去重，最多 100 条。
 */
export function extractXhsUrls(text: string): string[] {
  const source = (text || "").replace(/\r\n?/g, "\n")
  const results: string[] = []
  const seen = new Set<string>()

  const push = (raw: string) => {
    let value = (raw || "").trim()
    if (!value) return
    value = value.replace(URL_TRAILING_PUNCTUATION, "")
    if (!value) return

    let noteId = parseNoteId(value)
    let url = value

    if (BARE_NOTE_ID_PATTERN.test(value)) {
      noteId = value
      url = canonicalNoteUrl(value)
    } else if (!value.includes("://")) {
      if (value.startsWith("//")) {
        url = `https:${value}`
      } else if (
        /^(?:www\.)?(?:xiaohongshu\.com|xhslink\.com)\//i.test(value)
      ) {
        url = `https://${value}`
      } else if (/^\/(?:explore|discovery\/item|note)\//i.test(value)) {
        url = `https://www.xiaohongshu.com${value}`
      } else {
        return
      }
    }

    if (!isXhsUrl(url)) return
    const key = noteId || url
    if (seen.has(key)) return
    seen.add(key)
    results.push(url)
  }

  const urlPattern =
    /(?:https?:\/\/)?(?:www\.)?(?:xiaohongshu\.com|xhslink\.com)\/[^\s<>"'`，。；、）】》]+/gi
  for (const match of source.matchAll(urlPattern)) {
    push(match[0])
  }

  const pathPattern =
    /(?:^|[\s（(【])(\/?(?:explore|discovery\/item|note)\/[A-Za-z0-9]{16,32}(?:\?[^\s<>"'`，。；、）】》]*)?)/gm
  for (const match of source.matchAll(pathPattern)) {
    push(match[1])
  }

  const idPattern = /\b[0-9a-fA-F]{24}\b/g
  for (const match of source.matchAll(idPattern)) {
    push(match[0])
  }

  return results.slice(0, 100)
}

function hasTokenAt(raw: string, index: number, token: string): boolean {
  if (raw.slice(index, index + token.length) !== token) return false
  const isIdentChar = (char: string) => /[A-Za-z0-9_$]/.test(char)
  if (index > 0 && isIdentChar(raw[index - 1])) return false
  const next = raw[index + token.length]
  if (next && isIdentChar(next)) return false
  return true
}

/** 把 JSON 字符串外面的 undefined / NaN / Infinity 替换成 null */
function sanitizeJsJson(raw: string): string {
  let output = ""
  let inString = false
  let escaped = false

  for (let i = 0; i < raw.length; ) {
    const char = raw[i]

    if (inString) {
      output += char
      if (escaped) {
        escaped = false
      } else if (char === "\\") {
        escaped = true
      } else if (char === '"') {
        inString = false
      }
      i += 1
      continue
    }

    if (char === '"') {
      inString = true
      output += char
      i += 1
      continue
    }

    if (hasTokenAt(raw, i, "undefined")) {
      output += "null"
      i += "undefined".length
      continue
    }
    if (hasTokenAt(raw, i, "NaN")) {
      output += "null"
      i += "NaN".length
      continue
    }
    if (hasTokenAt(raw, i, "-Infinity")) {
      output += "null"
      i += "-Infinity".length
      continue
    }
    if (hasTokenAt(raw, i, "Infinity")) {
      output += "null"
      i += "Infinity".length
      continue
    }

    output += char
    i += 1
  }

  return output
}

/** 从 HTML 或 inline script 文本里截出并解析 __INITIAL_STATE__ */
export function extractInitialState(html: string): any | null {
  if (!html) return null

  for (const marker of INITIAL_STATE_MARKERS) {
    let from = 0
    while (from < html.length) {
      const markerIndex = html.indexOf(marker, from)
      if (markerIndex < 0) break
      from = markerIndex + marker.length

      const equalsIndex = html.indexOf("=", from)
      if (equalsIndex < 0) continue
      const scriptEnd = html.indexOf("</script>", equalsIndex)
      let raw = html
        .slice(equalsIndex + 1, scriptEnd < 0 ? undefined : scriptEnd)
        .trim()
      raw = raw.replace(/;\s*$/, "").trim()

      if (!raw || (raw[0] !== "{" && raw[0] !== "[")) continue

      try {
        return JSON.parse(sanitizeJsJson(raw))
      } catch {
        // 继续尝试下一个 marker
      }
    }
  }

  return null
}

function asRecord(value: any): Record<string, any> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : null
}

function stringField(record: Record<string, any> | null, key: string): string {
  if (!record) return ""
  const value = record[key]
  if (typeof value === "string") return value.trim()
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return ""
}

function noteFromEntry(entry: any): Record<string, any> | null {
  const record = asRecord(entry)
  if (!record) return null
  const nested = asRecord(record.note)
  if (nested) return nested
  if ("imageList" in record || "desc" in record || "title" in record)
    return record
  return null
}

/** 在页面状态数据里定位笔记详情 */
export function findNoteInState(
  state: any,
  noteId: string
): { raw: Record<string, any>; id: string } | null {
  const root = asRecord(state)
  if (!root) return null

  const noteSection = asRecord(root.note)
  if (noteSection) {
    const currentId = stringField(noteSection, "currentNoteId") || noteId
    const detailMap = asRecord(noteSection.noteDetailMap)
    if (detailMap) {
      // 优先读取链接对应的笔记，避免 SPA 切换后读到页面初始状态里的旧笔记
      if (noteId) {
        const requested = noteFromEntry(detailMap[noteId])
        if (requested) {
          return {
            raw: requested,
            id: stringField(requested, "noteId") || noteId
          }
        }
      }
      if (currentId) {
        const note = noteFromEntry(detailMap[currentId])
        if (note) {
          return {
            raw: note,
            id: stringField(note, "noteId") || currentId
          }
        }
      }
      for (const [key, value] of Object.entries(detailMap)) {
        const note = noteFromEntry(value)
        if (note) {
          return { raw: note, id: stringField(note, "noteId") || key }
        }
      }
    }
    const note = noteFromEntry(noteSection)
    if (note) {
      return { raw: note, id: stringField(note, "noteId") || currentId }
    }
  }

  const noteData = asRecord(root.noteData)
  if (noteData) {
    const data = asRecord(noteData.data)
    if (data) {
      const note = asRecord(data.noteData) || asRecord(data.note)
      if (note) {
        return { raw: note, id: stringField(note, "noteId") || noteId }
      }
    }
    const note = asRecord(noteData.noteData)
    if (note) {
      return { raw: note, id: stringField(note, "noteId") || noteId }
    }
  }

  return null
}

function extractStateImages(raw: any): string[] {
  if (!Array.isArray(raw)) return []
  const images: string[] = []
  const seen = new Set<string>()

  for (const item of raw) {
    let url = ""
    let width = 0
    let height = 0

    if (typeof item === "string") {
      url = item
    } else {
      const record = asRecord(item)
      if (!record) continue
      url =
        stringField(record, "urlDefault") ||
        stringField(record, "urlPre") ||
        stringField(record, "url") ||
        stringField(record, "masterUrl")
      width = Number(record.width) || 0
      height = Number(record.height) || 0

      if (!url && Array.isArray(record.infoList)) {
        for (const info of record.infoList) {
          const infoRecord = asRecord(info)
          if (!infoRecord) continue
          const scene = stringField(infoRecord, "imageScene")
          const candidate =
            stringField(infoRecord, "url") ||
            stringField(infoRecord, "urlDefault")
          if (!candidate) continue
          if (!scene || scene.toUpperCase() === "WB_DFT") {
            url = candidate
            break
          }
        }
      }
    }

    const normalized = normalizeImageUrl(url)
    if (!normalized || seen.has(normalized)) continue
    // 极小的占位图直接跳过
    if (width > 0 && height > 0 && (width < 50 || height < 50)) continue
    seen.add(normalized)
    images.push(normalized)
  }

  return images
}

function extractStateTags(raw: any): string[] {
  if (!Array.isArray(raw)) return []
  const tags: string[] = []
  const seen = new Set<string>()

  for (const item of raw) {
    let tag = ""
    if (typeof item === "string") {
      tag = item
    } else {
      const record = asRecord(item)
      if (!record) continue
      tag = stringField(record, "name") || stringField(record, "title")
    }
    tag = tag.trim().replace(/^#/, "").trim()
    if (!tag || seen.has(tag.toLowerCase())) continue
    seen.add(tag.toLowerCase())
    tags.push(tag)
  }

  return tags
}

function extractPublishedAt(raw: Record<string, any>): string {
  for (const key of ["time", "publishTime", "lastUpdateTime", "createTime"]) {
    const value = Number(raw[key])
    if (!Number.isFinite(value) || value <= 0) continue
    const date = new Date(value > 1_000_000_000_000 ? value : value * 1000)
    if (Number.isNaN(date.getTime())) continue
    const pad = (num: number) => String(num).padStart(2, "0")
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  }
  return ""
}

/** 把页面状态里的原始笔记对象转成统一结构 */
export function normalizeStateNote(
  raw: Record<string, any>,
  fallbackId: string,
  url: string
): XhsNote | null {
  const source = noteFromEntry(raw)
  if (!source) return null

  const noteCard = asRecord(source.noteCard)
  const author = asRecord(source.user) || asRecord(source.author)
  const title = stringField(source, "title") || stringField(noteCard, "title")
  const desc =
    stringField(source, "desc") ||
    stringField(source, "content") ||
    stringField(noteCard, "desc")

  const images = extractStateImages(
    source.imageList || source.images || noteCard?.imageList
  )
  const tags = extractStateTags(
    source.tagList || source.tags || noteCard?.tagList
  )

  if (!title && !desc && images.length === 0) return null

  return {
    id:
      stringField(source, "noteId") ||
      stringField(source, "noteID") ||
      stringField(source, "id") ||
      fallbackId,
    url,
    title,
    desc,
    author:
      stringField(author, "nickname") ||
      stringField(author, "nickName") ||
      stringField(author, "name"),
    publishedAt: extractPublishedAt(source),
    images,
    tags
  }
}

export function noteFromHtml(
  html: string,
  url: string,
  noteId?: string
): XhsNote | null {
  const state = extractInitialState(html)
  if (!state) return null
  const found = findNoteInState(state, noteId || parseNoteId(url))
  if (!found) return null
  return normalizeStateNote(found.raw, found.id || noteId || "", url)
}

const TOPIC_TAG_PATTERN = /#\s*[^#\r\n]{1,80}?\[话题\]#/g

/** 去掉小红书正文里的 #话题[话题]# 标记，并清理多余空格/空行 */
export function stripTopicTags(text: string): string {
  let value = (text || "").replace(/\r\n?/g, "\n")
  value = value.replace(TOPIC_TAG_PATTERN, " ")
  value = value
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
  value = value.replace(/\n{3,}/g, "\n\n")
  value = value.replace(/[ \t]{2,}/g, " ")
  value = value.replace(/(\p{Script=Han})[ \t]+(\p{Script=Han})/gu, "$1$2")
  return value.trim()
}

function firstLine(text: string): string {
  const value = (text || "").trim()
  if (!value) return ""
  return value.split("\n")[0].trim().slice(0, MAX_TITLE_UNITS)
}

function normalizeTitle(raw: string): string {
  let title = (raw || "").replace(/\s+/g, " ").trim()
  if (!title) title = "小红书笔记"
  if (title.length > MAX_TITLE_UNITS) {
    title = `${title.slice(0, MAX_TITLE_UNITS - 1)}…`
  }
  if (title.length < 5) title += " 笔记"
  return title
}

function normalizeTags(
  extra: string[] = [],
  noteTags: string[] = []
): string[] {
  const tags: string[] = []
  const seen = new Set<string>()

  const add = (raw: string) => {
    let tag = (raw || "").trim().replace(/^#/, "").trim()
    if (!tag) return
    tag = tag.replace(/\s+/g, " ")
    if (tag.length > MAX_TAG_UNITS) {
      tag = `${tag.slice(0, MAX_TAG_UNITS - 1)}…`
    }
    const key = tag.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    tags.push(tag)
  }

  add("小红书")
  extra.forEach(add)
  noteTags.forEach(add)

  return tags.slice(0, MAX_POST_TAGS)
}

function truncateContent(content: string): string {
  if (content.length <= MAX_CONTENT_UNITS) return content
  return content.slice(0, MAX_CONTENT_UNITS)
}

/**
 * 把小红书笔记整理成奶茶圈帖子。
 * 只保留笔记正文和图片，不附加来源/原文链接；图片以 Markdown 形式写在正文末尾。
 */
export function buildNaichaPost(
  note: XhsNote,
  options: BuildPostOptions = {}
): NaichaPost {
  const maxImages =
    options.maxImages && options.maxImages > 0
      ? Math.min(options.maxImages, MAX_NOTE_IMAGES)
      : MAX_NOTE_IMAGES

  const cleanedTitle = stripTopicTags(note.title)
  const cleanedDesc = stripTopicTags(note.desc)

  const title = normalizeTitle(cleanedTitle || firstLine(cleanedDesc))

  let content = cleanedDesc || "（小红书笔记，详见配图）"
  while (content.length < 10) {
    content += "\n\n（全文完）"
  }

  const images = (note.images || [])
    .map((url) => normalizeImageUrl(url))
    .filter(Boolean)
    .slice(0, maxImages)

  if (images.length > 0) {
    const links = images
      .map((url, index) => `![图${index + 1}](${url})`)
      .join("\n\n")
    content = `${content}\n\n${links}`
  }

  return {
    title,
    content: truncateContent(content),
    manualTags: normalizeTags(options.tags, note.tags)
  }
}
