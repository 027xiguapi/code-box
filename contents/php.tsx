import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import { addCss, saveHtml, saveMarkdown, setIcon } from "~tools"
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
  const [closeLoginModal] = useStorage<boolean>("php-closeLoginModal")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [closeLog] = useStorage("config-closeLog", true)
  const [content, setContent] = useContent()

  useEffect(() => {
    closeLog || console.log("PHP status", { closeLoginModal })
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
