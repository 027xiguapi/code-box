import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetShadowHostId
} from "plasmo"
import { useEffect, useState, type FC } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import ToolBox from "~component/ui/toolBox"
import { addCss, saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useEditMarkdown } from "~utils/editMarkdownHook"
import { useParseMarkdown } from "~utils/parseMarkdownHook"
import { Print } from "~utils/print"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://baijiahao.baidu.com/*", "https://www.baidu.com/*"]
}

const turndownService = Turndown()
const articleTitle = document
  .querySelector<HTMLElement>("head title")
  .innerText.trim()

export const getShadowHostId: PlasmoGetShadowHostId = () => "codebox-baidu"
const isBaijiahao = location.hostname.includes("baijiahao")
const PlasmoOverlay: FC<PlasmoCSUIProps> = () => {
  const [parseContent, setParseContent] = useParseMarkdown()
  const [showTag, setShowTag] = useStorage<boolean>("baidu-showTag", true)
  const [cssCode, runCss] = useCssCodeHook("baidu")
  const [closeAIBox] = useStorage<boolean>("baidu-closeAIBox")
  const [closeLog] = useStorage("config-closeLog", true)
  const [content, setContent] = useEditMarkdown()

  useEffect(() => {
    closeLog || console.log("baidu", { closeAIBox })
    closeAIBox && closeAIBoxFunc()
  }, [closeAIBox])

  useMessage(async (req, res) => {
    if (req.name == "baidu-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "baidu-editMarkdown") {
      editMarkdown()
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

  function getDescription() {
    const summary = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    ).content
    summary && prompt("文章摘要：", summary)
  }

  function downloadPdf() {
    const article = document.querySelector<HTMLElement>(
      isBaijiahao ? "#ssr-content .EaCvy" : ".wd-ai-index-pc"
    )
    if (article) {
      Print.print(article, { title: articleTitle })
        .then(() => console.log("Printing complete"))
        .catch((error) => console.error("Printing failed:", error))
    }
  }

  function editMarkdown() {
    const dom = document.querySelector(
      isBaijiahao ? "#ssr-content .EaCvy" : ".wd-ai-index-pc"
    )
    setContent(dom, articleTitle)
  }

  function downloadMarkdown() {
    const html = document.querySelector(
      isBaijiahao ? "#ssr-content .EaCvy" : ".wd-ai-index-pc"
    )
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector(
      isBaijiahao ? "#ssr-content .EaCvy" : ".wd-ai-index-pc"
    )
    saveHtml(dom, articleTitle)
  }

  function parseMarkdown() {
    const dom = document.querySelector<HTMLElement>(
      isBaijiahao ? "#ssr-content .EaCvy" : ".wd-ai-index-pc"
    )
    setParseContent(dom)
  }

  return showTag && isBaijiahao ? (
    <ToolBox
      onGetDescription={getDescription}
      onEditMarkdown={editMarkdown}
      onDownloadMarkdown={downloadMarkdown}
      onPrint={downloadPdf}
      onParseMarkdown={parseMarkdown}
    />
  ) : (
    <></>
  )
}

export default PlasmoOverlay
