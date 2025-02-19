import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchor,
  PlasmoGetShadowHostId,
  PlasmoGetStyle
} from "plasmo"
import qrcodeUrl from "raw:~/public/wx/qrcode_wx.jpg"
import React, { useEffect, useRef, useState, type FC } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/dist/hook"

import { i18n, saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useEditMarkdown } from "~utils/editMarkdownHook"
import makerQRPost from "~utils/makerQRPost"
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
  document.querySelector("#juejin")

const style = {
  box: {
    position: "fixed" as const,
    border: "1px solid #D9DADC",
    left: "25px",
    top: "85px",
    width: "140px",
    padding: "16px",
    cursor: "pointer"
  },
  close: {
    position: "absolute" as const,
    top: "-5px",
    right: "0px",
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "0.5rem"
  },
  img: {
    width: "100%"
  },
  item: {
    color: "#000000",
    fontSize: "1.2rem",
    marginBottom: "3px"
  }
}

const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [parseContent, setParseContent] = useParseMarkdown()
  const [showTag, setShowTag] = useStorage<boolean>("juejin-showTag", true)
  const [cssCode, runCss] = useCssCodeHook("juejin")
  const [content, setContent] = useEditMarkdown()
  const [isShow, setIsShow] = useState(true)

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

  function getDescription() {
    const summary = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    ).content
    summary && prompt("文章摘要：", summary)
  }

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
    setContent(dom, articleTitle)
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

  function onClose() {
    setIsShow(false)
  }

  return showTag && isShow ? (
    <div id="ws_cmbm" className="ws_cmbmc" style={style.box}>
      <button style={style.close} onClick={onClose} aria-label="Close">
        ×
      </button>
      <img src={qrcodeUrl} alt="qrcodeUrl" style={style.img} />
      <div style={style.item}>
        <a onClick={getDescription}>文章摘要</a>
      </div>
      <div style={style.item}>
        <a onClick={editMarkdown}>编辑markdown</a>
      </div>
      <div style={style.item}>
        <a onClick={downloadMarkdown}>下载markdown</a>
      </div>
      <div style={style.item}>
        <a onClick={downloadPdf}>下载PDF</a>
      </div>
      <div style={style.item}>
        <a onClick={parseMarkdown}>解析markdown</a>
      </div>
      <div style={style.item}>
        <a onClick={() => makerQRPost()}>生成海报</a>
      </div>
      <a style={style.item} href="https://www.code-box.fun" target="_blank">
        帮助
      </a>
    </div>
  ) : (
    <></>
  )
}

export default PlasmoOverlay
