import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { addCss, setIcon } from "~tools"

export const config: PlasmoCSConfig = {
  matches: ["https://*.jianshu.com/*"]
}

window.addEventListener("load", () => {
  console.log("简书加载完成，执行代码")
})

export default function Jianshu() {
  const [closeLoginModal] = useStorage<boolean>("jianshu-closeLoginModal")
  const [copyCode] = useStorage<boolean>("jianshu-copyCode")
  const [autoOpenCode] = useStorage<boolean>("jianshu-autoOpenCode")

  useEffect(() => {
    console.log("jianshu status", { copyCode, closeLoginModal, autoOpenCode })
    copyCode && copyCodeFunc()
    closeLoginModal && closeLoginModalFunc()
    autoOpenCode && autoOpenCodeFunc()
    setIcon((closeLoginModal || copyCode || autoOpenCode))
  }, [copyCode, closeLoginModal, autoOpenCode])

  // 一键复制
  function copyCodeFunc() {
    const codes = document.querySelectorAll<HTMLElement>(".hljs")

    codes.forEach((code) => {
      const button = document.createElement("button")
      button.innerText = "复制"
      button.style.position = "absolute"
      button.style.top = "0"
      button.style.right = "0"
      button.style.background = "#fff"
      button.title = "一键复制代码"
      button.classList.add("Button")
      button.classList.add("VoteButton")

      code.appendChild(button)
      code.style.position = "relative"

      button.addEventListener("click", (e) => {
        const target = e.target as HTMLElement
        const parentPreBlock = target.closest(".hljs")
        const codeBlock = parentPreBlock.querySelector<HTMLElement>("code")

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
    addCss(`.hide{ display:none !important; }`)
    let openAppModal = document.querySelector(".open-app-modal")
    if (openAppModal) {
      const dialog = openAppModal.closest("div[class^='dialog-']") as HTMLElement
      const className = dialog.className
      addCss(`.download-app-guidance,.${className} { display:none !important; }`)
    } else {
      setTimeout(() => {
        openAppModal = document.querySelector("div[class*='-mask']")
        const dialog = openAppModal.parentNode as HTMLElement

        dialog.classList.add('hide');
      }, 500)
    }


  }

  // 自动展开全文
  function autoOpenCodeFunc() {
    const tips = document.querySelector(".collapse-tips")
    if (tips) {
      const css = `
        .collapse-free-content{
          height: auto !important;
        }
        .collapse-tips {
          display: none !important;
        }`
      addCss(css)
    }
  }

  return <div style={{ display: "none" }}></div>
}
