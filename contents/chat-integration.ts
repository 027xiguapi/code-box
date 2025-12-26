import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_end"
}

// 消息类型定义
interface ExtensionMessage {
  type: "CHAT_INPUT" | "CHAT_SEND" | "CHAT_INSERT_IMAGE"
  payload: {
    text?: string
    images?: string[]
    autoSend?: boolean
  }
}

interface ChatResponse {
  type: "CHAT_RESPONSE"
  payload: {
    content: string
    timestamp: number
  }
}

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[Chat Integration] 收到消息:", request)

  if (request.action === "sendToChat") {
    sendMessageToChat({
      type: request.autoSend ? "CHAT_SEND" : "CHAT_INPUT",
      payload: {
        text: request.text,
        autoSend: request.autoSend || false
      }
    })
    sendResponse({ success: true })
    return true
  }

  if (request.action === "sendImageToChat") {
    sendMessageToChat({
      type: "CHAT_INSERT_IMAGE",
      payload: {
        images: request.images
      }
    })
    sendResponse({ success: true })
    return true
  }

  if (request.action === "captureAndSend") {
    // 截图并发送到聊天
    captureAndSendToChat(request.prompt)
    sendResponse({ success: true })
    return true
  }
})

// 发送消息到聊天应用
function sendMessageToChat(message: ExtensionMessage) {
  // 尝试查找聊天应用的 iframe 或窗口
  const chatWindow = findChatWindow()

  if (chatWindow) {
    console.log("[Chat Integration] 发送消息到聊天应用:", message)
    chatWindow.postMessage(message, "*")
  } else {
    console.warn("[Chat Integration] 未找到聊天应用窗口")
    // 如果没有找到 iframe，直接在当前窗口发送
    window.postMessage(message, "*")
  }
}

// 查找聊天应用窗口
function findChatWindow(): Window | null {
  // 检查是否有特定的 iframe
  const chatIframe = document.querySelector(
    'iframe[src*="chat"], iframe[name="chat"]'
  ) as HTMLIFrameElement

  if (chatIframe && chatIframe.contentWindow) {
    return chatIframe.contentWindow
  }

  // 检查所有 iframe
  const iframes = document.querySelectorAll("iframe")
  for (const iframe of iframes) {
    if (iframe.contentWindow) {
      return iframe.contentWindow
    }
  }

  // 如果没有 iframe，返回当前窗口
  return window
}

// 监听来自聊天应用的响应
window.addEventListener("message", (event) => {
  if (event.data.type === "CHAT_RESPONSE") {
    console.log("[Chat Integration] 收到 AI 回复:", event.data.payload.content)

    // 将响应发送回 background
    chrome.runtime.sendMessage({
      action: "chatResponse",
      data: event.data.payload
    })
  }

  if (event.data.type === "CHAT_READY") {
    console.log("[Chat Integration] 聊天应用已就绪")
  }
})

// 截图并发送到聊天
async function captureAndSendToChat(prompt?: string) {
  try {
    // 使用 Chrome API 截图
    const dataUrl = await chrome.runtime.sendMessage({
      action: "captureVisibleTab"
    })

    if (dataUrl) {
      // 发送图片到聊天
      sendMessageToChat({
        type: "CHAT_INSERT_IMAGE",
        payload: {
          images: [dataUrl]
        }
      })

      // 如果有提示文本，也发送
      if (prompt) {
        setTimeout(() => {
          sendMessageToChat({
            type: "CHAT_INPUT",
            payload: {
              text: prompt,
              autoSend: false
            }
          })
        }, 100)
      }
    }
  } catch (error) {
    console.error("[Chat Integration] 截图失败:", error)
  }
}

// 导出工具函数供其他 content scripts 使用
export function sendTextToChat(text: string, autoSend = false) {
  sendMessageToChat({
    type: autoSend ? "CHAT_SEND" : "CHAT_INPUT",
    payload: {
      text,
      autoSend
    }
  })
}

export function sendImageToChat(images: string[]) {
  sendMessageToChat({
    type: "CHAT_INSERT_IMAGE",
    payload: {
      images
    }
  })
}

console.log("[Chat Integration] Content script 已加载")
