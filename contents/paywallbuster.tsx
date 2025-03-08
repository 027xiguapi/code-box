import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchorList,
  PlasmoGetShadowHostId
} from "plasmo"
import React, { type FC } from "react"

import { useMessage } from "@plasmohq/messaging/dist/hook"
import { useStorage } from "@plasmohq/storage/dist/hook"

import ToolBox from "~component/ui/toolBox"
import { i18n, saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useEditMarkdown } from "~utils/editMarkdownHook"
import { useParseMarkdown } from "~utils/parseMarkdownHook"
import { Print } from "~utils/print"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://paywallbuster.com/articles/*"]
}

const turndownService = Turndown()
const articleTitle = document
  .querySelector<HTMLElement>("head title")
  .innerText.trim()

export const getShadowHostId: PlasmoGetShadowHostId = () =>
  "codebox-paywallbuster"

const PlasmoOverlay: FC<PlasmoCSUIProps> = () => {
  const [parseContent, setParseContent] = useParseMarkdown()
  const [showTag, setShowTag] = useStorage<boolean>(
    "paywallbuster-showTag",
    true
  )
  const [cssCode, runCss] = useCssCodeHook("paywallbuster")
  const [content, setContent] = useEditMarkdown()

  useMessage(async (req, res) => {
    if (req.name == "paywallbuster-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "paywallbuster-editMarkdown") {
      editMarkdown()
    }
    if (req.name == "paywallbuster-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "paywallbuster-downloadHtml") {
      downloadHtml()
    }
    if (req.name == "paywallbuster-downloadPdf") {
      downloadPdf()
    }
  })

  function getDescription() {
    const summary = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    ).content
    summary && prompt("文章摘要：", summary)
  }

  function downloadPdf() {
    const article = document.querySelector<HTMLElement>("article")
    if (article) {
      Print.print(article, { title: articleTitle })
        .then(() => console.log("Printing complete"))
        .catch((error) => console.error("Printing failed:", error))
    }
  }

  function editMarkdown() {
    const dom = document.querySelector("article")
    setContent(dom, articleTitle)
  }

  function downloadMarkdown() {
    const html = document.querySelector("article")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector("article")
    saveHtml(dom, articleTitle)
  }

  function parseMarkdown() {
    const dom = document.querySelector("article")
    setParseContent(dom)
  }

  return showTag ? (
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
