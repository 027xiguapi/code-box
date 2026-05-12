import type { PlasmoMessaging } from "@plasmohq/messaging"

// ====== 聊天标签管理 ======
const ROUTERPARK_CHAT_URL = "https://routerpark.com/zh/chat"
const TAB_CHECK_INTERVAL = 3000 // 等待新标签加载的间隔

async function getRouterParkTab(): Promise<chrome.tabs.Tab | null> {
  // 1. 通过后台存储的 tabId 查找
  try {
    const resp = await chrome.runtime.sendMessage({ action: "getChatTabId" })
    if (resp?.tabId) {
      const tab = await chrome.tabs.get(resp.tabId)
      if (tab?.url?.includes("routerpark.com/zh/chat")) return tab
    }
  } catch {
    // 后台消息可能失败，继续其他方式
  }

  // 2. 通过 URL 查找已有标签
  const tabs = await chrome.tabs.query({
    url: ["https://routerpark.com/chat*", "https://routerpark.com/zh/chat*"]
  })
  if (tabs.length > 0) return tabs[0]

  return null
}

async function ensureRouterParkTab(): Promise<chrome.tabs.Tab> {
  const existing = await getRouterParkTab()
  if (existing) {
    await chrome.tabs.update(existing.id!, { active: true })
    await chrome.windows.update(existing.windowId, { focused: true })

    // 等待内容脚本就绪 (最多 15s)
    for (let i = 0; i < 30; i++) {
      try {
        await sendToTab(existing.id!, "pingChatTab", {})
        return existing
      } catch {
        await new Promise((r) => setTimeout(r, 500))
      }
    }
    // 超时，关闭旧标签创建新的
    await chrome.tabs.remove(existing.id!)
  }

  // 新开标签页
  const tab = await chrome.tabs.create({
    url: ROUTERPARK_CHAT_URL,
    active: true
  })

  // 等待内容脚本加载并注册
  await new Promise((r) => setTimeout(r, TAB_CHECK_INTERVAL))

  return tab
}

async function sendToTab(
  tabId: number,
  action: string,
  payload: Record<string, any>
): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { action, ...payload }, (resp) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
      } else {
        resolve(resp)
      }
    })
  })
}

// ====== 消息处理 ======

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { action, text, autoSend, images, prompt } = req.body || {}

  try {
    // ---- 截图 ----
    if (action === "captureVisibleTab") {
      const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: "png" })
      res.send({ success: true, dataUrl })
      return
    }

    // ---- 发送文本到聊天 ----
    if (action === "sendToChat" || action === "sendToActiveTab") {
      // 优先发送到 routerpark 聊天标签页
      const routerParkTab = await getRouterParkTab()
      if (routerParkTab?.id) {
        await sendToTab(routerParkTab.id, "sendToChat", { text, autoSend })
        res.send({ success: true, tabId: routerParkTab.id })
        return
      }

      // 降级：发送到当前活动标签页 (legacy iframe)
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (activeTab?.id) {
        await sendToTab(activeTab.id, "sendToChat", { text, autoSend })
        res.send({ success: true })
        return
      }

      res.send({ success: false, error: "No available tab" })
      return
    }

    // ---- 发送图片到聊天 ----
    if (action === "sendImageToChat" || action === "sendImageToActiveTab") {
      const routerParkTab = await getRouterParkTab()
      if (routerParkTab?.id) {
        await sendToTab(routerParkTab.id, "sendImageToChat", { images })
        res.send({ success: true, tabId: routerParkTab.id })
        return
      }

      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (activeTab?.id) {
        await sendToTab(activeTab.id, "sendImageToChat", { images })
        res.send({ success: true })
        return
      }

      res.send({ success: false, error: "No available tab" })
      return
    }

    // ---- 打开/激活聊天标签页 ----
    if (action === "openChat") {
      const tab = await ensureRouterParkTab()
      res.send({ success: true, tabId: tab.id })
      return
    }

    // ---- 截图并发送 ----
    if (action === "captureAndSend") {
      const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: "png" })
      const routerParkTab = await getRouterParkTab()

      if (routerParkTab?.id) {
        await sendToTab(routerParkTab.id, "sendImageToChat", { images: [dataUrl] })
        if (prompt) {
          setTimeout(async () => {
            try {
              await sendToTab(routerParkTab.id!, "sendToChat", { text: prompt, autoSend: false })
            } catch {}
          }, 300)
        }
        res.send({ success: true })
        return
      }

      // 降级发送到当前页
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (activeTab?.id) {
        await sendToTab(activeTab.id, "sendImageToChat", { images: [dataUrl] })
        if (prompt) {
          setTimeout(() => {
            chrome.tabs.sendMessage(activeTab.id!, { action: "sendToChat", text: prompt, autoSend: false })
          }, 100)
        }
        res.send({ success: true })
        return
      }

      res.send({ success: false, error: "No available tab" })
      return
    }

    res.send({ success: false, error: `Unknown action: ${action}` })
  } catch (error) {
    console.error("[Chat Handler] Error:", error)
    res.send({ success: false, error: error.message })
  }
}

export default handler
