// 聊天集成工具函数

/**
 * 发送文本到聊天应用
 * @param text 要发送的文本
 * @param autoSend 是否自动发送（true）或仅插入（false）
 */
export async function sendTextToChat(text: string, autoSend = false) {
  try {
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
      return { success: true }
    }
    return { success: false, error: "No active tab" }
  } catch (error) {
    console.error("[Chat Integration] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * 发送图片到聊天应用
 * @param images Base64 格式的图片数组
 */
export async function sendImageToChat(images: string[]) {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    if (tab.id) {
      await chrome.tabs.sendMessage(tab.id, {
        action: "sendImageToChat",
        images
      })
      return { success: true }
    }
    return { success: false, error: "No active tab" }
  } catch (error) {
    console.error("[Chat Integration] Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * 截图并发送到聊天
 * @param prompt 可选的提示文本
 */
export async function captureAndSendToChat(prompt?: string) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: "png"
    })

    await sendImageToChat([dataUrl])

    if (prompt) {
      setTimeout(() => {
        sendTextToChat(prompt, false)
      }, 100)
    }

    return { success: true }
  } catch (error) {
    console.error("[Chat Integration] Capture error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * 翻译选中的文本
 * @param text 要翻译的文本
 * @param targetLang 目标语言（默认中文）
 */
export async function translateText(text: string, targetLang = "中文") {
  return sendTextToChat(`请将以下文本翻译成${targetLang}：\n\n${text}`, true)
}

/**
 * 解释代码
 * @param code 代码内容
 * @param language 编程语言（可选）
 */
export async function explainCode(code: string, language?: string) {
  const langPrefix = language ? ` ${language}` : ""
  return sendTextToChat(
    `请解释以下${langPrefix}代码：\n\n\`\`\`${language || ""}\n${code}\n\`\`\``,
    true
  )
}

/**
 * 总结内容
 * @param content 要总结的内容
 */
export async function summarizeContent(content: string) {
  return sendTextToChat(`请帮我总结以下内容：\n\n${content}`, true)
}

/**
 * 从 URL 下载图片并转换为 Base64
 * @param imageUrl 图片 URL
 */
export async function downloadImageAsBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error("[Chat Integration] Download image error:", error)
    throw error
  }
}

/**
 * 检测页面中的代码块并添加"解释代码"按钮
 */
export function addExplainButtonsToCodeBlocks() {
  const codeBlocks = document.querySelectorAll("pre code")

  codeBlocks.forEach((block) => {
    // 避免重复添加按钮
    if (block.parentElement?.querySelector(".codebox-explain-btn")) {
      return
    }

    const button = document.createElement("button")
    button.textContent = "💬 解释代码"
    button.className = "codebox-explain-btn"
    button.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 4px 8px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      z-index: 1000;
    `

    button.onclick = async () => {
      const code = block.textContent || ""
      const language = block.className.replace("language-", "")
      await explainCode(code, language)
    }

    // 确保 pre 元素有相对定位
    if (block.parentElement) {
      block.parentElement.style.position = "relative"
      block.parentElement.insertBefore(button, block)
    }
  })
}
