import { Button } from "antd"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList
} from "plasmo"
import { useEffect, useState, type FC } from "react"
import { v4 as uuidv4 } from "uuid"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import { addCss, removeCss, saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { savePdf } from "~utils/downloadPdf"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.php.cn/*"]
}

const turndownService = Turndown()
const articleTitle = document
  .querySelector<HTMLElement>("head title")
  .innerText.trim()

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const preList = document.querySelectorAll("pre")

  const anchors = []
  Array.from(preList).map((pre) => {
    const classList = pre.classList
    if (pre.textContent && !classList.contains("CodeMirror-line"))
      anchors.push(pre)
  })

  return anchors.map((element) => ({
    element,
    insertPosition: "afterbegin"
    // insertPosition: "beforebegin"
  }))
}

const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [cssCode, runCss] = useCssCodeHook("php")
  const [copyCode] = useStorage("php-copyCode", true)
  const [closeLoginModal] = useStorage<boolean>("php-closeLoginModal")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [closeLog] = useStorage("config-closeLog", true)
  const [content, setContent] = useContent()
  const [isCopy, setIsCopy] = useState(false)

  const element = anchor.element
  const style = window.getComputedStyle(element)
  const marginTop = style.getPropertyValue("margin-top")

  const onCopy = async () => {
    try {
      const target = anchor.element as HTMLElement
      const preBlock = target.closest("pre")
      const codeBlock = target.querySelector("code")
      let textContent = ""

      if (codeBlock) {
        textContent = codeBlock.textContent
      } else {
        textContent = preBlock && preBlock.textContent
      }

      navigator.clipboard.writeText(textContent)

      setIsCopy(true)
      setTimeout(() => {
        setIsCopy(false)
      }, 1000)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    closeLog || console.log("PHP status", { closeLoginModal })
    copyCodeFunc(copyCode)
    closeLoginModal && closeLoginModalFunc()
  }, [closeLoginModal])

  useMessage(async (req, res) => {
    if (req.name == "php-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "php-editMarkdown") {
      setContent(".phpscMain .php-article")
    }
    if (req.name == "php-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "php-downloadHtml") {
      downloadHtml()
    }
    if (req.name == "php-downloadPdf") {
      var article = document.querySelector<HTMLElement>(
        ".phpscMain .php-article"
      )
      savePdf(article, articleTitle)
    }
  })

  /* 未登录复制代码 */
  function copyCodeCssFunc(copyCode) {
    copyCode
      ? addCss(
          `
    .php-article .code,
    .php-article{
      -webkit-touch-callout: auto !important;
      -webkit-user-select: auto !important;
      -khtml-user-select: auto !important;
      -moz-user-select: auto !important;
      -ms-user-select: auto !important;
      user-select: auto !important;
    }`,
          `php-copyCode-css`
        )
      : removeCss(`php-copyCode-css`)
  }

  function copyCodeFunc(copyCode) {
    copyCode &&
      document.addEventListener("copy", function (event) {
        const selectedText = window.getSelection().toString()
        event.clipboardData.setData("text/plain", selectedText)
        event.preventDefault()
      })
    copyCodeCssFunc(copyCode)
  }

  // 关闭登录弹框
  function closeLoginModalFunc() {
    const css = `
    .layui-layer-shade,
    .layui-layer-iframe {
      display:none !important;
    }`
    addCss(css)
  }

  function downloadMarkdown() {
    const html = document.querySelector(".phpscMain .php-article")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector(".phpscMain .php-article")
    saveHtml(dom, articleTitle)
  }

  return (
    <>
      {copyCode ? (
        <div
          className="codebox-copyCodeHeader"
          style={{ marginBottom: "-" + marginTop }}>
          <span className="codebox-copyCodeLogo"></span>
          <Button
            color="primary"
            variant="filled"
            onClick={onCopy}
            className="codebox-copyCodeBtn">
            {isCopy ? "复制成功" : "复制"}
          </Button>
        </div>
      ) : (
        <></>
      )}
    </>
  )
}

export default PlasmoOverlay
