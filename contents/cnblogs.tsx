import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import { saveHtml, saveMarkdown, setIcon } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.cnblogs.com/*"],
  all_frames: true
}

const turndownService = Turndown()
const articleTitle = document.querySelector<HTMLElement>("head title").innerText

export default function cnblogs() {
  const [cssCode, runCss] = useCssCodeHook("cnblogs")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [closeLog] = useStorage("config-closeLog", true)
  const [content, setContent] = useContent()

  useEffect(() => {
    setIcon(true)
  }, [])

  useMessage(async (req, res) => {
    if (req.name == "cnblogs-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "cnblogs-editMarkdown") {
      setContent("article.article")
    }
    if (req.name == "cnblogs-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "cnblogs-downloadHtml") {
      downloadHtml()
    }
  })

  function downloadMarkdown() {
    const html = document.querySelector("#post_detail")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector("#post_detail")
    saveHtml(dom, articleTitle)
  }

  return <div style={{ display: "none" }}></div>
}
