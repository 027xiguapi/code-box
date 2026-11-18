/**
 * 小红书同步的本地配置与历史记录（chrome.storage.local）
 *
 * 配置里包含 BOT_API_SECRET，固定存在 local 而不是 sync，
 * 避免密钥跟随浏览器账号同步到其它设备。
 */

export interface XhsNaichaConfig {
  /** 奶茶圈站点地址，例如 http://127.0.0.1:3000 */
  apiBase: string
  /** 机器人账号：用户名、昵称或 ID */
  bot: string
  /** 发帖板块 slug */
  boardSlug: string
  /** 奶茶圈服务端 .env 里的 BOT_API_SECRET */
  botSecret: string
  /** 附加标签，逗号分隔 */
  extraTags: string
  /** 每篇笔记最多同步的图片数量 */
  maxImages: number
}

export interface XhsSyncRecord {
  noteId: string
  title: string
  sourceUrl: string
  postId?: string
  postUrl?: string
  pending?: boolean
  syncedAt: string
}

export const XHS_NAICHA_CONFIG_KEY = "codebox-xhs-naicha-config"
export const XHS_SYNC_HISTORY_KEY = "codebox-xhs-naicha-history"

const MAX_HISTORY = 500

export const DEFAULT_XHS_NAICHA_CONFIG: XhsNaichaConfig = {
  apiBase: "http://127.0.0.1:3000",
  bot: "quanxiaoer",
  boardSlug: "brand-review",
  botSecret: "",
  extraTags: "",
  maxImages: 18
}

function normalizeApiBase(value: string | undefined | null): string {
  const raw = (value || "").trim()
  if (!raw) return DEFAULT_XHS_NAICHA_CONFIG.apiBase
  return raw.replace(/\/+$/, "")
}

export function normalizeXhsConfig(
  raw: Partial<XhsNaichaConfig> | null | undefined
): XhsNaichaConfig {
  return {
    apiBase: normalizeApiBase(raw?.apiBase),
    bot: (raw?.bot || DEFAULT_XHS_NAICHA_CONFIG.bot).trim(),
    boardSlug: (raw?.boardSlug || DEFAULT_XHS_NAICHA_CONFIG.boardSlug).trim(),
    botSecret: (raw?.botSecret || "").trim(),
    extraTags: (raw?.extraTags || "").trim(),
    maxImages:
      typeof raw?.maxImages === "number" && raw.maxImages > 0
        ? Math.min(Math.floor(raw.maxImages), 18)
        : DEFAULT_XHS_NAICHA_CONFIG.maxImages
  }
}

export function isXhsNaichaConfigReady(config: XhsNaichaConfig): boolean {
  return Boolean(
    config.apiBase && config.bot && config.boardSlug && config.botSecret
  )
}

export function parseExtraTags(value: string): string[] {
  return (value || "")
    .split(/[,，、\n]/)
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean)
}

function storageGet<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result?.[key] as T | undefined)
    })
  })
}

function storageSet(key: string, value: any): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => resolve())
  })
}

export async function getXhsNaichaConfig(): Promise<XhsNaichaConfig> {
  const raw = await storageGet<Partial<XhsNaichaConfig>>(XHS_NAICHA_CONFIG_KEY)
  return normalizeXhsConfig(raw)
}

export async function saveXhsNaichaConfig(
  config: Partial<XhsNaichaConfig>
): Promise<XhsNaichaConfig> {
  const normalized = normalizeXhsConfig(config)
  await storageSet(XHS_NAICHA_CONFIG_KEY, normalized)
  return normalized
}

export async function getXhsSyncHistory(): Promise<XhsSyncRecord[]> {
  const raw = await storageGet<XhsSyncRecord[]>(XHS_SYNC_HISTORY_KEY)
  return Array.isArray(raw) ? raw : []
}

export async function findXhsSyncRecord(
  noteId: string
): Promise<XhsSyncRecord | undefined> {
  if (!noteId) return undefined
  const history = await getXhsSyncHistory()
  return history.find((record) => record.noteId === noteId)
}

export async function appendXhsSyncHistory(
  record: XhsSyncRecord
): Promise<void> {
  const history = await getXhsSyncHistory()
  const next = [
    record,
    ...history.filter((item) => item.noteId !== record.noteId)
  ].slice(0, MAX_HISTORY)
  await storageSet(XHS_SYNC_HISTORY_KEY, next)
}

export async function clearXhsSyncHistory(): Promise<void> {
  await storageSet(XHS_SYNC_HISTORY_KEY, [])
}
