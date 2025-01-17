import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchor,
  PlasmoGetShadowHostId,
  PlasmoGetStyle
} from "plasmo"
import { useEffect, type FC } from "react"
import { v4 as uuidv4 } from "uuid"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import TagBtnStyle from "~component/tagBtn/style"
import Tags from "~component/ui/tags"
import { addCss, i18n, saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useEditMarkdown } from "~utils/editMarkdownHook"
import { useParseMarkdown } from "~utils/parseMarkdownHook"
import { Print } from "~utils/print"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.51cto.com/*"]
}

const turndownService = Turndown()
const articleTitle = document
  .querySelector<HTMLElement>("head title")
  .innerText.trim()

const HOST_ID = "codebox-51cto"
export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector("article .title")

export const getStyle: PlasmoGetStyle = () => TagBtnStyle()

const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [parseContent, setParseContent] = useParseMarkdown()
  const [showTag, setShowTag] = useStorage<boolean>("51cto-showTag", true)
  const [cssCode, runCss] = useCssCodeHook("51cto")
  const [copyCode] = useStorage<boolean>("51cto-copyCode")
  const [closeLoginModal] = useStorage<boolean>("51cto-closeLoginModal")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [closeLog] = useStorage("config-closeLog", true)
  const [content, setContent] = useEditMarkdown()

  useEffect(() => {
    closeLog || console.log("51CTO status", { closeLoginModal, copyCode })
    setTimeout(() => {
      copyCode && copyCodeFunc()
    }, 500)
    closeLoginModal && closeLoginModalFunc()
  }, [copyCode, closeLoginModal])

  useMessage(async (req, res) => {
    if (req.name == "51cto-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "51cto-editMarkdown") {
      editMarkdown()
    }
    if (req.name == "51cto-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "51cto-downloadHtml") {
      downloadHtml()
    }
    if (req.name == "51cto-downloadPdf") {
      downloadPdf()
    }
  })

  /* 未登录复制代码 */
  function copyCodeCssFunc() {
    addCss(`
    article .hljs-cto,
    article{
      -webkit-touch-callout: auto !important;
      -webkit-user-select: auto !important;
      -khtml-user-select: auto !important;
      -moz-user-select: auto !important;
      -ms-user-select: auto !important;
      user-select: auto !important;
    }`)
  }

  function copyCodeFunc() {
    copyCodeCssFunc()
    // 内容区开启复制
    const content_views = document.querySelector("article")
    content_views && content_views.replaceWith(content_views.cloneNode(true))

    // 功能一： 修改复制按钮，支持一键复制
    const buttons = document.querySelectorAll<HTMLElement>(
      ".hljs-cto .copy_btn"
    )

    if (buttons.length > 0) {
      buttons.forEach((btn) => {
        btn.innerText = "复制"
        btn.setAttribute("onclick", "")
        const elClone = btn.cloneNode(true)

        btn.parentNode.replaceChild(elClone, btn)
        elClone.addEventListener("click", (e) => {
          const target = e.target as HTMLElement
          const parentPreBlock = target.closest(".hljs-cto")
          const codeBlock = parentPreBlock.querySelector<HTMLElement>("pre")
          const codeIndex =
            codeBlock.querySelector<HTMLElement>(".pre-numbering")
          codeBlock.removeChild(codeIndex)

          navigator.clipboard.writeText(codeBlock.innerText)
          setHistory((prevData) =>
            prevData
              ? [
                  {
                    id: uuidv4(),
                    value: codeBlock.innerText,
                    createdAt: new Date(),
                    from: "51CTO",
                    link: location.href,
                    tags: [],
                    remark: ""
                  },
                  ...prevData
                ]
              : [
                  {
                    id: uuidv4(),
                    value: codeBlock.innerText,
                    createdAt: new Date(),
                    from: "51CTO",
                    link: location.href,
                    tags: [],
                    remark: ""
                  }
                ]
          )
          target.innerText = "复制成功"
          setTimeout(() => {
            target.innerText = "复制"
          }, 1000)
          e.stopPropagation()
          e.preventDefault()
        })
      })
    } else {
      const codes = document.querySelectorAll<HTMLElement>(
        "article .has-pre-numbering"
      )

      codes.forEach((code) => {
        const codeBlock = code.closest("div")
        const button = document.createElement("button")

        button.innerText = "复制"
        button.style.position = "absolute"
        button.style.top = "0"
        button.style.right = "0"
        button.title = "一键复制代码"
        button.classList.add("Button")
        button.classList.add("VoteButton")
        codeBlock.appendChild(button)
        codeBlock.style.position = "relative"

        const codeIndex = codeBlock.querySelector<HTMLElement>(".pre-numbering")
        code.removeChild(codeIndex)

        button.addEventListener("click", (e) => {
          const target = e.target as HTMLElement

          navigator.clipboard.writeText(code.innerText)
          setHistory((prevData) =>
            prevData
              ? [
                  {
                    id: uuidv4(),
                    value: codeBlock.innerText,
                    createdAt: new Date(),
                    from: "51CTO",
                    link: location.href,
                    tags: [],
                    remark: ""
                  },
                  ...prevData
                ]
              : [
                  {
                    id: uuidv4(),
                    value: codeBlock.innerText,
                    createdAt: new Date(),
                    from: "51CTO",
                    link: location.href,
                    tags: [],
                    remark: ""
                  }
                ]
          )
          target.innerText = "复制成功"
          setTimeout(() => {
            target.innerText = "复制"
          }, 1000)
          e.stopPropagation()
          e.preventDefault()
        })
      })
    }
  }

  // 关闭登录弹框
  function closeLoginModalFunc() {
    const css = `
    #login_iframe_mask {
      display:none !important;
    }`
    addCss(css)
  }

  function downloadPdf() {
    var article = document.querySelector<HTMLElement>("article .article-detail")
    if (article) {
      Print.print(article, { title: articleTitle })
        .then(() => console.log("Printing complete"))
        .catch((error) => console.error("Printing failed:", error))
    }
  }

  function downloadMarkdown() {
    const html = document.querySelector<HTMLElement>("article .article-detail")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector<HTMLElement>("article .article-detail")
    saveHtml(dom, articleTitle)
  }

  function editMarkdown() {
    const dom = document.querySelector<HTMLElement>("article .article-detail")
    setContent(dom)
  }

  function parseMarkdown() {
    const dom = document.querySelector<HTMLElement>("article .article-detail")
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
