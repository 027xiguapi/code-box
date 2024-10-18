import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/dist/hook"

import { saveHtml, saveMarkdown, setIcon } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.weixin.qq.com/*"]
}

const turndownService = Turndown()
const articleTitle = document.querySelector<HTMLElement>("head title").innerText

export default function Weixin() {
  const [cssCode, runCss] = useCssCodeHook("weixin")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [content, setContent] = useContent()

  useEffect(() => {
    setIcon(true)
  }, [])

  useMessage(async (req, res) => {
    if (req.name == "weixin-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "weixin-editMarkdown") {
      setContent("#img-content")
    }
    if (req.name == "weixin-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "weixin-downloadHtml") {
      downloadHtml()
    }
  })

  function downloadMarkdown() {
    const html = document.querySelector("#img-content")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector("#img-content")
    saveHtml(dom, articleTitle)
  }

  return <div style={{ display: "none" }}></div>
}
