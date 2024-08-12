import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

import { useStorage } from "@plasmohq/storage/hook"

import { addCss, setIcon } from "~tools"

export const config: PlasmoCSConfig = {
  matches: ["https://*.51cto.com/*"]
}

export default function Cto51() {
  const [copyCode] = useStorage<boolean>("51cto-copyCode")
  const [closeLoginModal] = useStorage<boolean>("51cto-closeLoginModal")
  const [history, setHistory] = useStorage<any[]>("codebox-history")

  useEffect(() => {
    console.log("51CTO status", { closeLoginModal, copyCode })
    setTimeout(() => {
      copyCode && copyCodeFunc()
    }, 500)
    closeLoginModal && closeLoginModalFunc()
    setIcon(copyCode || closeLoginModal)
  }, [copyCode, closeLoginModal])

  /* 未登录复制代码 */
  function copyCodeCssFunc() {
    addCss(`
    article .hljs-cto,
    article{
      -webkit-touch-callout: auto !important;
      -webkit-user-select: auto !important;
      -khtml-user-select: auto !important;
      -moz-user-select: auto !important;
      -ms-user-select: auto !important;
      user-select: auto !important;
    }`)
  }

  function copyCodeFunc() {
    copyCodeCssFunc()
    // 内容区开启复制
    const content_views = document.querySelector("article")
    content_views && content_views.replaceWith(content_views.cloneNode(true))

    // 功能一： 修改复制按钮，支持一键复制
    const buttons = document.querySelectorAll<HTMLElement>(
      ".hljs-cto .copy_btn"
    )

    if (buttons.length > 0) {
      buttons.forEach((btn) => {
        btn.innerText = "复制"
        btn.setAttribute("onclick", "")
        const elClone = btn.cloneNode(true)

        btn.parentNode.replaceChild(elClone, btn)
        elClone.addEventListener("click", (e) => {
          const target = e.target as HTMLElement
          const parentPreBlock = target.closest(".hljs-cto")
          const codeBlock = parentPreBlock.querySelector<HTMLElement>("pre")
          const codeIndex =
            codeBlock.querySelector<HTMLElement>(".pre-numbering")
          codeBlock.removeChild(codeIndex)

          navigator.clipboard.writeText(codeBlock.innerText)
          setHistory((prevData) =>
            prevData
              ? [
                  {
                    id: uuidv4(),
                    value: codeBlock.innerText,
                    createdAt: new Date(),
                    from: "CSDN",
                    link: location.href,
                    tags: [],
                    remark: ""
                  },
                  ...prevData
                ]
              : [
                  {
                    id: uuidv4(),
                    value: codeBlock.innerText,
                    createdAt: new Date(),
                    from: "CSDN",
                    link: location.href,
                    tags: [],
                    remark: ""
                  }
                ]
          )
          target.innerText = "复制成功"
          setTimeout(() => {
            target.innerText = "复制"
          }, 1000)
          e.stopPropagation()
          e.preventDefault()
        })
      })
    } else {
      const codes = document.querySelectorAll<HTMLElement>(
        "article .has-pre-numbering"
      )

      codes.forEach((code) => {
        const codeBlock = code.closest("div")
        const button = document.createElement("button")

        button.innerText = "复制"
        button.style.position = "absolute"
        button.style.top = "0"
        button.style.right = "0"
        button.title = "一键复制代码"
        button.classList.add("Button")
        button.classList.add("VoteButton")
        codeBlock.appendChild(button)
        codeBlock.style.position = "relative"

        const codeIndex = codeBlock.querySelector<HTMLElement>(".pre-numbering")
        code.removeChild(codeIndex)

        button.addEventListener("click", (e) => {
          const target = e.target as HTMLElement

          navigator.clipboard.writeText(code.innerText)
          setHistory((prevData) =>
            prevData
              ? [
                  {
                    id: uuidv4(),
                    value: codeBlock.innerText,
                    createdAt: new Date(),
                    from: "51CTO",
                    link: location.href,
                    tags: [],
                    remark: ""
                  },
                  ...prevData
                ]
              : [
                  {
                    id: uuidv4(),
                    value: codeBlock.innerText,
                    createdAt: new Date(),
                    from: "51CTO",
                    link: location.href,
                    tags: [],
                    remark: ""
                  }
                ]
          )
          target.innerText = "复制成功"
          setTimeout(() => {
            target.innerText = "复制"
          }, 1000)
          e.stopPropagation()
          e.preventDefault()
        })
      })
    }
  }

  // 关闭登录弹框
  function closeLoginModalFunc() {
    const css = `
    #login_iframe_mask {
      display:none !important;
    }`
    addCss(css)
  }

  return <div style={{ display: "none" }}></div>
}
