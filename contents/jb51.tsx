import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import { addCss, saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { savePdf } from "~utils/downloadPdf"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.jb51.net/*"]
}

const turndownService = Turndown()
const articleTitle = document
  .querySelector<HTMLElement>("head title")
  .innerText.trim()

export default function jb51() {
  const [cssCode, runCss] = useCssCodeHook("jb51")
  const [closeAds] = useStorage<boolean>("jb51-closeAds")
  const [copyCode] = useStorage<boolean>("jb51-copyCode")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [closeLog] = useStorage("config-closeLog", true)
  const [content, setContent] = useContent()

  useEffect(() => {
    closeLog || console.log("jb51 status", { closeAds, copyCode })
    closeAds && closeAdsFunc()
    copyCode && copyCodeFunc()
  }, [closeAds, copyCode])

  useMessage(async (req, res) => {
    if (req.name == "jb51-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "jb51-editMarkdown") {
      setContent("#article")
    }
    if (req.name == "jb51-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "jb51-downloadHtml") {
      downloadHtml()
    }
    if (req.name == "jb51-downloadPdf") {
      var article = document.querySelector<HTMLElement>("#article")
      savePdf(article, articleTitle)
    }
  })

  /* 未登录复制代码 */
  function copyCodeCssFunc() {
    addCss(`
    #article .jb51code,
    #article .code {
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
    var content_views = document.querySelector("#article")
    content_views && content_views.replaceWith(content_views.cloneNode(true))

    // 功能一： 修改复制按钮，支持一键复制
    const buttons = document.querySelectorAll<HTMLElement>(".codetool .copy")

    if (buttons.length > 0) {
      buttons.forEach((btn) => {
        // 更改标题
        btn.innerText = "复制"

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
          const parentPreBlock = target.closest(".jb51code")
          const codeBlock = parentPreBlock.querySelector<HTMLElement>(".code")

          navigator.clipboard.writeText(codeBlock.innerText)
          setHistory((prevData) =>
            prevData
              ? [
                  {
                    id: uuidv4(),
                    value: codeBlock.innerText,
                    createdAt: new Date(),
                    from: "脚本之家",
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
                    from: "脚本之家",
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
      const codes = document.querySelectorAll<HTMLElement>("article .jb51code")

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
          // 实现复制
          const target = e.target as HTMLElement
          const parentPreBlock = target.closest(".jb51code")
          const codeBlock = parentPreBlock.querySelector<HTMLElement>("pre")

          navigator.clipboard.writeText(codeBlock.innerText)
          setHistory((prevData) =>
            prevData
              ? [
                  {
                    id: uuidv4(),
                    value: codeBlock.innerText,
                    createdAt: new Date(),
                    from: "脚本之家",
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
                    from: "脚本之家",
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

  // 关闭广告
  function closeAdsFunc() {
    addCss(`
    .tipsa_ds,
    #txtlink,
    #r1gg,
    #idctu,
    #rbbd {
      display:none !important;
    }`)
  }

  function downloadMarkdown() {
    const html = document.querySelector("#article")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector("#article")
    saveHtml(dom, articleTitle)
  }

  return <div style={{ display: "none" }}></div>
}
