import type { PlasmoMessaging } from "@plasmohq/messaging"

import { closeSyncTab, syncXhsNote } from "~sync/xhs/client"

/**
 * 小红书同步后台消息
 *
 * action:
 * - syncOne: { url, note?, force? } 同步单篇笔记
 * - closeTab: 关闭批量同步用的隐藏标签页
 * - openPage: 打开批量同步管理页
 */
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const body = req.body || {}
  const action = body.action

  try {
    if (action === "syncOne") {
      const result = await syncXhsNote({
        url: body.url,
        note: body.note,
        force: Boolean(body.force)
      })
      res.send(result)
      return
    }

    if (action === "closeTab") {
      await closeSyncTab()
      res.send({ ok: true })
      return
    }

    if (action === "openPage") {
      await chrome.tabs.create({
        url: chrome.runtime.getURL("tabs/xhs-sync.html")
      })
      res.send({ ok: true })
      return
    }

    res.send({ ok: false, error: `未知操作：${action}` })
  } catch (error) {
    console.error("[CodeBox] 小红书同步失败", error)
    res.send({ ok: false, error: (error as Error).message })
  }
}

export default handler
