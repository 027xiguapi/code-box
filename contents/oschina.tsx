import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchor,
  PlasmoGetShadowHostId,
  PlasmoGetStyle
} from "plasmo"
import React, { type FC } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/dist/hook"

import TagBtnStyle from "~component/tagBtn/style"
import ToolBox from "~component/ui/toolBox"
import { saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useEditMarkdown } from "~utils/editMarkdownHook"
import { useParseMarkdown } from "~utils/parseMarkdownHook"
import { Print } from "~utils/print"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.oschina.net/*"]
}

const turndownService = Turndown()
const articleTitle = document
  .querySelector<HTMLElement>("head title")
  .innerText.trim()

const HOST_ID = "codebox-oschina"
export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector(".blog-detail-container") ||
  document.querySelector(".news-detail-container")

export const getStyle: PlasmoGetStyle = () => TagBtnStyle()

const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [parseContent, setParseContent] = useParseMarkdown()
  const [allShowTag, setAllShowTag] = useStorage("config-allShowTag", true)
  const [showTag, setShowTag] = useStorage<boolean>("oschina-showTag", true)
  const [cssCode, runCss] = useCssCodeHook("oschina")
  const [content, setContent] = useEditMarkdown()

  useMessage(async (req, res) => {
    if (req.name == "oschina-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "oschina-editMarkdown") {
      editMarkdown()
    }
    if (req.name == "oschina-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "oschina-downloadHtml") {
      downloadHtml()
    }
    if (req.name == "oschina-downloadPdf") {
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
    const article = document.querySelector<HTMLElement>(".article-box")
    if (article) {
      Print.print(article, { title: articleTitle })
        .then(() => console.log("Printing complete"))
        .catch((error) => console.error("Printing failed:", error))
    }
  }

  function editMarkdown() {
    const dom = document.querySelector(".article-box")
    setContent(dom, articleTitle)
  }

  function downloadMarkdown() {
    const html = document.querySelector(".article-box")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector(".article-box")
    saveHtml(dom, articleTitle)
  }

  function parseMarkdown() {
    const dom = document.querySelector(".article-box")
    setParseContent(dom)
  }

  return showTag && allShowTag ? (
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
