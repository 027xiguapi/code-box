import "@plasmohq/messaging/background"

export {}

// 初始化设置
chrome.runtime.onInstalled.addListener(function (object) {
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: chrome.runtime.getURL("options.html") })
  }

  // 创建右键菜单
  createContextMenus()
})

// 创建右键菜单
function createContextMenus() {
  // 先移除所有已存在的菜单项
  chrome.contextMenus.removeAll(() => {

  })
  
  // 翻译选中文本
  chrome.contextMenus.create({
    id: "translateText",
    title: chrome.i18n.getMessage("contextMenuTranslate") || "翻译选中文本",
    contexts: ["selection"]
  })

  // 解释代码
  chrome.contextMenus.create({
    id: "explainCode",
    title: chrome.i18n.getMessage("contextMenuExplainCode") || "解释代码",
    contexts: ["selection"]
  })

  // 总结内容
  chrome.contextMenus.create({
    id: "summarizeText",
    title: chrome.i18n.getMessage("contextMenuSummarize") || "总结内容",
    contexts: ["selection"]
  })

  // 截图并分析
  chrome.contextMenus.create({
    id: "captureAndAnalyze",
    title: chrome.i18n.getMessage("contextMenuCaptureAnalyze") || "截图并分析",
    contexts: ["page"]
  })

  // 发送图片到聊天
  chrome.contextMenus.create({
    id: "sendImageToChat",
    title: chrome.i18n.getMessage("contextMenuSendImage") || "发送图片到聊天",
    contexts: ["image"]
  })
}

// 监听右键菜单点击
// chrome.contextMenus.onClicked.addListener((info, tab) => {
//   if (!tab?.id) return

//   switch (info.menuItemId) {
//     case "translateText":
//       chrome.tabs.sendMessage(tab.id, {
//         action: "sendToChat",
//         text: `请将以下文本翻译成中文：\n\n${info.selectionText}`,
//         autoSend: true
//       })
//       break

//     case "explainCode":
//       chrome.tabs.sendMessage(tab.id, {
//         action: "sendToChat",
//         text: `请解释以下代码：\n\n\`\`\`\n${info.selectionText}\n\`\`\``,
//         autoSend: true
//       })
//       break

//     case "summarizeText":
//       chrome.tabs.sendMessage(tab.id, {
//         action: "sendToChat",
//         text: `请帮我总结以下内容：\n\n${info.selectionText}`,
//         autoSend: true
//       })
//       break

//     case "captureAndAnalyze":
//       chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
//         chrome.tabs.sendMessage(tab.id, {
//           action: "sendImageToChat",
//           images: [dataUrl]
//         })
//         setTimeout(() => {
//           chrome.tabs.sendMessage(tab.id, {
//             action: "sendToChat",
//             text: "请分析这张图片的内容",
//             autoSend: false
//           })
//         }, 100)
//       })
//       break

//     case "sendImageToChat":
//       if (info.srcUrl) {
//         // 下载图片并转换为 base64
//         fetch(info.srcUrl)
//           .then((response) => response.blob())
//           .then((blob) => {
//             const reader = new FileReader()
//             reader.onloadend = () => {
//               chrome.tabs.sendMessage(tab.id, {
//                 action: "sendImageToChat",
//                 images: [reader.result as string]
//               })
//             }
//             reader.readAsDataURL(blob)
//           })
//           .catch((error) => {
//             console.error("Failed to download image:", error)
//           })
//       }
//       break
//   }
// })

// ====== 聊天标签页管理 ======
let routerParkTabId: number | null = null

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureVisibleTab") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      sendResponse(dataUrl)
    })
    return true
  }

  if (request.action === "chatResponse") {
    console.log("[Background] 收到聊天响应:", request.data?.content?.slice(0, 80))
  }

  // RouterPark 聊天标签注册
  if (request.action === "registerChatTab") {
    if (sender.tab?.id) {
      routerParkTabId = sender.tab.id
      console.log("[Background] 注册聊天标签页:", routerParkTabId, request.url)
    }
    sendResponse({ success: true })
    return true
  }

  // 获取当前聊天标签页 ID
  if (request.action === "getChatTabId") {
    sendResponse({ tabId: routerParkTabId })
    return true
  }

  // 检查聊天标签页是否存活
  if (request.action === "pingChatTab") {
    if (routerParkTabId) {
      chrome.tabs.sendMessage(routerParkTabId, { action: "pingChatTab" }, (resp) => {
        sendResponse(resp || null)
      })
      return true // 异步
    }
    sendResponse(null)
    return true
  }

  // 手动清除聊天标签页注册
  if (request.action === "unregisterChatTab") {
    routerParkTabId = null
    sendResponse({ success: true })
    return true
  }
})

// 标签页关闭时自动清除注册
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === routerParkTabId) {
    console.log("[Background] 聊天标签页已关闭，清除注册")
    routerParkTabId = null
  }
})

// 检查更新
chrome.runtime.requestUpdateCheck(function (status, details) {
  if (status === "update_available") {
    console.log("有更新可用！版本" + details.version)
    // chrome.action.setBadgeBackgroundColor({ color: "#fc5430" })
    // chrome.action.setBadgeText({
    //   text: "升级"
    // })
    // chrome.runtime.reload()
  } else if (status === "no_update") {
    console.log("没有可用更新。")
  } else if (status === "throttled") {
    console.log("更新检查被限流。")
  }
})
