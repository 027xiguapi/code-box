import type { PlasmoMessaging } from "@plasmohq/messaging"

// 处理截图请求
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { action, text, autoSend, images, prompt } = req.body

  try {
    if (action === "captureVisibleTab") {
      // 截取当前可见标签页
      const dataUrl = await chrome.tabs.captureVisibleTab(null, {
        format: "png"
      })
      res.send({ success: true, dataUrl })
      return
    }

    if (action === "sendToActiveTab") {
      // 发送消息到当前活动标签页
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          action: "sendToChat",
          text,
          autoSend
        })
        res.send({ success: true })
      } else {
        res.send({ success: false, error: "No active tab found" })
      }
      return
    }

    if (action === "sendImageToActiveTab") {
      // 发送图片到当前活动标签页
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          action: "sendImageToChat",
          images
        })
        res.send({ success: true })
      } else {
        res.send({ success: false, error: "No active tab found" })
      }
      return
    }

    res.send({ success: false, error: "Unknown action" })
  } catch (error) {
    console.error("[Chat Handler] Error:", error)
    res.send({ success: false, error: error.message })
  }
}

export default handler
