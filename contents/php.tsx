import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import { addCss, saveHtml, saveMarkdown, setIcon } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.php.cn/*"]
}

const turndownService = Turndown()
const articleTitle = document.querySelector<HTMLElement>("head title").innerText

export default function Php() {
  const [cssCode, runCss] = useCssCodeHook("php")
  const [copyCode] = useStorage<boolean>("php-copyCode")
  const [closeLoginModal] = useStorage<boolean>("php-closeLoginModal")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [closeLog] = useStorage("config-closeLog", true)
  const [content, setContent] = useContent()

  useEffect(() => {
    closeLog || console.log("PHP status", { closeLoginModal, copyCode })
    setTimeout(() => {
      copyCode && copyCodeFunc()
    }, 500)
    closeLoginModal && closeLoginModalFunc()
    setIcon(true)
  }, [copyCode, closeLoginModal])

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
  })

  /* 未登录复制代码 */
  function copyCodeCssFunc() {
    addCss(`
    .php-article .code,
    .php-article{
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
    var content_views = document.querySelector(".php-article")
    content_views && content_views.replaceWith(content_views.cloneNode(true))

    // 功能一： 修改复制按钮，支持一键复制
    const buttons = document.querySelectorAll<HTMLElement>(
      ".php-article .code .contentsignin"
    )

    if (buttons.length > 0) {
      buttons.forEach((btn) => {
        btn.innerText = "复制"
        btn.setAttribute("onclick", "")
        const elClone = btn.cloneNode(true)

        btn.parentNode.replaceChild(elClone, btn)
        elClone.addEventListener("click", (e) => {
          const target = e.target as HTMLElement
          const parentPreBlock = target.closest(".code")
          const codeBlock = parentPreBlock.querySelector<HTMLElement>(".code")

          navigator.clipboard.writeText(codeBlock.innerText)
          setHistory((prevData) =>
            prevData
              ? [
                  {
                    id: uuidv4(),
                    value: codeBlock.innerText,
                    createdAt: new Date(),
                    from: "PHP中文网",
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
                    from: "PHP中文网",
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
      const codes = document.querySelectorAll<HTMLElement>(".nphpQianBox .code")

      codes.forEach((code) => {
        const button = document.createElement("button")

        button.innerText = "复制"
        button.style.position = "absolute"
        button.style.top = "0"
        button.style.right = "0"
        button.title = "一键复制代码"
        button.classList.add("Button")
        button.classList.add("VoteButton")

        code.appendChild(button)
        code.style.position = "relative"

        button.addEventListener("click", (e) => {
          const target = e.target as HTMLElement
          const codeBlock = code.querySelector<HTMLElement>(".container")

          navigator.clipboard.writeText(codeBlock.innerText)
          setHistory((prevData) =>
            prevData
              ? [
                  {
                    id: uuidv4(),
                    value: codeBlock.innerText,
                    createdAt: new Date(),
                    from: "PHP中文网",
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
                    from: "PHP中文网",
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

  return <div style={{ display: "none" }}></div>
}
