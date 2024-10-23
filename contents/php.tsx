import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import { addCss, removeCss, saveHtml, saveMarkdown, setIcon } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.php.cn/*"]
}

const turndownService = Turndown()
const articleTitle = document.querySelector<HTMLElement>("head title").innerText

export default function Php() {
  const [cssCode, runCss] = useCssCodeHook("php")
  const [copyCode] = useStorage<boolean>("php-copyCode")
  const [closeLoginModal] = useStorage<boolean>("php-closeLoginModal")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [closeLog] = useStorage("config-closeLog", true)
  const [content, setContent] = useContent()

  useEffect(() => {
    closeLog || console.log("PHP status", { closeLoginModal })
    copyCodeFunc(copyCode)
    closeLoginModal && closeLoginModalFunc()
    setIcon(true)
  }, [closeLoginModal])

  useMessage(async (req, res) => {
    if (req.name == "php-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "php-editMarkdown") {
      setContent(".phpscMain .php-article")
    }
    if (req.name == "php-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "php-downloadHtml") {
      downloadHtml()
    }
  })

  /* 未登录复制代码 */
  function copyCodeCssFunc(copyCode) {
    copyCode
      ? addCss(
          `
    .php-article .code,
    .php-article{
      -webkit-touch-callout: auto !important;
      -webkit-user-select: auto !important;
      -khtml-user-select: auto !important;
      -moz-user-select: auto !important;
      -ms-user-select: auto !important;
      user-select: auto !important;
    }`,
          `php-copyCode-css`
        )
      : removeCss(`php-copyCode-css`)
  }

  function copyCodeFunc(copyCode) {
    copyCode &&
      document.addEventListener("copy", function (event) {
        const selectedText = window.getSelection().toString()
        event.clipboardData.setData("text/plain", selectedText)
        event.preventDefault()
      })
    copyCodeCssFunc(copyCode)
  }

  // 关闭登录弹框
  function closeLoginModalFunc() {
    const css = `
    .layui-layer-shade,
    .layui-layer-iframe {
      display:none !important;
    }`
    addCss(css)
  }

  function downloadMarkdown() {
    const html = document.querySelector(".phpscMain .php-article")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector(".phpscMain .php-article")
    saveHtml(dom, articleTitle)
  }

  return <div style={{ display: "none" }}></div>
}
