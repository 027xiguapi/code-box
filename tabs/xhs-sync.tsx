import {
  CloudUploadOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  HistoryOutlined,
  ReloadOutlined,
  SyncOutlined
} from "@ant-design/icons"
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Empty,
  Input,
  InputNumber,
  List,
  message,
  Space,
  Spin,
  Tag,
  Typography
} from "antd"
import { useEffect, useMemo, useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import type { SyncXhsResult } from "~sync/xhs/client"
import { extractXhsUrls, parseNoteId } from "~sync/xhs/core"
import {
  clearXhsSyncHistory,
  DEFAULT_XHS_NAICHA_CONFIG,
  getXhsNaichaConfig,
  getXhsSyncHistory,
  isXhsNaichaConfigReady,
  saveXhsNaichaConfig,
  type XhsNaichaConfig,
  type XhsSyncRecord
} from "~sync/xhs/storage"
import { ThemeProvider } from "~theme"

import styles from "./xhs-sync.module.scss"

const { Text, Link, Paragraph } = Typography
const { TextArea } = Input

type TaskStatus =
  | "queued"
  | "running"
  | "done"
  | "pending"
  | "duplicate"
  | "error"

interface SyncTask {
  key: string
  url: string
  noteId: string
  title?: string
  status: TaskStatus
  message?: string
  postUrl?: string
  images?: number
}

const STATUS_META: Record<TaskStatus, { color: string; text: string }> = {
  queued: { color: "default", text: "等待中" },
  running: { color: "processing", text: "同步中" },
  done: { color: "success", text: "已发布" },
  pending: { color: "warning", text: "待审核" },
  duplicate: { color: "default", text: "已同步过" },
  error: { color: "error", text: "失败" }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatTime(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

export default function XhsSyncPage() {
  const [config, setConfig] = useState<XhsNaichaConfig>(
    DEFAULT_XHS_NAICHA_CONFIG
  )
  const [configLoading, setConfigLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [urlText, setUrlText] = useState("")
  const [force, setForce] = useState(false)
  const [collecting, setCollecting] = useState(false)

  const [tasks, setTasks] = useState<SyncTask[]>([])
  const [running, setRunning] = useState(false)
  const cancelRef = useRef(false)

  const [history, setHistory] = useState<XhsSyncRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const configReady = isXhsNaichaConfigReady(config)
  const parsedUrls = useMemo(() => extractXhsUrls(urlText), [urlText])

  useEffect(() => {
    init()
  }, [])

  async function init() {
    try {
      setConfig(await getXhsNaichaConfig())
    } catch (error) {
      message.error(`读取配置失败：${(error as Error).message}`)
    } finally {
      setConfigLoading(false)
    }
    refreshHistory()
  }

  async function refreshHistory() {
    setHistoryLoading(true)
    try {
      setHistory(await getXhsSyncHistory())
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  function patchConfig(patch: Partial<XhsNaichaConfig>) {
    setConfig((prev) => ({ ...prev, ...patch }))
  }

  async function handleSaveConfig() {
    setSaving(true)
    try {
      const saved = await saveXhsNaichaConfig(config)
      setConfig(saved)
      message.success("配置已保存到本机浏览器")
    } catch (error) {
      message.error(`保存配置失败：${(error as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  async function collectFromCurrentTab() {
    setCollecting(true)
    try {
      const tabs = await chrome.tabs.query({})
      const candidates = tabs.filter(
        (tab) =>
          tab.id &&
          tab.url &&
          /^https:\/\/(?:www\.)?xiaohongshu\.com\//.test(tab.url)
      )
      if (candidates.length === 0) {
        message.warning("请先打开一个小红书页面（个人主页、搜索结果或笔记页）")
        return
      }

      const active = candidates.find((tab) => tab.active) || candidates[0]
      message.info("正在读取页面并自动滚动加载笔记，请稍候…")

      const response = await chrome.tabs.sendMessage(active.id!, {
        type: "CODEBOX_XHS_COLLECT_LINKS",
        scroll: true
      })

      const links: { url: string; noteId: string }[] = response?.links || []
      if (links.length === 0) {
        message.warning(
          "当前页面没有找到笔记链接，请确认已打开个人主页或搜索结果"
        )
        return
      }

      const existingIds = new Set(
        parsedUrls.map((url) => parseNoteId(url)).filter(Boolean)
      )
      const added = links.filter((link) => !existingIds.has(link.noteId))
      if (added.length === 0) {
        message.info("当前页面的笔记都已经在列表里了")
        return
      }

      setUrlText((prev) =>
        [prev.trim(), ...added.map((link) => link.url)]
          .filter(Boolean)
          .join("\n")
      )
      message.success(`读取到 ${added.length} 篇笔记`)
    } catch (error) {
      message.error(
        `读取页面失败：${(error as Error).message}\n如果页面是刚打开的，请刷新后再试`
      )
    } finally {
      setCollecting(false)
    }
  }

  function patchTask(index: number, patch: Partial<SyncTask>) {
    setTasks((prev) =>
      prev.map((task, taskIndex) =>
        taskIndex === index ? { ...task, ...patch } : task
      )
    )
  }

  async function startSync() {
    if (running) return

    if (parsedUrls.length === 0) {
      message.warning("没有识别到小红书笔记链接，请粘贴链接或先读取当前页面")
      return
    }

    const saved = await saveXhsNaichaConfig(config).catch((error) => {
      message.error(`保存配置失败：${(error as Error).message}`)
      return null
    })
    if (!saved) return
    setConfig(saved)

    if (!isXhsNaichaConfigReady(saved)) {
      message.warning(
        "请先填写并保存奶茶圈接口配置（站点地址、密钥、机器人、板块）"
      )
      return
    }

    const initialTasks: SyncTask[] = parsedUrls.map((url, index) => {
      const noteId = parseNoteId(url)
      return {
        key: `${index}-${noteId || url}`,
        url,
        noteId,
        status: "queued"
      }
    })

    setTasks(initialTasks)
    setRunning(true)
    cancelRef.current = false

    let successCount = 0
    let pendingCount = 0
    let duplicateCount = 0
    let failedCount = 0

    for (let i = 0; i < initialTasks.length; i++) {
      if (cancelRef.current) break

      const task = initialTasks[i]
      patchTask(i, { status: "running" })

      let result: SyncXhsResult | undefined
      try {
        result = await sendToBackground<any, SyncXhsResult>({
          name: "xhsSync",
          body: {
            action: "syncOne",
            url: task.url,
            force
          }
        })
      } catch (error) {
        result = { ok: false, error: (error as Error).message }
      }

      if (result?.ok && result.duplicate) {
        duplicateCount += 1
        patchTask(i, {
          status: "duplicate",
          title: result.title,
          postUrl: result.postUrl,
          message: "这篇笔记已经同步过，已跳过"
        })
      } else if (result?.ok) {
        if (result.pending) {
          pendingCount += 1
        } else {
          successCount += 1
        }
        patchTask(i, {
          status: result.pending ? "pending" : "done",
          title: result.title,
          postUrl: result.postUrl,
          images: result.images,
          message: result.pending ? "已提交审核" : "发布成功"
        })
      } else {
        failedCount += 1
        patchTask(i, {
          status: "error",
          title: result?.title,
          message: result?.error || "同步失败"
        })
      }

      if (i < initialTasks.length - 1 && !cancelRef.current) {
        await delay(600)
      }
    }

    await sendToBackground({
      name: "xhsSync",
      body: { action: "closeTab" }
    }).catch(() => {})

    setRunning(false)
    refreshHistory()

    if (cancelRef.current) {
      message.info("已取消，剩余笔记未同步")
    } else if (failedCount > 0) {
      message.warning(
        `同步完成：发布 ${successCount + pendingCount} 篇，已同步过 ${duplicateCount} 篇，失败 ${failedCount} 篇`
      )
    } else {
      message.success(
        `同步完成：发布 ${successCount + pendingCount} 篇，已同步过 ${duplicateCount} 篇`
      )
    }
  }

  function cancelSync() {
    cancelRef.current = true
    message.info("已请求取消，当前笔记完成后停止")
  }

  async function handleClearHistory() {
    if (
      !window.confirm("确认清空全部同步历史？清空后已同步的笔记可以再次发布。")
    ) {
      return
    }
    try {
      await clearXhsSyncHistory()
      await refreshHistory()
      message.success("同步历史已清空")
    } catch (error) {
      message.error(`清空失败：${(error as Error).message}`)
    }
  }

  const progress = useMemo(() => {
    const finished = tasks.filter(
      (task) => task.status === "done" || task.status === "pending"
    ).length
    const duplicates = tasks.filter(
      (task) => task.status === "duplicate"
    ).length
    const failed = tasks.filter((task) => task.status === "error").length
    return {
      finished,
      duplicates,
      failed,
      total: tasks.length
    }
  }, [tasks])

  return (
    <ThemeProvider>
      <div className={styles.xhsSync}>
        <div className="xhs-sync-container">
          <div className="xhs-sync-header">
            <div>
              <h2 className="title">小红书推文同步 🍠</h2>
              <p className="desc">
                把小红书笔记的正文和配图批量发布到奶茶圈（通过机器人
                API），发布前无需上传图片
              </p>
            </div>
            <Space>
              <a href="/tabs/sync.html" target="_blank" rel="noreferrer">
                <CloudUploadOutlined /> 文章同步
              </a>
              <a href="/tabs/history.html" target="_blank" rel="noreferrer">
                <HistoryOutlined /> 下载历史
              </a>
            </Space>
          </div>

          {/* 1. 奶茶圈接口配置 */}
          <Card
            title="① 奶茶圈接口"
            size="small"
            style={{ marginBottom: 16 }}
            extra={
              <Tag color={configReady ? "success" : "warning"}>
                {configReady ? "已配置" : "待配置"}
              </Tag>
            }>
            <Spin spinning={configLoading}>
              <div className="config-grid">
                <label className="config-item">
                  <span className="config-label">站点地址</span>
                  <Input
                    value={config.apiBase}
                    placeholder="http://127.0.0.1:3000"
                    onChange={(event) =>
                      patchConfig({ apiBase: event.target.value })
                    }
                  />
                  <span className="config-hint">
                    本地开发默认 http://127.0.0.1:3000
                  </span>
                </label>

                <label className="config-item">
                  <span className="config-label">BOT_API_SECRET</span>
                  <Input.Password
                    value={config.botSecret}
                    placeholder="奶茶圈服务端 .env 里的 BOT_API_SECRET"
                    onChange={(event) =>
                      patchConfig({ botSecret: event.target.value })
                    }
                  />
                  <span className="config-hint">
                    只保存在本机浏览器，不会同步到其它设备
                  </span>
                </label>

                <label className="config-item">
                  <span className="config-label">机器人账号</span>
                  <Input
                    value={config.bot}
                    placeholder="quanxiaoer"
                    onChange={(event) =>
                      patchConfig({ bot: event.target.value })
                    }
                  />
                  <span className="config-hint">
                    奶茶圈后台「机器人列表」里的用户名、昵称或 ID
                  </span>
                </label>

                <label className="config-item">
                  <span className="config-label">板块 slug</span>
                  <Input
                    value={config.boardSlug}
                    placeholder="brand-review"
                    onChange={(event) =>
                      patchConfig({ boardSlug: event.target.value })
                    }
                  />
                  <span className="config-hint">
                    发帖分类的 boardSlug，例如 brand-review
                  </span>
                </label>

                <label className="config-item">
                  <span className="config-label">附加标签</span>
                  <Input
                    value={config.extraTags}
                    placeholder="奶茶,探店"
                    onChange={(event) =>
                      patchConfig({ extraTags: event.target.value })
                    }
                  />
                  <span className="config-hint">
                    逗号分隔；会自动加上「小红书」并合并笔记话题，最多 10 个
                  </span>
                </label>

                <label className="config-item">
                  <span className="config-label">每篇最多图片</span>
                  <InputNumber
                    min={1}
                    max={18}
                    value={config.maxImages}
                    style={{ width: "100%" }}
                    onChange={(value) =>
                      patchConfig({
                        maxImages:
                          typeof value === "number"
                            ? value
                            : DEFAULT_XHS_NAICHA_CONFIG.maxImages
                      })
                    }
                  />
                  <span className="config-hint">
                    机器人接口不支持上传文件，图片以原图链接写入正文
                  </span>
                </label>
              </div>
            </Spin>

            <div className="config-footer">
              <Button
                type="primary"
                loading={saving}
                onClick={handleSaveConfig}>
                保存配置
              </Button>
              <Button
                icon={<FolderOpenOutlined />}
                onClick={() =>
                  chrome.tabs.create({
                    url: config.apiBase || "http://127.0.0.1:3000"
                  })
                }>
                打开奶茶圈
              </Button>
              <Text type="secondary" style={{ fontSize: 12 }}>
                接口：POST {config.apiBase}/api/bot/posts
              </Text>
            </div>

            <Alert
              style={{ marginTop: 12 }}
              type="info"
              showIcon
              message="发布规则"
              description={
                <ul style={{ marginBottom: 0, paddingLeft: 18 }}>
                  <li>
                    同一篇笔记按笔记 ID
                    去重，需要重发时勾选下方「强制重新同步」。
                  </li>
                  <li>
                    正文里的 #话题[话题]# 标记会被清理，话题名会合并进帖子标签。
                  </li>
                  <li>
                    板块开启审核时帖子会返回「待审核」，在奶茶圈后台通过后才会公开。
                  </li>
                </ul>
              }
            />
          </Card>

          {/* 2. 笔记链接 */}
          <Card
            title="② 选择要同步的笔记"
            size="small"
            style={{ marginBottom: 16 }}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                已识别 {parsedUrls.length} 篇
              </Text>
            }>
            <div className="batch-toolbar">
              <Button
                icon={<SyncOutlined />}
                loading={collecting}
                onClick={collectFromCurrentTab}>
                读取当前小红书页面
              </Button>
              <Text type="secondary" style={{ fontSize: 12 }}>
                打开个人主页/搜索结果后点这里，会自动滚动加载并收集笔记链接
              </Text>
            </div>

            <TextArea
              value={urlText}
              rows={8}
              placeholder={`每行一个笔记链接，也可以直接粘贴整段分享文案，例如：
https://www.xiaohongshu.com/explore/xxxxxxxx?xsec_token=...
https://www.xiaohongshu.com/discovery/item/xxxxxxxx
https://xhslink.com/xxxxxx
xxxxxxxxxxxxxxxxxxxxxxxx（24 位笔记 ID）`}
              onChange={(event) => setUrlText(event.target.value)}
            />

            <div className="batch-toolbar" style={{ marginTop: 12 }}>
              <Checkbox
                checked={force}
                onChange={(e) => setForce(e.target.checked)}>
                强制重新同步（忽略本地去重记录）
              </Checkbox>
              <Button
                size="small"
                onClick={() => setUrlText("")}
                disabled={!urlText || running}>
                清空链接
              </Button>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={refreshHistory}
                loading={historyLoading}>
                刷新
              </Button>
            </div>
          </Card>

          {/* 3. 同步进度 */}
          {(tasks.length > 0 || running) && (
            <Card
              title="③ 同步进度"
              size="small"
              style={{ marginBottom: 16 }}
              extra={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  已发布 {progress.finished}/{progress.total}
                  {progress.duplicates > 0
                    ? `，跳过 ${progress.duplicates}`
                    : ""}
                  {progress.failed > 0 ? `，失败 ${progress.failed}` : ""}
                </Text>
              }>
              <List
                className="task-list"
                size="small"
                dataSource={tasks}
                renderItem={(task, index) => {
                  const meta = STATUS_META[task.status]
                  return (
                    <List.Item
                      key={task.key}
                      actions={
                        task.postUrl
                          ? [
                              <Link
                                key="post"
                                href={task.postUrl}
                                target="_blank"
                                rel="noreferrer">
                                查看帖子
                              </Link>
                            ]
                          : undefined
                      }>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div>
                          <Tag color={meta.color}>{meta.text}</Tag>
                          <span className="task-title">
                            {task.title || task.noteId || `第 ${index + 1} 篇`}
                          </span>
                        </div>
                        <div className="task-meta">
                          <Link
                            href={task.url}
                            target="_blank"
                            rel="noreferrer">
                            小红书原文
                          </Link>
                          {task.images ? (
                            <span>{task.images} 张图片</span>
                          ) : null}
                          {task.message ? (
                            <span
                              className={
                                task.status === "error" ? "task-error" : ""
                              }>
                              {task.message}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </List.Item>
                  )
                }}
              />
            </Card>
          )}

          {/* 4. 同步历史 */}
          <Card
            title="④ 同步历史"
            size="small"
            style={{ marginBottom: 16 }}
            extra={
              history.length > 0 && (
                <Button
                  size="small"
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleClearHistory}>
                  清空历史
                </Button>
              )
            }>
            {history.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无同步记录"
              />
            ) : (
              <List
                className="history-list"
                size="small"
                dataSource={history.slice(0, 30)}
                renderItem={(record) => (
                  <List.Item key={record.noteId}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div>
                        <span className="history-title">{record.title}</span>
                        {record.pending ? (
                          <Tag color="warning" style={{ marginLeft: 8 }}>
                            待审核
                          </Tag>
                        ) : null}
                      </div>
                      <div className="history-meta">
                        <Link
                          href={record.sourceUrl}
                          target="_blank"
                          rel="noreferrer">
                          小红书原文
                        </Link>
                        {record.postUrl ? (
                          <Link
                            href={record.postUrl}
                            target="_blank"
                            rel="noreferrer">
                            奶茶圈帖子
                          </Link>
                        ) : null}
                        <span>{formatTime(record.syncedAt)}</span>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>

          <div className="xhs-footer">
            <Button
              type="primary"
              icon={<SyncOutlined />}
              loading={running}
              disabled={parsedUrls.length === 0}
              onClick={startSync}>
              开始同步（{parsedUrls.length} 篇）
            </Button>

            {running && (
              <Button danger onClick={cancelSync}>
                取消
              </Button>
            )}

            <Paragraph type="secondary" style={{ fontSize: 12, margin: 0 }}>
              同步时会在后台标签页逐篇打开小红书笔记读取内容，完成后自动关闭；
              数据只在本机浏览器和你的奶茶圈站点之间传输。
            </Paragraph>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
