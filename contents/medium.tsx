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

import { i18n, saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { savePdf } from "~utils/downloadPdf"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.medium.com/*"]
}

function repeat(character, count) {
  return Array(count + 1).join(character)
}

const turndownOption = {
  addRules: {
    heading: {
      filter: ["h1", "h2", "h3", "h4", "h5", "h6"],

      replacement: function (content, node, options) {
        var hLevel = Number(node.nodeName.charAt(1))

        if (options.headingStyle === "setext" && hLevel < 3) {
          var underline = repeat(hLevel === 1 ? "=" : "-", content.length)
          return "\n\n" + content.trim() + "\n" + underline + "\n\n"
        } else {
          return "\n\n" + repeat("#", hLevel) + " " + content.trim() + "\n\n"
        }
      }
    },
    listItem: {
      filter: "li",

      replacement: function (content, node, options) {
        content = content
          .replace(/^\n+/, "") // remove leading newlines
          .replace(/\n+$/, "\n") // replace trailing newlines with just a single one
          .replace(/\n/gm, "\n    ")
          .trim() // indent
        var prefix = options.bulletListMarker + "   "
        var parent = node.parentNode
        if (parent.nodeName === "OL") {
          var start = parent.getAttribute("start")
          var index = Array.prototype.indexOf.call(parent.children, node)
          prefix = (start ? Number(start) + index : index + 1) + ".  "
        }
        return (
          prefix +
          content +
          (node.nextSibling && !/\n$/.test(content) ? "\n" : "")
        )
      }
    },
    fencedCodeBlock: {
      filter: function (node, options) {
        return options.codeBlockStyle === "fenced" && node.nodeName === "PRE"
      },

      replacement: function (content, node, options) {
        content = content
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/\\=/gi, "=")
          .replace(/\\#/gi, "#")
          .replace(/\\-/gi, "-")
          .replace(/\\\*/gi, "*")

        return (
          "\n\n" +
          options.fence +
          "\n" +
          content +
          "\n" +
          options.fence +
          "\n\n"
        )
      }
    }
  }
}

const turndownService = Turndown(turndownOption)
const articleTitle = document
  .querySelector<HTMLElement>("head title")
  .innerText.trim()

const HOST_ID = "codebox-medium"
export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector("article .pw-post-title")

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
  .codebox-tagBtn {
    height: 28px;
    display: flex;
    cursor: pointer;
    align-items: center;
    color: #1e80ff;
    width: 60px;
    background: #fff;
    border-radius: 5px;
    justify-content: space-between;
    padding: 0 8px;
    margin-top: -30px;
    font-size: 14px;
  }
  `
  return style
}

const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [showTag, setShowTag] = useStorage<boolean>("medium-showTag")
  const [cssCode, runCss] = useCssCodeHook("medium")
  const [content, setContent] = useContent(turndownOption)

  useMessage(async (req, res) => {
    if (req.name == "medium-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "medium-editMarkdown") {
      setContent("article.article")
    }
    if (req.name == "medium-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "medium-downloadHtml") {
      downloadHtml()
    }
    if (req.name == "medium-downloadPdf") {
      var article = document.querySelector<HTMLElement>("article.article")
      savePdf(article, articleTitle)
    }
  })

  function downloadMarkdown() {
    const html = document.querySelector("article")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector("article")
    saveHtml(dom, articleTitle)
  }

  function handleEdit() {
    setContent("article")
  }

  function handleDownload() {
    const html = document.querySelector("article")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function closeTag() {
    setShowTag(false)
  }

  return showTag ? (
    <div className="codebox-tagBtn">
      <div onClick={handleEdit}>{i18n("edit")}</div>
      <div onClick={handleDownload}>{i18n("download")}</div>
    </div>
  ) : (
    <></>
  )
}

export default PlasmoOverlay
