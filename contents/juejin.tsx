import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"

import { useMessage } from "@plasmohq/messaging/hook"

import { Readability } from "~node_modules/@mozilla/readability"
import {
  getMetaContentByProperty,
  saveHtml,
  saveMarkdown,
  setIcon
} from "~tools"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.juejin.cn/*"]
}

const turndownService = Turndown()
const documentClone = document.cloneNode(true)
const article = new Readability(documentClone as Document, {}).parse()
const articleUrl = window.location.href
const author = article.byline ?? ""
const authorLink = getMetaContentByProperty("article:author")
const domain = window.location.hostname

export default function Custom() {
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
    saveMarkdown(markdown, article.title)
  }

  function downloadHtml() {
    const dom = document.querySelector("article.article")
    saveHtml(dom, article.title)
  }

  return <div style={{ display: "none" }}></div>
}
