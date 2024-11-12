import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import { addCss, saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.baidu.com/*"]
}

const turndownService = Turndown()
const articleTitle = document.querySelector<HTMLElement>("head title").innerText

export default function Custom() {
  const [cssCode, runCss] = useCssCodeHook("baidu")
  const [closeAIBox] = useStorage<boolean>("baidu-closeAIBox")
  const [closeLog] = useStorage("config-closeLog", true)
  const [content, setContent] = useContent()

  useEffect(() => {
    closeLog || console.log("baidu", { closeAIBox })
    closeAIBox && closeAIBoxFunc()
  }, [closeAIBox])

  useMessage(async (req, res) => {
    if (req.name == "baidu-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "baidu-editMarkdown") {
      setContent(".wd-ai-index-pc")
    }
    if (req.name == "baidu-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "baidu-downloadHtml") {
      downloadHtml()
    }
  })

  /* 删除百度AI对话框 */
  function closeAIBoxFunc() {
    addCss(`.wd-ai-index-pc{
      display:none !important;
    }`)
  }

  function editMarkdown() {
    const html = document.querySelector("article.article")
    const markdown = turndownService.turndown(html)
    setContent(markdown)
    window.open("https://md.randbox.top", "_blank")
  }

  function downloadMarkdown() {
    const html = document.querySelector(".wd-ai-index-pc")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector(".wd-ai-index-pc")
    saveHtml(dom, articleTitle)
  }

  return <div style={{ display: "none" }}></div>
}
