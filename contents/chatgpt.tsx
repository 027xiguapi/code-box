import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*", "https://chatgpt.com/c/*"]
}

export default function Chatgpt() {
  const [content, setContent] = useStorage({
    key: "chatgpt-content",
    instance: new Storage({
      area: "local"
    })
  })

  useEffect(() => {
    if (content) {
      init()
    }
  }, [content])

  function init() {
    const targetNode = document.querySelector("#composer-background")
    const observerOptions = { childList: true, subtree: true }

    // 创建 MutationObserver 实例
    const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
          // 这里可以判断你想要的元素是否被添加到页面
          if (document.querySelector("._prosemirror-parent_cy42l_1 p")) {
            console.log("DOM元素加载完成", content)
            const post = document.querySelector(
              "._prosemirror-parent_cy42l_1 p"
            ) as HTMLElement

            const button = document.querySelector(
              "button[data-testid=send-button]"
            ) as HTMLElement

            post.innerText = content
            button.click()
            observer.disconnect() // 监听完成后可以断开
          }
        }
      }
    })

    // 启动监听
    observer.observe(targetNode, observerOptions)
  }

  return <div style={{ display: "none" }}></div>
}
