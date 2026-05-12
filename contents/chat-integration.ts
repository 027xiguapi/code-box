import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_end"
}

// ====== Types ======
interface ChatPayload {
  text?: string
  images?: string[]
  autoSend?: boolean
}

interface RouterParkMessage {
  type: "CHAT_INPUT" | "CHAT_SEND" | "CHAT_INSERT_IMAGE"
  payload: ChatPayload
}

interface RouterParkResponse {
  type: "CHAT_RESPONSE" | "CHAT_READY"
  payload?: {
    content: string
    timestamp: number
  }
}

// ====== Constants ======
const ROUTERPARK_ORIGIN = "https://routerpark.com"
const isRouterParkChat =
  typeof location !== "undefined" &&
  location.origin === ROUTERPARK_ORIGIN &&
  location.pathname.startsWith("/zh/chat")

// ====== RouterPark postMessage Integration ======
let routerParkReady = false
let pendingMessages: RouterParkMessage[] = []

function postToRouterPark(msg: RouterParkMessage) {
  window.postMessage(msg, ROUTERPARK_ORIGIN)
}

function flushPending() {
  if (!routerParkReady) return
  for (const msg of pendingMessages.splice(0)) {
    postToRouterPark(msg)
  }
}

async function ensureRouterParkReady(): Promise<boolean> {
  if (routerParkReady) return true
  // Wait up to 15s for CHAT_READY
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500))
    if (routerParkReady) return true
  }
  return false
}

// ====== Message Handlers (runs on ALL pages) ======

// Listen for messages from background/other content scripts via chrome.runtime
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[Chat Integration] 收到消息:", request?.action || request?.type)

  // Handle background-forwarded messages (only on routerpark tab)
  if (request.action === "sendToChat" || request.action === "forwardToChat") {
    if (isRouterParkChat) {
      handleRouterParkSend(request, sendResponse)
    } else {
      // Legacy: try iframe on current page
      sendMessageToChatViaIframe({
        type: request.autoSend ? "CHAT_SEND" : "CHAT_INPUT",
        payload: { text: request.text, autoSend: request.autoSend || false }
      })
      sendResponse({ success: true })
    }
    return true
  }

  if (request.action === "sendImageToChat") {
    if (isRouterParkChat) {
      handleRouterParkImage(request, sendResponse)
    } else {
      sendMessageToChatViaIframe({
        type: "CHAT_INSERT_IMAGE",
        payload: { images: request.images }
      })
      sendResponse({ success: true })
    }
    return true
  }

  if (request.action === "captureAndSend") {
    handleCaptureAndSend(request.prompt)
    sendResponse({ success: true })
    return true
  }

  // RouterPark registration acknowledgment
  if (request.action === "pingChatTab") {
    sendResponse({ ready: routerParkReady, isRouterParkChat })
    return true
  }
})

// Listen for postMessage from the page (CHAT_READY, CHAT_RESPONSE)
window.addEventListener("message", (event) => {
  // Only accept messages from our page
  if (event.origin !== ROUTERPARK_ORIGIN && event.origin !== window.location.origin) {
    return
  }

  const msg = event.data as RouterParkResponse
  if (!msg?.type) return

  switch (msg.type) {
    case "CHAT_READY":
      console.log("[Chat Integration] RouterPark 聊天页已就绪")
      routerParkReady = true
      flushPending()
      break

    case "CHAT_RESPONSE":
      console.log("[Chat Integration] 收到 AI 回复:", msg.payload?.content?.slice(0, 80))
      if (msg.payload) {
        // Forward to background
        chrome.runtime.sendMessage({
          action: "chatResponse",
          data: msg.payload
        })
      }
      break
  }
})

// ====== RouterPark API ======

async function handleRouterParkSend(
  request: any,
  sendResponse: (resp: any) => void
) {
  const msg: RouterParkMessage = {
    type: request.autoSend ? "CHAT_SEND" : "CHAT_INPUT",
    payload: {
      text: request.text,
      autoSend: request.autoSend || false
    }
  }

  if (!routerParkReady) {
    pendingMessages.push(msg)
    const ok = await ensureRouterParkReady()
    if (!ok) {
      console.warn("[Chat Integration] RouterPark 聊天页未就绪，消息未发送")
      sendResponse({ success: false, error: "Chat not ready" })
      return
    }
  }

  postToRouterPark(msg)
  sendResponse({ success: true })
}

async function handleRouterParkImage(
  request: any,
  sendResponse: (resp: any) => void
) {
  const msg: RouterParkMessage = {
    type: "CHAT_INSERT_IMAGE",
    payload: { images: request.images }
  }

  if (!routerParkReady) {
    pendingMessages.push(msg)
    const ok = await ensureRouterParkReady()
    if (!ok) {
      sendResponse({ success: false, error: "Chat not ready" })
      return
    }
  }

  postToRouterPark(msg)
  sendResponse({ success: true })
}

// ====== Legacy iframe fallback ======

function sendMessageToChatViaIframe(message: RouterParkMessage) {
  const chatWindow = findChatWindow()
  if (chatWindow) {
    chatWindow.postMessage(message, "*")
  } else {
    window.postMessage(message, "*")
  }
}

function findChatWindow(): Window | null {
  const chatIframe = document.querySelector(
    'iframe[src*="chat"], iframe[name="chat"]'
  ) as HTMLIFrameElement
  if (chatIframe?.contentWindow) return chatIframe.contentWindow

  for (const iframe of document.querySelectorAll("iframe")) {
    if (iframe.contentWindow) return iframe.contentWindow
  }

  return null
}

// ====== Capture ======

async function handleCaptureAndSend(prompt?: string) {
  try {
    const dataUrl = await chrome.runtime.sendMessage({ action: "captureVisibleTab" })
    if (!dataUrl) return

    if (isRouterParkChat) {
      const msg: RouterParkMessage = {
        type: "CHAT_INSERT_IMAGE",
        payload: { images: [dataUrl] }
      }
      if (!routerParkReady) pendingMessages.push(msg)
      else postToRouterPark(msg)

      if (prompt) {
        const textMsg: RouterParkMessage = {
          type: "CHAT_INPUT",
          payload: { text: prompt, autoSend: false }
        }
        setTimeout(() => {
          if (!routerParkReady) pendingMessages.push(textMsg)
          else postToRouterPark(textMsg)
        }, 300)
      }
    } else {
      sendMessageToChatViaIframe({
        type: "CHAT_INSERT_IMAGE",
        payload: { images: [dataUrl] }
      })
      if (prompt) {
        setTimeout(() => {
          sendMessageToChatViaIframe({
            type: "CHAT_INPUT",
            payload: { text: prompt, autoSend: false }
          })
        }, 100)
      }
    }
  } catch (error) {
    console.error("[Chat Integration] 截图失败:", error)
  }
}

// ====== Exported helpers (for other content scripts) ======

export function sendTextToChat(text: string, autoSend = false) {
  if (isRouterParkChat) {
    const msg: RouterParkMessage = {
      type: autoSend ? "CHAT_SEND" : "CHAT_INPUT",
      payload: { text, autoSend }
    }
    if (!routerParkReady) pendingMessages.push(msg)
    else postToRouterPark(msg)
  } else {
    sendMessageToChatViaIframe({
      type: autoSend ? "CHAT_SEND" : "CHAT_INPUT",
      payload: { text, autoSend }
    })
  }
}

export function sendImageToChat(images: string[]) {
  if (isRouterParkChat) {
    const msg: RouterParkMessage = {
      type: "CHAT_INSERT_IMAGE",
      payload: { images }
    }
    if (!routerParkReady) pendingMessages.push(msg)
    else postToRouterPark(msg)
  } else {
    sendMessageToChatViaIframe({
      type: "CHAT_INSERT_IMAGE",
      payload: { images }
    })
  }
}

// ====== Init ======

// Register as chat tab with background (for cross-tab forwarding)
if (isRouterParkChat) {
  // Notify background this tab can be used for chat
  chrome.runtime.sendMessage({
    action: "registerChatTab",
    url: location.href
  })

  // If page is already ready (SPA navigation), mark ready
  if (document.querySelector('[class*="chat"], [class*="message"], [class*="input"]')) {
    routerParkReady = true
  }

  console.log("[Chat Integration] RouterPark 模式已激活")
} else {
  console.log("[Chat Integration] Content script 已加载")
}
