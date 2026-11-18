/**
 * 小红书笔记同步到奶茶圈（后台 Service Worker 侧实现）
 *
 * 读取笔记的方式：用一个隐藏标签页依次打开笔记页，让 content script
 * 读取页面里已登录的 __INITIAL_STATE__。这样不受小红书登录墙/风控影响，
 * 也是 wx-tongbu 注入按钮推荐的方式。
 *
 * 发布接口：POST {apiBase}/api/bot/posts，请求头 X-Bot-Secret。
 * 机器人接口不支持上传文件，配图以小红书原图链接（Markdown）写进正文。
 */
import {
  buildNaichaPost,
  canonicalNoteUrl,
  isXhsShortLink,
  isXhsUrl,
  normalizeImageUrl,
  parseNoteId,
  type XhsNote
} from "./core"
import {
  appendXhsSyncHistory,
  findXhsSyncRecord,
  getXhsNaichaConfig,
  isXhsNaichaConfigReady,
  parseExtraTags,
  type XhsNaichaConfig
} from "./storage"

export interface SyncXhsInput {
  url?: string
  note?: XhsNote | null
  force?: boolean
}

export interface SyncXhsResult {
  ok: boolean
  duplicate?: boolean
  noteId?: string
  title?: string
  postId?: string
  postUrl?: string
  pending?: boolean
  images?: number
  syncedAt?: string
  error?: string
}

interface PublishOutcome {
  ok: boolean
  error?: string
  postId?: string
  postUrl?: string
  pending?: boolean
  message?: string
}

const SYNC_TAB_KEY = "codebox-xhs-sync-tab-id"
const TAB_TIMEOUT_MS = 40000

let memorySyncTabId: number | null = null

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function readStoredTabId(): Promise<number | null> {
  if (memorySyncTabId) return memorySyncTabId
  try {
    const result = await chrome.storage.session.get(SYNC_TAB_KEY)
    const tabId = result?.[SYNC_TAB_KEY]
    if (typeof tabId === "number") {
      memorySyncTabId = tabId
      return tabId
    }
  } catch {
    // storage.session 在部分浏览器不可用，退回模块变量
  }
  return null
}

async function storeTabId(tabId: number | null): Promise<void> {
  memorySyncTabId = tabId
  try {
    if (tabId) {
      await chrome.storage.session.set({ [SYNC_TAB_KEY]: tabId })
    } else {
      await chrome.storage.session.remove(SYNC_TAB_KEY)
    }
  } catch {
    // 忽略：模块变量已经更新
  }
}

async function getSyncTabId(): Promise<number | null> {
  const tabId = await readStoredTabId()
  if (!tabId) return null
  try {
    await chrome.tabs.get(tabId)
    return tabId
  } catch {
    await storeTabId(null)
    return null
  }
}

async function waitForNoteTab(tabId: number, noteId: string): Promise<void> {
  const deadline = Date.now() + TAB_TIMEOUT_MS
  while (Date.now() < deadline) {
    const tab = await chrome.tabs.get(tabId)
    const url = tab.url || ""

    if (url.includes("/login") || url.includes("website-login")) {
      throw new Error("小红书要求登录：请先在浏览器里登录小红书后重试")
    }

    if (tab.status === "complete" && (!noteId || url.includes(noteId))) {
      return
    }

    await sleep(300)
  }
  throw new Error("打开小红书笔记超时，请检查网络或登录状态")
}

async function sendMessageWithRetry<T>(
  tabId: number,
  message: any,
  attempts = 6
): Promise<T> {
  let lastError: Error | null = null
  for (let i = 0; i < attempts; i++) {
    try {
      return await new Promise<T>((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
          const error = chrome.runtime.lastError
          if (error) {
            reject(new Error(error.message))
            return
          }
          resolve(response as T)
        })
      })
    } catch (error) {
      lastError = error as Error
      await sleep(400)
    }
  }
  throw lastError || new Error("无法连接小红书页面，请刷新页面后重试")
}

async function fetchNoteViaTab(url: string, noteId: string): Promise<XhsNote> {
  let tabId = await getSyncTabId()

  if (tabId) {
    await chrome.tabs.update(tabId, { url })
  } else {
    // 先建 about:blank 再导航：部分浏览器/自动化环境下，
    // 新标签页的首个导航会早于监听程序挂载，容易读到未加载的页面
    const tab = await chrome.tabs.create({ url: "about:blank", active: false })
    if (!tab.id) throw new Error("无法创建小红书标签页")
    tabId = tab.id
    await storeTabId(tabId)
    await sleep(400)
    await chrome.tabs.update(tabId, { url })
  }

  await waitForNoteTab(tabId, noteId)

  // 页面脚本可能还在 hydrate，多试几次并校验笔记 ID，避免读到上一篇的旧状态
  let lastError: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    await sleep(attempt === 0 ? 500 : 800)
    try {
      const response = await sendMessageWithRetry<{
        note?: XhsNote | null
        error?: string
      }>(tabId, { type: "CODEBOX_XHS_GET_NOTE" })

      const note = response?.note
      if (note && (!note.id || note.id === noteId)) {
        return note
      }
    } catch (error) {
      lastError = error as Error
    }
  }

  if (lastError) {
    console.debug("[CodeBox] 读取小红书页面失败", lastError)
  }
  throw new Error(
    "未能从小红书页面读取笔记内容（可能需要登录、笔记已删除或页面改版）"
  )
}

/** xhslink.com 短链解析：跟随 HTTP/JS/meta 跳转，拿到笔记页链接 */
async function resolveShortLink(url: string): Promise<string> {
  const response = await fetch(url, {
    redirect: "follow",
    credentials: "include",
    signal: AbortSignal.timeout(15000)
  })

  if (isXhsUrl(response.url) && parseNoteId(response.url)) {
    return response.url
  }

  const html = await response.text()
  const patterns = [
    /location(?:\.href)?\s*=\s*["']([^"']+)["']/i,
    /window\.location\.replace\(\s*["']([^"']+)["']/i,
    /<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["'][^"']*url=([^"'>\s]+)/i
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (!match) continue
    try {
      const next = new URL(
        match[1].replace(/&amp;/g, "&"),
        response.url
      ).toString()
      if (parseNoteId(next)) return next
    } catch {
      // 继续尝试
    }
  }

  const idMatch = html.match(
    /\/(?:explore|discovery\/item|note)\/([A-Za-z0-9]{16,32})/
  )
  if (idMatch) return canonicalNoteUrl(idMatch[1])

  throw new Error("小红书短链没有跳转到笔记页，请改用完整笔记链接")
}

function sanitizeIncomingNote(
  raw: XhsNote | null | undefined,
  url: string,
  noteId: string
): XhsNote | null {
  if (!raw || typeof raw !== "object") return null

  const title = typeof raw.title === "string" ? raw.title.trim() : ""
  const desc = typeof raw.desc === "string" ? raw.desc.trim() : ""
  const images = Array.isArray(raw.images)
    ? raw.images
        .filter(
          (item): item is string =>
            typeof item === "string" && Boolean(item.trim())
        )
        .map(normalizeImageUrl)
        .filter(Boolean)
    : []
  const tags = Array.isArray(raw.tags)
    ? raw.tags
        .filter(
          (item): item is string =>
            typeof item === "string" && Boolean(item.trim())
        )
        .map((item) => item.trim().replace(/^#/, ""))
    : []

  if (!title && !desc && images.length === 0) return null

  const id =
    typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : noteId
  // 页面状态可能是上一篇笔记的，ID 不一致时交给隐藏标签页重新读取
  if (noteId && id && id !== noteId) return null

  return {
    id,
    url: raw.url || url,
    title,
    desc,
    author: typeof raw.author === "string" ? raw.author.trim() : "",
    publishedAt:
      typeof raw.publishedAt === "string" ? raw.publishedAt.trim() : "",
    images,
    tags
  }
}

function mapHttpError(status: number, message: string): string {
  switch (status) {
    case 401:
      return `BOT_API_SECRET 不正确（401）：${message}`
    case 404:
      return `机器人账号或板块不存在（404）：${message}`
    case 429:
      return `请求过于频繁（429）：${message}`
    case 503:
      return `奶茶圈未启用机器人接口：请在站点 .env 配置 BOT_API_SECRET 后重启（${message}）`
    default:
      return `奶茶圈发布失败（HTTP ${status}）：${message}`
  }
}

function readApiMessage(body: any, fallback: string): string {
  if (!body || typeof body !== "object") return fallback
  const message = typeof body.message === "string" ? body.message.trim() : ""
  if (message) return message
  const error = typeof body.error === "string" ? body.error.trim() : ""
  if (error) return error
  return fallback
}

async function publishToNaicha(
  config: XhsNaichaConfig,
  post: ReturnType<typeof buildNaichaPost>
): Promise<PublishOutcome> {
  const endpoint = `${config.apiBase}/api/bot/posts`
  let response: Response

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Bot-Secret": config.botSecret
      },
      body: JSON.stringify({
        bot: config.bot,
        boardSlug: config.boardSlug,
        title: post.title,
        content: post.content,
        manualTags: post.manualTags
      }),
      signal: AbortSignal.timeout(30000)
    })
  } catch (error) {
    return {
      ok: false,
      error: `无法连接奶茶圈（${config.apiBase}）：${(error as Error).message}`
    }
  }

  const text = await response.text()
  let body: any = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    // 非 JSON 响应
  }

  if (!response.ok) {
    return {
      ok: false,
      error: mapHttpError(
        response.status,
        readApiMessage(body, text.trim().slice(0, 300) || response.statusText)
      )
    }
  }

  if (body && typeof body.code === "number" && body.code !== 0) {
    return {
      ok: false,
      error: readApiMessage(body, `接口返回错误码 ${body.code}`)
    }
  }

  const data = body?.data
  const postId =
    data?.id !== undefined && data?.id !== null ? String(data.id) : ""
  if (!postId) {
    return {
      ok: false,
      error: `奶茶圈响应缺少帖子 ID：${readApiMessage(body, text.slice(0, 200))}`
    }
  }

  let postUrl = typeof data?.url === "string" ? data.url.trim() : ""
  if (postUrl && !/^https?:\/\//i.test(postUrl)) {
    try {
      postUrl = new URL(postUrl, `${config.apiBase}/`).toString()
    } catch {
      postUrl = ""
    }
  }
  if (!postUrl) {
    postUrl = `${config.apiBase}/post/${postId}`
  }

  const status = typeof data?.status === "string" ? data.status : ""
  return {
    ok: true,
    postId,
    postUrl,
    pending: Boolean(status && status.toUpperCase() !== "NORMAL"),
    message: typeof body?.message === "string" ? body.message : undefined
  }
}

function countImages(note: XhsNote, maxImages: number): number {
  const limit = maxImages > 0 ? Math.min(maxImages, 18) : 18
  return (note.images || [])
    .map(normalizeImageUrl)
    .filter(Boolean)
    .slice(0, limit).length
}

/** 同步单篇笔记：读取 → 整理 → 发布 → 记录历史 */
export async function syncXhsNote(input: SyncXhsInput): Promise<SyncXhsResult> {
  const config = await getXhsNaichaConfig()
  if (!isXhsNaichaConfigReady(config)) {
    return {
      ok: false,
      error:
        "还没有配置奶茶圈接口：请打开「小红书同步」页面，填写站点地址、BOT_API_SECRET、机器人账号和板块"
    }
  }

  let url = (input.url || "").trim()
  if (!url && input.note?.id) url = canonicalNoteUrl(input.note.id)
  if (!url) return { ok: false, error: "缺少笔记链接" }

  if (!url.includes("://")) {
    if (!url.includes("/") && parseNoteId(url)) {
      url = canonicalNoteUrl(parseNoteId(url))
    } else if (url.startsWith("/")) {
      url = `https://www.xiaohongshu.com${url}`
    } else {
      url = `https://${url.replace(/^\/+/, "")}`
    }
  }

  if (isXhsShortLink(url)) {
    try {
      url = await resolveShortLink(url)
    } catch (error) {
      return { ok: false, error: (error as Error).message }
    }
  }

  const noteId = parseNoteId(url) || (input.note?.id || "").trim()
  if (!noteId) {
    return {
      ok: false,
      error: "链接里没有找到笔记 ID（应形如 /explore/xxxx）"
    }
  }

  // 同一篇笔记按笔记 ID 去重
  if (!input.force) {
    const record = await findXhsSyncRecord(noteId)
    if (record) {
      return {
        ok: true,
        duplicate: true,
        noteId,
        title: record.title,
        postId: record.postId,
        postUrl: record.postUrl,
        pending: record.pending,
        syncedAt: record.syncedAt
      }
    }
  }

  let note = sanitizeIncomingNote(input.note, url, noteId)
  if (!note) {
    note = await fetchNoteViaTab(url, noteId)
  }

  note.id = note.id || noteId
  note.url = note.url || url

  const post = buildNaichaPost(note, {
    tags: parseExtraTags(config.extraTags),
    maxImages: config.maxImages
  })

  const published = await publishToNaicha(config, post)
  if (!published.ok) {
    return {
      ok: false,
      noteId,
      title: post.title,
      error: published.error
    }
  }

  const syncedAt = new Date().toISOString()
  await appendXhsSyncHistory({
    noteId,
    title: post.title,
    sourceUrl: url,
    postId: published.postId,
    postUrl: published.postUrl,
    pending: published.pending,
    syncedAt
  })

  return {
    ok: true,
    noteId,
    title: post.title,
    postId: published.postId,
    postUrl: published.postUrl,
    pending: published.pending,
    images: countImages(note, config.maxImages),
    syncedAt
  }
}

/** 关闭批量同步用的隐藏标签页 */
export async function closeSyncTab(): Promise<void> {
  const tabId = await getSyncTabId()
  if (tabId) {
    try {
      await chrome.tabs.remove(tabId)
    } catch {
      // 标签页可能已经被用户关闭
    }
  }
  await storeTabId(null)
}
