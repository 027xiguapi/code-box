/**
 * 文章同步引擎
 *
 * 负责：
 * - 初始化适配器注册中心（Chrome 扩展运行时）
 * - 平台登录状态检测（带缓存、并发控制、超时保护）
 * - 单平台 / 多平台同步（并发限流、取消、进度回调）
 * - 自建站（WordPress / Typecho / MetaWeblog）账号管理与同步
 * - 同步历史记录
 *
 * 移植自 wechatsync/Wechatsync（去除了其统计与远程配置依赖）
 */
import { adapterRegistry } from '../adapters/registry'
import { ALL_ADAPTERS } from '../adapters/platforms'
import { createExtensionRuntime } from '../runtime/extension'
import * as wordpressAdapter from '../adapters/cms/wordpress'
import * as metaweblogAdapter from '../adapters/cms/metaweblog'
import { createLogger } from '../lib/logger'
import type { Article, AuthResult, PlatformMeta, SyncResult } from '../types'

const logger = createLogger('CodeBoxSync')

// ============ 常量 ============
const AUTH_CACHE_KEY = 'codebox-sync-auth-cache'
const AUTH_CACHE_TTL_AUTHENTICATED = 5 * 60 * 1000
const AUTH_CACHE_TTL_UNAUTHENTICATED = 30 * 1000
const AUTH_CHECK_CONCURRENCY = 5
const AUTH_CHECK_TIMEOUT = 12 * 1000
const PUBLISH_TIMEOUT = 10 * 60 * 1000
const CONCURRENCY_LIMIT = 3

const CMS_ACCOUNTS_KEY = 'codebox-sync-cms-accounts'
const CMS_PWD_PREFIX = 'codebox-sync-cms-pwd-'
export const SYNC_HISTORY_KEY = 'codebox-sync-history'
const MAX_HISTORY_ITEMS = 30

// ============ 初始化 ============

const runtime = createExtensionRuntime()
let initialized = false

/**
 * 初始化适配器系统（幂等）
 */
export function initSyncAdapters(): void {
  if (initialized) return

  adapterRegistry.setRuntime(runtime)

  for (const AdapterClass of ALL_ADAPTERS) {
    try {
      const instance = new AdapterClass() as unknown as {
        meta: PlatformMeta
        preprocessConfig?: Record<string, unknown>
      }
      adapterRegistry.register({
        meta: instance.meta,
        factory: () => new AdapterClass(),
        preprocessConfig: instance.preprocessConfig
      })
    } catch (error) {
      logger.error('注册适配器失败:', error)
    }
  }

  initialized = true
}

/**
 * 获取所有平台元信息
 */
export function getAllPlatformMetas(): PlatformMeta[] {
  initSyncAdapters()
  return adapterRegistry.getAllMeta()
}

/**
 * 获取平台预处理配置
 */
export function getPlatformPreprocessConfigs(platformIds: string[]) {
  initSyncAdapters()
  return adapterRegistry.getPreprocessConfigs(platformIds)
}

/**
 * 获取适配器实例
 */
export async function getAdapter(platformId: string) {
  initSyncAdapters()
  return adapterRegistry.get(platformId)
}

// ============ 工具 ============

function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMessage)), ms)

    promise
      .then((result) => {
        clearTimeout(timer)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

function platformName(platformId: string): string {
  return getAllPlatformMetas().find((p) => p.id === platformId)?.name || platformId
}

// ============ 登录状态检测 ============

interface AuthCacheItem {
  isAuthenticated: boolean
  username?: string
  avatar?: string
  error?: string
  timestamp: number
}

type AuthCache = Record<string, AuthCacheItem>

async function getCachedAuth(): Promise<AuthCache> {
  try {
    const result = await chrome.storage.local.get(AUTH_CACHE_KEY)
    return result[AUTH_CACHE_KEY] || {}
  } catch {
    return {}
  }
}

async function setCachedAuth(cache: AuthCache): Promise<void> {
  try {
    await chrome.storage.local.set({ [AUTH_CACHE_KEY]: cache })
  } catch {
    // 忽略
  }
}

/**
 * 清除登录状态缓存
 */
export async function clearAuthCache(): Promise<void> {
  try {
    await chrome.storage.local.remove(AUTH_CACHE_KEY)
  } catch {
    // 忽略
  }
}

/**
 * 检测单个平台登录状态
 */
export async function checkPlatformAuth(platformId: string): Promise<AuthResult> {
  // CMS 账号
  if (platformId.startsWith('cms_')) {
    const accounts = await getCmsAccounts()
    const account = accounts.find((a) => a.id === platformId)
    if (!account) return { isAuthenticated: false, error: '账号不存在' }
    return checkCmsAuth(account)
  }

  const adapter = await getAdapter(platformId)
  if (!adapter) {
    return { isAuthenticated: false, error: '平台适配器不存在' }
  }

  try {
    return await withTimeout(
      adapter.checkAuth(),
      AUTH_CHECK_TIMEOUT,
      `登录检测超时（${AUTH_CHECK_TIMEOUT / 1000}秒）`
    )
  } catch (error) {
    return { isAuthenticated: false, error: (error as Error).message }
  }
}

export type PlatformAuthItem = PlatformMeta & {
  isAuthenticated: boolean
  username?: string
  avatar?: string
  error?: string
}

/**
 * 检测所有平台登录状态（带缓存，分批并发）
 */
export async function checkAllPlatformsAuth(forceRefresh = false): Promise<PlatformAuthItem[]> {
  initSyncAdapters()

  const metas = adapterRegistry.getAllMeta()
  const cache = await getCachedAuth()
  const now = Date.now()

  const results: PlatformAuthItem[] = []
  const needsCheck: PlatformMeta[] = []

  for (const meta of metas) {
    const cached = cache[meta.id]
    const ttl = cached?.isAuthenticated
      ? AUTH_CACHE_TTL_AUTHENTICATED
      : AUTH_CACHE_TTL_UNAUTHENTICATED
    const cacheValid = cached && now - cached.timestamp < ttl && !forceRefresh

    if (cacheValid) {
      results.push({
        ...meta,
        isAuthenticated: cached.isAuthenticated,
        username: cached.username,
        avatar: cached.avatar,
        error: cached.error
      })
    } else {
      needsCheck.push(meta)
    }
  }

  for (let i = 0; i < needsCheck.length; i += AUTH_CHECK_CONCURRENCY) {
    const batch = needsCheck.slice(i, i + AUTH_CHECK_CONCURRENCY)
    const batchResults = await Promise.all(
      batch.map(async (meta) => {
        try {
          const adapter = await adapterRegistry.get(meta.id)
          if (!adapter) {
            return { ...meta, isAuthenticated: false, error: '平台适配器不存在' }
          }

          const auth = await withTimeout(
            adapter.checkAuth(),
            AUTH_CHECK_TIMEOUT,
            `登录检测超时（${AUTH_CHECK_TIMEOUT / 1000}秒）`
          )

          cache[meta.id] = {
            isAuthenticated: auth.isAuthenticated,
            username: auth.username,
            avatar: auth.avatar,
            error: auth.error,
            timestamp: now
          }

          return {
            ...meta,
            isAuthenticated: auth.isAuthenticated,
            username: auth.username,
            avatar: auth.avatar,
            error: auth.error
          }
        } catch (error) {
          cache[meta.id] = {
            isAuthenticated: false,
            error: (error as Error).message,
            timestamp: now
          }
          return { ...meta, isAuthenticated: false, error: (error as Error).message }
        }
      })
    )
    results.push(...batchResults)
  }

  await setCachedAuth(cache)

  return results
}

// ============ 同步执行 ============

export type SyncStage =
  | 'starting'
  | 'uploading_images'
  | 'saving'
  | 'completed'
  | 'failed'

export interface SyncDetailProgress {
  platform: string
  platformName: string
  stage: SyncStage
  imageProgress?: { current: number; total: number }
  result?: SyncResult
  error?: string
}

export interface SyncCallbacks {
  onResult?: (result: SyncResult) => void
  onDetailProgress?: (progress: SyncDetailProgress) => void
}

export interface SyncOptions {
  /** 仅保存为草稿（默认 true） */
  draftOnly?: boolean
  /** 是否写入同步历史（默认 true） */
  saveHistory?: boolean
}

// 同步取消控制
let syncAbortController: AbortController | null = null

/**
 * 取消正在进行的同步
 */
export function cancelSync(): boolean {
  if (syncAbortController) {
    syncAbortController.abort()
    syncAbortController = null
    return true
  }
  return false
}

/**
 * 是否正在同步
 */
export function isSyncing(): boolean {
  return syncAbortController !== null
}

/**
 * 同步到单个平台
 */
export async function syncToPlatform(
  platformId: string,
  article: Article,
  options?: SyncOptions
): Promise<SyncResult> {
  const draftOnly = options?.draftOnly ?? true

  // CMS 账号
  if (platformId.startsWith('cms_')) {
    return syncToCmsAccount(platformId, article, draftOnly)
  }

  const adapter = await getAdapter(platformId)
  if (!adapter) {
    return {
      platform: platformId,
      success: false,
      error: '平台适配器不存在',
      timestamp: Date.now()
    }
  }

  try {
    // 使用平台专属预处理内容（如果存在）
    let platformArticle = article
    const platformContents = (article as Article & {
      platformContents?: Record<string, { html: string; markdown: string }>
    }).platformContents

    if (platformContents?.[platformId]) {
      const content = platformContents[platformId]
      platformArticle = {
        ...article,
        html: content.html,
        markdown: content.markdown
      }
    }

    return await withTimeout(
      adapter.publish(platformArticle, { draftOnly }),
      PUBLISH_TIMEOUT,
      `同步超时（${PUBLISH_TIMEOUT / 60000}分钟）`
    )
  } catch (error) {
    return {
      platform: platformId,
      success: false,
      error: (error as Error).message,
      timestamp: Date.now()
    }
  }
}

/**
 * 同步到多个平台（分批并发，最多同时 3 个，支持取消）
 */
export async function syncToMultiplePlatforms(
  platformIds: string[],
  article: Article & { platformContents?: Record<string, { html: string; markdown: string }> },
  callbacks?: SyncCallbacks,
  options?: SyncOptions
): Promise<SyncResult[]> {
  initSyncAdapters()

  syncAbortController = new AbortController()
  const signal = syncAbortController.signal

  const results: SyncResult[] = []

  const syncOne = async (platformId: string): Promise<SyncResult> => {
    const name = platformId.startsWith('cms_')
      ? (await getCmsAccounts()).find((a) => a.id === platformId)?.name || platformId
      : platformName(platformId)

    if (signal.aborted) {
      const cancelled: SyncResult = {
        platform: platformId,
        success: false,
        error: '已取消',
        timestamp: Date.now()
      }
      callbacks?.onDetailProgress?.({
        platform: platformId,
        platformName: name,
        stage: 'failed',
        result: cancelled,
        error: '已取消'
      })
      return cancelled
    }

    callbacks?.onDetailProgress?.({ platform: platformId, platformName: name, stage: 'starting' })

    const result = await syncToPlatform(platformId, article, options)

    callbacks?.onDetailProgress?.({
      platform: platformId,
      platformName: name,
      stage: result.success ? 'completed' : 'failed',
      result,
      error: result.error
    })

    callbacks?.onResult?.(result)

    return result
  }

  for (let i = 0; i < platformIds.length; i += CONCURRENCY_LIMIT) {
    if (signal.aborted) {
      for (const platformId of platformIds.slice(i)) {
        const cancelled: SyncResult = {
          platform: platformId,
          success: false,
          error: '已取消',
          timestamp: Date.now()
        }
        results.push(cancelled)
        callbacks?.onResult?.(cancelled)
      }
      break
    }

    const batch = platformIds.slice(i, i + CONCURRENCY_LIMIT)
    const batchResults = await Promise.all(batch.map(syncOne))
    results.push(...batchResults)
  }

  syncAbortController = null

  if (options?.saveHistory !== false) {
    await saveSyncHistory({
      article: { title: article.title, cover: article.cover },
      platforms: platformIds,
      results,
      startTime: Date.now()
    })
  }

  const successCount = results.filter((r) => r.success).length
  await updateBadge(successCount, results.length)

  return results
}

/**
 * 更新扩展角标（3 秒后自动清除）
 */
async function updateBadge(successCount: number, total: number): Promise<void> {
  try {
    if (!chrome?.action) return

    const text = successCount === total ? '✓' : String(successCount)
    await chrome.action.setBadgeBackgroundColor({
      color: successCount === total ? '#22C55E' : '#F59E0B'
    })
    await chrome.action.setBadgeText({ text })

    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' }).catch(() => {})
    }, 3000)
  } catch {
    // 忽略角标错误
  }
}

// ============ 自建站（CMS）账号 ============

export interface CmsAccount {
  /** 唯一 ID（cms_ 前缀） */
  id: string
  type: 'wordpress' | 'typecho' | 'metaweblog'
  /** 显示名称 */
  name: string
  /** 站点地址，如 https://blog.example.com */
  url: string
  username: string
}

export const CMS_TYPES: Array<{ value: CmsAccount['type']; label: string }> = [
  { value: 'wordpress', label: 'WordPress' },
  { value: 'typecho', label: 'Typecho' },
  { value: 'metaweblog', label: 'MetaWeblog（通用）' }
]

/**
 * 读取全部自建站账号
 */
export async function getCmsAccounts(): Promise<CmsAccount[]> {
  try {
    const result = await chrome.storage.local.get(CMS_ACCOUNTS_KEY)
    return result[CMS_ACCOUNTS_KEY] || []
  } catch {
    return []
  }
}

/**
 * 保存自建站账号（新增或更新）
 */
export async function saveCmsAccount(
  account: Omit<CmsAccount, 'id'> & { id?: string },
  password?: string
): Promise<CmsAccount> {
  const accounts = await getCmsAccounts()

  const id = account.id || `cms_${account.type}_${Date.now()}`
  const saved: CmsAccount = {
    id,
    type: account.type,
    name: account.name,
    url: account.url,
    username: account.username
  }

  const index = accounts.findIndex((a) => a.id === id)
  if (index >= 0) {
    accounts[index] = saved
  } else {
    accounts.push(saved)
  }

  await chrome.storage.local.set({ [CMS_ACCOUNTS_KEY]: accounts })

  if (password !== undefined) {
    await chrome.storage.local.set({ [`${CMS_PWD_PREFIX}${id}`]: password })
  }

  return saved
}

/**
 * 删除自建站账号
 */
export async function removeCmsAccount(id: string): Promise<void> {
  const accounts = await getCmsAccounts()
  await chrome.storage.local.set({
    [CMS_ACCOUNTS_KEY]: accounts.filter((a) => a.id !== id)
  })
  await chrome.storage.local.remove(`${CMS_PWD_PREFIX}${id}`)
}

async function getCmsPassword(id: string): Promise<string | null> {
  try {
    const result = await chrome.storage.local.get(`${CMS_PWD_PREFIX}${id}`)
    return result[`${CMS_PWD_PREFIX}${id}`] || null
  } catch {
    return null
  }
}

/**
 * 检测自建站账号可用性
 */
export async function checkCmsAuth(account: CmsAccount): Promise<AuthResult> {
  const password = await getCmsPassword(account.id)
  if (!password) {
    return { isAuthenticated: false, error: '未保存密码' }
  }

  try {
    const credentials = {
      url: account.url,
      username: account.username,
      password
    }

    const result =
      account.type === 'typecho'
        ? await metaweblogAdapter.testTypechoConnection(credentials)
        : account.type === 'wordpress'
          ? await wordpressAdapter.testConnection(credentials)
          : await metaweblogAdapter.testConnection(credentials)

    if (result.success) {
      return { isAuthenticated: true, username: account.username }
    }

    return { isAuthenticated: false, error: result.error }
  } catch (error) {
    return { isAuthenticated: false, error: (error as Error).message }
  }
}

/**
 * 同步到自建站账号
 */
export async function syncToCmsAccount(
  accountId: string,
  article: Article,
  draftOnly = true
): Promise<SyncResult> {
  const accounts = await getCmsAccounts()
  const account = accounts.find((a) => a.id === accountId)

  if (!account) {
    return {
      platform: accountId,
      success: false,
      error: '账号不存在',
      timestamp: Date.now()
    }
  }

  const password = await getCmsPassword(accountId)
  if (!password) {
    return {
      platform: accountId,
      success: false,
      error: '密码未找到，请重新添加账号',
      timestamp: Date.now()
    }
  }

  const credentials = {
    url: account.url,
    username: account.username,
    password
  }

  // 自建站统一使用 HTML 内容
  const payload = {
    title: article.title,
    content: article.html || article.markdown || ''
  }

  try {
    let result: { success: boolean; postUrl?: string; message?: string; error?: string }

    if (account.type === 'typecho') {
      result = await metaweblogAdapter.publishToTypecho(credentials, payload, { draftOnly })
    } else if (account.type === 'wordpress') {
      result = await wordpressAdapter.publish(credentials, payload, { draftOnly })
    } else {
      result = await metaweblogAdapter.publish(credentials, payload, { draftOnly })
    }

    return {
      platform: accountId,
      success: result.success,
      postUrl: result.postUrl,
      draftOnly,
      message: result.message,
      error: result.error,
      timestamp: Date.now()
    }
  } catch (error) {
    return {
      platform: accountId,
      success: false,
      error: (error as Error).message,
      timestamp: Date.now()
    }
  }
}

// ============ 同步历史 ============

export interface SyncHistoryItem {
  id: string
  title: string
  cover?: string
  platforms: string[]
  results: SyncResult[]
  startTime: number
}

async function saveSyncHistory(item: {
  article: { title: string; cover?: string }
  platforms: string[]
  results: SyncResult[]
  startTime: number
}): Promise<void> {
  try {
    const result = await chrome.storage.local.get(SYNC_HISTORY_KEY)
    const history: SyncHistoryItem[] = result[SYNC_HISTORY_KEY] || []

    const ids = new Set(item.platforms)
    const resultsWithNames = item.results.map((r) => ({
      ...r,
      platformName: ids.has(r.platform) ? platformName(r.platform) : r.platform
    }))

    history.unshift({
      id: `sync_${Date.now()}`,
      title: item.article.title,
      cover: item.article.cover,
      platforms: item.platforms,
      results: resultsWithNames,
      startTime: item.startTime
    })

    await chrome.storage.local.set({
      [SYNC_HISTORY_KEY]: history.slice(0, MAX_HISTORY_ITEMS)
    })
  } catch (error) {
    logger.error('保存同步历史失败:', error)
  }
}

/**
 * 读取同步历史
 */
export async function getSyncHistory(): Promise<SyncHistoryItem[]> {
  try {
    const result = await chrome.storage.local.get(SYNC_HISTORY_KEY)
    return result[SYNC_HISTORY_KEY] || []
  } catch {
    return []
  }
}

/**
 * 清空同步历史
 */
export async function clearSyncHistory(): Promise<void> {
  await chrome.storage.local.remove(SYNC_HISTORY_KEY)
}
