import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchor,
  PlasmoGetShadowHostId,
  PlasmoGetStyle
} from "plasmo"
import { useEffect, useRef, type FC } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/dist/hook"

import TagBtnStyle from "~component/tagBtn/style"
import Tags from "~component/ui/tags"
import { i18n, saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useEditMarkdown } from "~utils/editMarkdownHook"
import { useParseMarkdown } from "~utils/parseMarkdownHook"
import { Print } from "~utils/print"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.juejin.cn/post/*"]
}

const turndownService = Turndown({
  addRules: {
    fencedCodeBlock: {
      filter: function (node, options) {
        return (
          options.codeBlockStyle === "fenced" &&
          node.nodeName === "PRE" &&
          node.querySelector("code")
        )
      },

      replacement: function (content, node, options) {
        const className = node.querySelector("code").getAttribute("class") || ""
        const language = (className.match(/lang-(\S+)/) ||
          className.match(/language-(\S+)/) || [null, ""])[1]

        return (
          "\n\n" +
          options.fence +
          language +
          "\n" +
          node.querySelector("code").textContent +
          "\n" +
          options.fence +
          "\n\n"
        )
      }
    }
  }
})
const articleTitle = document
  .querySelector<HTMLElement>("head title")!
  .innerText.trim()

const HOST_ID = "codebox-juejin"
export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector("article.article .article-title")

export const getStyle: PlasmoGetStyle = () => TagBtnStyle()

const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [parseContent, setParseContent] = useParseMarkdown()
  const [showTag, setShowTag] = useStorage<boolean>("juejin-showTag", true)
  const [cssCode, runCss] = useCssCodeHook("juejin")
  const [content, setContent] = useEditMarkdown()

  useMessage(async (req, res) => {
    if (req.name == "juejin-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "juejin-editMarkdown") {
      editMarkdown()
    }
    if (req.name == "juejin-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "juejin-downloadHtml") {
      downloadHtml()
    }
    if (req.name == "juejin-downloadPdf") {
      downloadPdf()
    }
  })

  function downloadPdf() {
    const article = document.querySelector<HTMLElement>("article.article")
    if (article) {
      Print.print(article, { title: articleTitle })
        .then(() => console.log("Printing complete"))
        .catch((error) => console.error("Printing failed:", error))
    }
  }

  function editMarkdown() {
    const dom = document.querySelector("article.article")
    setContent(dom)
  }

  function downloadMarkdown() {
    const html = document.querySelector("article.article")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector("article.article")
    saveHtml(dom, articleTitle)
  }

  function parseMarkdown() {
    const dom = document.querySelector("article.article")
    setParseContent(dom)
  }

  return showTag ? (
    <Tags
      onEdit={editMarkdown}
      onDownload={downloadMarkdown}
      onPrint={downloadPdf}
      onParse={parseMarkdown}
    />
  ) : (
    <></>
  )
}

export default PlasmoOverlay
