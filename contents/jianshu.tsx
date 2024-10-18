import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import { addCss, saveHtml, saveMarkdown, setIcon } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.jianshu.com/*"]
}

const turndownService = Turndown()
const articleTitle = document.querySelector<HTMLElement>("head title").innerText

export default function Jianshu() {
  const [cssCode, runCss] = useCssCodeHook("jianshu")
  const [closeLoginModal] = useStorage<boolean>("jianshu-closeLoginModal")
  const [autoOpenCode] = useStorage<boolean>("jianshu-autoOpenCode")
  const [closeLog] = useStorage("config-closeLog", true)
  const [content, setContent] = useContent()

  useEffect(() => {
    closeLog || console.log("jianshu status", { closeLoginModal, autoOpenCode })
    closeLoginModal && closeLoginModalFunc()
    autoOpenCode && autoOpenCodeFunc()
    setIcon(true)
  }, [closeLoginModal, autoOpenCode])

  useMessage(async (req, res) => {
    if (req.name == "jianshu-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "jianshu-editMarkdown") {
      setContent("section.ouvJEz")
    }
    if (req.name == "jianshu-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "jianshu-downloadHtml") {
      downloadHtml()
    }
  })

  // 隐藏登录弹窗
  function closeLoginModalFunc() {
    addCss(
      `.hide,
      ._23ISFX-wrap,
      ._23ISFX-mask{ 
        display:none !important; 
      }
      body {
        overflow: unset !important;
      }`
    )
    let openAppModal = document.querySelector(".open-app-modal")
    if (openAppModal) {
      const dialog = openAppModal.closest(
        "div[class^='dialog-']"
      ) as HTMLElement
      const className = dialog.className
      addCss(
        `.download-app-guidance,.${className} { display:none !important; }`
      )
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

  function downloadMarkdown() {
    const html = document.querySelector("section.ouvJEz")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector("section.ouvJEz")
    saveHtml(dom, articleTitle)
  }

  return <div style={{ display: "none" }}></div>
}
