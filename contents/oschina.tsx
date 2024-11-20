import type { PlasmoCSConfig } from "plasmo"

import { useMessage } from "@plasmohq/messaging/hook"

import { saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { savePdf } from "~utils/downloadPdf"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.oschina.net/*"]
}

const turndownService = Turndown()
const articleTitle = document
  .querySelector<HTMLElement>("head title")
  .innerText.trim()

export default function Oschina() {
  const [cssCode, runCss] = useCssCodeHook("oschina")
  const [content, setContent] = useContent()

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
    if (req.name == "oschina-downloadPdf") {
      var article = document.querySelector<HTMLElement>(".article-box")
      savePdf(article, articleTitle)
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
