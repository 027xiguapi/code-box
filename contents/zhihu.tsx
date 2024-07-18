import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { addCss } from "~tools"

export const config: PlasmoCSConfig = {
  matches: ["https://*.zhihu.com/*"]
}

window.addEventListener("load", () => {
  console.log("知乎加载完成，执行代码")
})

export default function zhihu() {
  const [closeLoginModal] = useStorage<boolean>("zhihu-closeLoginModal")
  const [copyCode] = useStorage<boolean>("zhihu-copyCode")
  const [autoOpenCode] = useStorage<boolean>("zhihu-autoOpenCode")

  useEffect(() => {
    console.log("zhihu copyCode", copyCode)
    copyCode && copyCodeFunc()
  }, [copyCode])

  useEffect(() => {
    console.log("zhihu closeLoginModal", closeLoginModal)
    closeLoginModal && closeLoginModalFunc()
  }, [closeLoginModal])

  useEffect(() => {
    console.log("CSDN autoOpenCode", autoOpenCode)
    autoOpenCode && autoOpenCodeFunc()
  }, [autoOpenCode])

  // 功能一： 修改复制按钮，支持一键复制
  function copyCodeFunc() {
    const codes = document.querySelectorAll<HTMLElement>(
      ".RichContent .highlight"
    )

    codes.forEach((code) => {
      const button = document.createElement("button")
      button.innerText = "复制"
      button.style.position = "absolute"
      button.style.top = "0"
      button.style.right = "0"
      button.title = "一键复制代码"
      button.classList.add("Button")
      button.classList.add("VoteButton")

      code.appendChild(button)
      code.style.position = "relative"

      button.addEventListener("click", (e) => {
        // 实现复制
        const target = e.target as HTMLElement
        const parentPreBlock = target.closest(".highlight")
        const codeBlock = parentPreBlock.querySelector<HTMLElement>("pre")

        navigator.clipboard.writeText(codeBlock.innerText)

        target.innerText = "复制成功"
        setTimeout(() => {
          target.innerText = "复制"
        }, 1000)
        e.stopPropagation()
        e.preventDefault()
      })
    })
  }

  // 隐藏登录弹窗
  function closeLoginModalFunc() {
    addCss(`
    .Modal-wrapper--transparent,
    .Modal-enter-done{
      display:none !important;
    }`)
    const element = document.querySelector("html")
    element.style.overflow = "auto"
    element.style.margin = "0px"
  }

  // 自动展开全文
  function autoOpenCodeFunc(element?) {
    element || (element = document)
    const expandButtons = element.querySelectorAll(".ContentItem-expandButton")
    console.log("expandButtons", expandButtons)
    if (expandButtons.length) {
      expandButtons.forEach((button) => {
        const parent = button.parentElement
        if (!element.classList) {
          if (parent.classList.contains("RichContent")) {
            const collapsed = parent.querySelector(
              ".RichContent-inner--collapsed"
            )
            collapsed.style.maxHeight = "unset"
            autoOpenCodeFunc(parent)
          } else {
            parent.style.display = "none"
          }
        }
        button.style.display = "none"
      })
    }
  }

  return <div style={{ display: "none" }}></div>
}
