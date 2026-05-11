import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetShadowHostId
} from "plasmo"
import React, { type FC } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/dist/hook"

import ToolBox from "~component/ui/toolBox"
import { i18n, saveHtml, saveMarkdown, saveWord } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useEditMarkdown } from "~utils/editMarkdownHook"
import { useParseMarkdown } from "~utils/parseMarkdownHook"
import { Print } from "~utils/print"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.luogu.com.cn/article/*"]
}

const turndownService = Turndown()
const articleTitle = document
  .querySelector<HTMLElement>("head title")
  .innerText.trim()

export const getShadowHostId: PlasmoGetShadowHostId = () => "codebox-luogu"

const PlasmoOverlay: FC<PlasmoCSUIProps> = () => {
  const [parseContent, setParseContent] = useParseMarkdown()
  const [allShowTag, setAllShowTag] = useStorage("config-allShowTag", true)
  const [showTag, setShowTag] = useStorage<boolean>("luogu-showTag", true)
  const [cssCode, runCss] = useCssCodeHook("luogu")
  const [content, setContent] = useEditMarkdown()

  useMessage(async (req, res) => {
    if (req.name == "luogu-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "luogu-editMarkdown") {
      editMarkdown()
    }
    if (req.name == "luogu-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "luogu-downloadHtml") {
      downloadHtml()
    }
    if (req.name == "luogu-downloadPdf") {
      downloadPdf()
    }
  })

  function getDescription() {
    const summary = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    ).content
    summary && prompt(i18n("getDescription"), summary)
  }

  function downloadPdf() {
    const article = document.querySelector<HTMLElement>(".article-content")
    if (article) {
      Print.print(article, { title: articleTitle })
        .then(() => console.log("Printing complete"))
        .catch((error) => console.error("Printing failed:", error))
    }
  }

  function downloadWord() {
    const dom = document.querySelector(".article-content")
    saveWord(dom, articleTitle)
  }

  function editMarkdown() {
    const dom = document.querySelector(".article-content")
    setContent(dom, articleTitle)
  }

  function downloadMarkdown() {
    const html = document.querySelector(".article-content")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector(".article-content")
    saveHtml(dom, articleTitle)
  }

  function parseMarkdown() {
    const dom = document.querySelector(".article-content")
    setParseContent(dom)
  }

  return showTag && allShowTag ? (
    <ToolBox
      style={{
        left: "75px"
      }}
      onGetDescription={getDescription}
      onEditMarkdown={editMarkdown}
      onDownloadMarkdown={downloadMarkdown}
      onPrint={downloadPdf}
      onParseMarkdown={parseMarkdown}
      onDownloadWord={downloadWord}
    />
  ) : (
    <></>
  )
}

export default PlasmoOverlay
