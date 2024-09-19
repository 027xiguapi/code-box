import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"

import { useMessage } from "@plasmohq/messaging/hook"

import { saveHtml, saveMarkdown, setIcon } from "~tools"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.juejin.cn/*"]
}

const turndownService = Turndown()
const articleTitle = document.querySelector<HTMLElement>("head title").innerText

export default function Juejin() {
  useEffect(() => {
    setIcon(true)
  }, [])

  useMessage(async (req, res) => {
    if (req.name == "juejin-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "juejin-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "juejin-downloadHtml") {
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