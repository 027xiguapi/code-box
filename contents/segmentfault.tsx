import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"

import { useMessage } from "@plasmohq/messaging/hook"

import { saveHtml, saveMarkdown, setIcon } from "~tools"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.segmentfault.com/*"]
}

const turndownService = Turndown()
const articleTitle = document.querySelector<HTMLElement>("head title").innerText

export default function Segmentfault() {
  const [content, setContent] = useContent()

  useEffect(() => {
    setIcon(true)
  }, [])

  useMessage(async (req, res) => {
    if (req.name == "segmentfault-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "segmentfault-editMarkdown") {
      setContent("article.article")
    }
    if (req.name == "segmentfault-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "segmentfault-downloadHtml") {
      downloadHtml()
    }
  })

  function downloadMarkdown() {
    const html = document.querySelector("article.article")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector("article.article")
    saveHtml(dom, articleTitle)
  }

  return <div style={{ display: "none" }}></div>
}
