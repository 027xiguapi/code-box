import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchor,
  PlasmoGetShadowHostId,
  PlasmoGetStyle
} from "plasmo"
import { useEffect, useRef, type FC } from "react"
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
  matches: ["https://*.jianshu.com/*"]
}

const turndownService = Turndown()
const articleTitle = document
  .querySelector<HTMLElement>("head title")
  .innerText.trim()

const HOST_ID = "codebox-jianshu"
export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector("section.ouvJEz h1")

export const getStyle: PlasmoGetStyle = () => TagBtnStyle()

const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [parseContent, setParseContent] = useParseMarkdown()
  const [showTag, setShowTag] = useStorage<boolean>("jianshu-showTag", true)
  const [cssCode, runCss] = useCssCodeHook("jianshu")
  const [closeLoginModal] = useStorage<boolean>("jianshu-closeLoginModal")
  const [copyCode] = useStorage<boolean>("jianshu-copyCode")
  const [autoOpenCode] = useStorage<boolean>("jianshu-autoOpenCode")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [closeLog] = useStorage("config-closeLog", true)
  const [content, setContent] = useEditMarkdown()

  useEffect(() => {
    closeLog ||
      console.log("jianshu status", { copyCode, closeLoginModal, autoOpenCode })
    copyCode && copyCodeFunc()
    closeLoginModal && closeLoginModalFunc()
    autoOpenCode && autoOpenCodeFunc()
  }, [copyCode, closeLoginModal, autoOpenCode])

  useMessage(async (req, res) => {
    if (req.name == "jianshu-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "jianshu-editMarkdown") {
      editMarkdown()
    }
    if (req.name == "jianshu-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "jianshu-downloadHtml") {
      downloadHtml()
    }
    if (req.name == "jianshu-downloadPdf") {
      downloadPdf()
    }
  })

  // 一键复制
  function copyCodeFunc() {
    const codes = document.querySelectorAll<HTMLElement>(".hljs")

    codes.forEach((code) => {
      const button = document.createElement("button")
      button.innerText = "复制"
      button.style.position = "absolute"
      button.style.top = "0"
      button.style.right = "0"
      button.style.background = "#fff"
      button.title = "一键复制代码"
      button.classList.add("Button")
      button.classList.add("VoteButton")

      code.appendChild(button)
      code.style.position = "relative"

      button.addEventListener("click", (e) => {
        const target = e.target as HTMLElement
        const parentPreBlock = target.closest(".hljs")
        const codeBlock = parentPreBlock.querySelector<HTMLElement>("code")

        navigator.clipboard.writeText(codeBlock.innerText)
        setHistory((prevData) =>
          prevData
            ? [
                {
                  id: uuidv4(),
                  value: codeBlock.innerText,
                  createdAt: new Date(),
                  from: "简书",
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
                  from: "简书",
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

  // 隐藏登录弹窗
  function closeLoginModalFunc() {
    addCss(
      `.hide,
      ._23ISFX-wrap,
      ._23ISFX-mask{ 
        display:none !important; 
      }
      body {
        overflow: unset !important;
      }`
    )
    let openAppModal = document.querySelector(".open-app-modal")
    if (openAppModal) {
      const dialog = openAppModal.closest(
        "div[class^='dialog-']"
      ) as HTMLElement
      const className = dialog.className
      addCss(
        `.download-app-guidance,.${className} { display:none !important; }`
      )
    }
  }

  // 自动展开全文
  function autoOpenCodeFunc() {
    const tips = document.querySelector(".collapse-tips")
    if (tips) {
      const css = `
        .collapse-free-content{
          height: auto !important;
        }
        .collapse-tips {
          display: none !important;
        }`
      addCss(css)
    }
  }

  function downloadPdf() {
    const article = document.querySelector<HTMLElement>("section.ouvJEz")
    if (article) {
      Print.print(article, { title: articleTitle })
        .then(() => console.log("Printing complete"))
        .catch((error) => console.error("Printing failed:", error))
    }
  }

  function editMarkdown() {
    const dom = document.querySelector("section.ouvJEz")
    setContent(dom, articleTitle)
  }

  function downloadMarkdown() {
    const html = document.querySelector("section.ouvJEz")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector("section.ouvJEz")
    saveHtml(dom, articleTitle)
  }

  function parseMarkdown() {
    const dom = document.querySelector("section.ouvJEz")
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
