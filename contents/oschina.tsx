import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"

import { useMessage } from "@plasmohq/messaging/hook"

import { saveHtml, saveMarkdown, setIcon } from "~tools"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.oschina.net/*"]
}

const turndownService = Turndown()
const articleTitle = document.querySelector<HTMLElement>("head title").innerText

export default function Oschina() {
  const [content, setContent] = useContent()

  useEffect(() => {
    setIcon(true)
  }, [])

  useMessage(async (req, res) => {
    if (req.name == "oschina-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "oschina-editMarkdown") {
      setContent(".article-box")
    }
    if (req.name == "oschina-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "oschina-downloadHtml") {
      downloadHtml()
    }
  })

  function downloadMarkdown() {
    const html = document.querySelector(".article-box")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector(".article-box")
    saveHtml(dom, articleTitle)
  }

  return <div style={{ display: "none" }}></div>
}
