import { CloudUploadOutlined, ReloadOutlined, HistoryOutlined } from "@ant-design/icons"
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Collapse,
  Divider,
  Empty,
  List,
  message,
  Select,
  Space,
  Statistic,
  Tabs,
  Tag,
  Typography
} from "antd"
import { useEffect, useMemo, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import CmsManager from "~component/sync/CmsManager"
import PlatformPicker from "~component/sync/PlatformPicker"
import SyncProgress from "~component/sync/SyncProgress"
import { ThemeProvider } from "~theme"
import {
  cancelSync,
  checkAllPlatformsAuth,
  checkPlatformAuth,
  clearSyncHistory,
  getCmsAccounts,
  getPlatformPreprocessConfigs,
  getSyncHistory,
  getAllPlatformMetas,
  syncToMultiplePlatforms,
  type CmsAccount,
  type PlatformAuthItem,
  type SyncDetailProgress,
  type SyncHistoryItem
} from "~sync/extension/engine"
import type { ExtractedArticle } from "~sync/extension/extractor"
import type { SyncResult } from "~sync/types"

import styles from "./sync.module.scss"

const { Text, Paragraph } = Typography

interface TargetTab {
  id: number
  title: string
  url: string
}

export default function SyncPage() {
  const [tabs, setTabs] = useState<TargetTab[]>([])
  const [targetTabId, setTargetTabId] = useState<number | null>(null)
  const [article, setArticle] = useState<ExtractedArticle | null>(null)
  const [extracting, setExtracting] = useState(false)

  const [platforms, setPlatforms] = useState<PlatformAuthItem[]>([])
  const [authLoading, setAuthLoading] = useState(false)
  const [cmsAccounts, setCmsAccounts] = useState<CmsAccount[]>([])

  const [selected, setSelected] = useStorage<string[]>("codebox-sync-platforms", [])
  const [draftOnly, setDraftOnly] = useStorage<boolean>("codebox-sync-draft-only", true)

  const [progress, setProgress] = useState<Record<string, SyncDetailProgress>>({})
  const [results, setResults] = useState<SyncResult[]>([])
  const [syncing, setSyncing] = useState(false)

  const [history, setHistory] = useState<SyncHistoryItem[]>([])

  // 平台名称映射
  const platformNames = useMemo(() => {
    const map: Record<string, string> = {}
    for (const meta of getAllPlatformMetas()) {
      map[meta.id] = meta.name
    }
    for (const account of cmsAccounts) {
      map[account.id] = account.name
    }
    return map
  }, [cmsAccounts])

  // 初始化：加载可选目标标签页、登录状态、历史记录
  useEffect(() => {
    init()
  }, [])

  async function init() {
    const allTabs = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] })

    const list: TargetTab[] = allTabs
      .filter((tab) => tab.id !== undefined && tab.url)
      .map((tab) => ({ id: tab.id!, title: tab.title || tab.url!, url: tab.url! }))

    // 最近访问的标签页排在前面
    list.sort((a, b) => {
      const tabA = allTabs.find((t) => t.id === a.id) as
        | (chrome.tabs.Tab & { lastAccessed?: number })
        | undefined
      const tabB = allTabs.find((t) => t.id === b.id) as
        | (chrome.tabs.Tab & { lastAccessed?: number })
        | undefined
      return (tabB?.lastAccessed || 0) - (tabA?.lastAccessed || 0)
    })

    setTabs(list)

    // 优先使用 URL 参数指定的标签页（从弹窗打开时传入）
    const params = new URLSearchParams(window.location.search)
    const tabIdFromQuery = Number(params.get("tabId"))

    if (tabIdFromQuery && list.some((t) => t.id === tabIdFromQuery)) {
      setTargetTabId(tabIdFromQuery)
    } else if (list.length > 0) {
      setTargetTabId(list[0].id)
    }

    refreshAuth().catch(() => {})
    refreshHistory().catch(() => {})

    const accounts = await getCmsAccounts()
    setCmsAccounts(accounts)
  }

  // 目标标签页变化时重新提取文章
  useEffect(() => {
    if (targetTabId) {
      extract()
    }
  }, [targetTabId])

  async function extract() {
    if (!targetTabId) return
    setExtracting(true)
    setArticle(null)

    try {
      const response = await chrome.tabs.sendMessage(targetTabId, {
        type: "CODEBOX_SYNC_EXTRACT"
      })

      if (response?.article) {
        setArticle(response.article)
      } else {
        message.warning("未能从当前页面提取到文章内容，请确认页面已加载完成")
      }
    } catch {
      message.error("无法访问该页面，请刷新目标页面后重试")
    } finally {
      setExtracting(false)
    }
  }

  async function refreshAuth(force = false) {
    setAuthLoading(true)
    try {
      const list = await checkAllPlatformsAuth(force)

      // 自建站账号作为额外的「平台」并入列表
      const accounts = await getCmsAccounts()
      const cmsItems: PlatformAuthItem[] = []

      for (const account of accounts) {
        const auth = await checkPlatformAuth(account.id)
        cmsItems.push({
          id: account.id,
          name: account.name,
          icon: "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
          homepage: account.url,
          capabilities: ["article", "draft"],
          category: "建站/CMS",
          syncMode: "api",
          isAuthenticated: auth.isAuthenticated,
          username: auth.username,
          error: auth.error
        })
      }

      setPlatforms([...list, ...cmsItems])
    } finally {
      setAuthLoading(false)
    }
  }

  async function refreshHistory() {
    setHistory(await getSyncHistory())
  }

  async function handleCmsChange(accounts: CmsAccount[]) {
    setCmsAccounts(accounts)
    await refreshAuth(true)
  }

  async function startSync() {
    if (!article || !targetTabId) return
    if (selected.length === 0) {
      message.warning("请先选择要同步的平台")
      return
    }

    setSyncing(true)
    setProgress({})
    setResults([])

    const validSelected = selected.filter(
      (id) => platformNames[id] !== undefined
    )

    try {
      // 1. 在目标页面为每个平台预处理内容（不同平台需要不同的 HTML 结构）
      const apiPlatforms = validSelected.filter((id) => !id.startsWith("cms_"))
      let platformContents: Record<string, { html: string; markdown: string }> = {}

      if (apiPlatforms.length > 0 && (article.html || article.markdown)) {
        try {
          const configs = getPlatformPreprocessConfigs(apiPlatforms)
          const response = await chrome.tabs.sendMessage(targetTabId, {
            type: "CODEBOX_SYNC_PREPROCESS",
            payload: {
              rawHtml: article.html || article.markdown,
              platforms: apiPlatforms,
              configs
            }
          })
          platformContents = response?.platformContents || {}
        } catch (error) {
          console.warn("[CodeBox] 平台预处理失败，使用原始内容", error)
        }
      }

      // 2. 开始同步
      const syncResults = await syncToMultiplePlatforms(
        validSelected,
        {
          title: article.title,
          markdown: article.markdown,
          html: article.html,
          summary: article.summary,
          cover: article.cover,
          source: article.source,
          platformContents
        },
        {
          onDetailProgress: (item) => {
            setProgress((prev) => ({ ...prev, [item.platform]: item }))
          },
          onResult: (result) => {
            setResults((prev) => [...prev, result])
          }
        },
        { draftOnly }
      )

      const successCount = syncResults.filter((r) => r.success).length
      const failedCount = syncResults.length - successCount

      if (failedCount === 0) {
        message.success(`同步完成：${successCount} 个平台全部成功`)
      } else {
        message.warning(`同步完成：成功 ${successCount} 个，失败 ${failedCount} 个`)
      }

      await refreshHistory()
    } catch (error) {
      message.error(`同步失败：${(error as Error).message}`)
    } finally {
      setSyncing(false)
    }
  }

  const failedResults = results.filter((r) => !r.success && r.error !== "已取消")

  return (
    <ThemeProvider>
      <div className={styles.sync}>
        <div className="sync-container">
          <div className="sync-header">
            <div>
              <h2 className="title">文章同步 🚀</h2>
              <p className="desc">
                一键把当前文章同步到 29+ 主流平台，默认保存为草稿，确认无误后再发布
              </p>
            </div>
            <Space>
              <a href="/tabs/history.html" target="_blank" rel="noreferrer">
                <HistoryOutlined /> 下载历史
              </a>
            </Space>
          </div>

          {/* 1. 目标页面与文章内容 */}
          <Card
            className="article-card"
            title="① 文章内容"
            size="small"
            style={{ marginBottom: 16 }}
            extra={
              <Space>
                <Select
                  size="small"
                  style={{ width: 320 }}
                  value={targetTabId ?? undefined}
                  onChange={setTargetTabId}
                  placeholder="选择要同步的页面"
                  options={tabs.map((tab) => ({
                    value: tab.id,
                    label: tab.title
                  }))}
                />
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  loading={extracting}
                  onClick={extract}>
                  重新提取
                </Button>
              </Space>
            }>
            {extracting ? (
              <Text type="secondary">正在从页面提取文章内容...</Text>
            ) : article ? (
              <div style={{ display: "flex", gap: 16 }}>
                {article.cover && (
                  <img className="article-cover" src={article.cover} alt="封面" />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="article-title">{article.title}</div>
                  <div className="article-meta">
                    <span>正文约 {article.markdown.replace(/\s/g, "").length} 字</span>
                    <span>来源：{article.source.platform}</span>
                    <a href={article.source.url} target="_blank" rel="noreferrer">
                      {article.source.url.slice(0, 80)}
                    </a>
                  </div>
                  <Divider style={{ margin: "8px 0" }} />
                  <div className="article-preview">
                    {article.markdown.slice(0, 500)}
                    {article.markdown.length > 500 ? "..." : ""}
                  </div>
                </div>
              </div>
            ) : (
              <Empty description="暂未提取到文章，请选择页面后点击「重新提取」" />
            )}
          </Card>

          {/* 2. 平台选择 */}
          <Card title="② 选择同步平台" size="small" style={{ marginBottom: 16 }}>
            <PlatformPicker
              platforms={platforms}
              selected={selected}
              loading={authLoading}
              onChange={setSelected}
              onRefresh={() => refreshAuth(true)}
            />

            <Collapse
              ghost
              items={[
                {
                  key: "cms",
                  label: "自建站账号（WordPress / Typecho / MetaWeblog）",
                  children: <CmsManager onChange={handleCmsChange} />
                }
              ]}
            />
          </Card>

          {/* 3. 同步进度 */}
          {(syncing || results.length > 0) && (
            <Card title="③ 同步进度" size="small" style={{ marginBottom: 16 }}>
              <SyncProgress
                total={selected.length}
                progress={progress}
                results={results}
                platformNames={platformNames}
              />

              {failedResults.length > 0 && (
                <Alert
                  style={{ marginTop: 12 }}
                  type="warning"
                  showIcon
                  message="以下平台同步失败"
                  description={
                    <ul style={{ marginBottom: 0, paddingLeft: 18 }}>
                      {failedResults.map((item) => (
                        <li key={item.platform}>
                          {platformNames[item.platform] || item.platform}：{item.error}
                        </li>
                      ))}
                    </ul>
                  }
                />
              )}
            </Card>
          )}

          {/* 4. 同步历史 */}
          <Card
            title="④ 同步历史"
            size="small"
            extra={
              history.length > 0 && (
                <Button
                  size="small"
                  type="link"
                  danger
                  onClick={async () => {
                    await clearSyncHistory()
                    refreshHistory()
                  }}>
                  清空历史
                </Button>
              )
            }>
            {history.length === 0 ? (
              <Text type="secondary">暂无同步记录</Text>
            ) : (
              <List
                size="small"
                dataSource={history.slice(0, 10)}
                renderItem={(item) => {
                  const successCount = item.results.filter((r) => r.success).length
                  return (
                    <List.Item>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div>
                          <Text strong>{item.title}</Text>{" "}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(item.startTime).toLocaleString()}
                          </Text>
                        </div>
                        <div style={{ marginTop: 4 }}>
                          {item.results.map((result) => (
                            <Tag
                              key={result.platform}
                              color={result.success ? "success" : "error"}
                              style={{ marginBottom: 4 }}>
                              {platformNames[result.platform] || result.platform}
                            </Tag>
                          ))}
                        </div>
                      </div>
                      <Statistic
                        value={successCount}
                        suffix={`/ ${item.results.length}`}
                        valueStyle={{ fontSize: 14 }}
                      />
                    </List.Item>
                  )
                }}
              />
            )}
          </Card>

          {/* 底部操作栏 */}
          <div className="sync-footer">
            <Checkbox
              checked={draftOnly}
              onChange={(e) => setDraftOnly(e.target.checked)}>
              仅保存为草稿（推荐）
            </Checkbox>

            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              loading={syncing}
              disabled={!article}
              onClick={startSync}>
              开始同步（{selected.length} 个平台）
            </Button>

            {syncing && (
              <Button
                danger
                onClick={() => {
                  cancelSync()
                  message.info("已请求取消同步")
                }}>
                取消
              </Button>
            )}

            <Text type="secondary" style={{ fontSize: 12 }}>
              使用浏览器中已登录的账号同步，数据不会经过任何第三方服务器
            </Text>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
