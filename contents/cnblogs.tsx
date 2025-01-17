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
import { saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useEditMarkdown } from "~utils/editMarkdownHook"
import { useParseMarkdown } from "~utils/parseMarkdownHook"
import { Print } from "~utils/print"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.cnblogs.com/*"],
  all_frames: true
}

const turndownService = Turndown()
const articleTitle = document
  .querySelector<HTMLElement>("head title")
  .innerText.trim()

const HOST_ID = "codebox-cnblogs"
export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector("#post_detail .postTitle")

export const getStyle: PlasmoGetStyle = () => TagBtnStyle()

const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [parseContent, setParseContent] = useParseMarkdown()
  const [showTag, setShowTag] = useStorage<boolean>("cnblogs-showTag", true)
  const [cssCode, runCss] = useCssCodeHook("cnblogs")
  const [copyCode] = useStorage<boolean>("cnblogs-copyCode")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [closeLog] = useStorage("config-closeLog", true)
  const [content, setContent] = useEditMarkdown()

  useEffect(() => {
    closeLog || console.log("cnblogs copyCode", copyCode)
    copyCode && copyCodeFunc()
  }, [copyCode])

  useMessage(async (req, res) => {
    if (req.name == "cnblogs-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "cnblogs-editMarkdown") {
      editMarkdown()
    }
    if (req.name == "cnblogs-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "cnblogs-downloadHtml") {
      downloadHtml()
    }
    if (req.name == "cnblogs-downloadPdf") {
      downloadPdf()
    }
  })

  // 功能一： 修改复制按钮，支持一键复制
  function copyCodeFunc() {
    const toolbars = document.querySelectorAll<HTMLElement>(
      ".cnblogs_code_toolbar"
    )

    toolbars.forEach((toolbar) => {
      const button = document.createElement("button")
      button.innerText = "复制"
      button.style.float = "right"
      button.title = "一键复制代码"
      button.classList.add("copy-btn")

      toolbar.appendChild(button)
    })

    const buttons = document.querySelectorAll<HTMLElement>(
      ".cnblogs_code_toolbar .copy-btn"
    )

    buttons.forEach((btn) => {
      // 移除点击事件
      btn.setAttribute("onclick", "")

      // 克隆按钮
      var elClone = btn.cloneNode(true)

      // 替回按钮
      btn.parentNode.replaceChild(elClone, btn)

      // 重新添加点击事件
      elClone.addEventListener("click", (e) => {
        // 实现复制
        const target = e.target as HTMLElement
        const parentPreBlock = target.closest(".cnblogs_code")
        const codeBlock = parentPreBlock.querySelector<HTMLElement>("pre")

        navigator.clipboard.writeText(codeBlock.innerText)
        setHistory((prevData) =>
          prevData
            ? [
                {
                  id: uuidv4(),
                  value: codeBlock.innerText,
                  createdAt: new Date(),
                  from: "博客园",
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
                  from: "博客园",
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

  function downloadPdf() {
    const article = document.querySelector<HTMLElement>("#post_detail .post")
    if (article) {
      Print.print(article, { title: articleTitle })
        .then(() => console.log("Printing complete"))
        .catch((error) => console.error("Printing failed:", error))
    }
  }

  function editMarkdown() {
    const dom = document.querySelector<HTMLElement>("#post_detail")
    setContent(dom)
  }

  function downloadMarkdown() {
    const html = document.querySelector<HTMLElement>("#post_detail")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector("#post_detail .post")
    saveHtml(dom, articleTitle)
  }

  function parseMarkdown() {
    const dom = document.querySelector<HTMLElement>("#post_detail")
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
