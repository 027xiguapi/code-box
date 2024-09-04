import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/dist/hook"

import { Readability } from "~node_modules/@mozilla/readability"
import {
  getMetaContentByProperty,
  saveHtml,
  saveMarkdown,
  setIcon
} from "~tools"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.weixin.qq.com/*"]
}

const turndownService = Turndown()
const documentClone = document.cloneNode(true)
const article = new Readability(documentClone as Document, {}).parse()
const articleUrl = window.location.href
const author = article.byline ?? ""
const authorLink = getMetaContentByProperty("article:author")
const domain = window.location.hostname

export default function Weixin() {
  const [copyCode] = useStorage<boolean>("51cto-copyCode")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [closeLog] = useStorage("config-closeLog", true)

  useEffect(() => {
    closeLog || console.log("weixin status", { copyCode })
    copyCode && copyCodeFunc()
    setIcon(copyCode)
  }, [copyCode])

  useMessage(async (req, res) => {
    if (req.name == "weixin-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "weixin-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "weixin-downloadHtml") {
      downloadHtml()
    }
  })

  function copyCodeFunc() {
    const content_views = document.querySelector("#js_content")

    // 功能一： 修改复制按钮，支持一键复制
    const codes = content_views.querySelectorAll<HTMLElement>("code")

    if (codes.length > 0) {
      codes.forEach((code) => {
        const pre = code.closest("pre")
        if (pre) {
          const button = document.createElement("button")
          button.innerText = "复制"
          button.style.position = "absolute"
          button.style.top = "0"
          button.style.right = "0"
          button.title = "一键复制代码"
          button.classList.add("Button")
          button.classList.add("VoteButton")

          pre.appendChild(button)
          pre.style.position = "relative"

          button.addEventListener("click", (e) => {
            const target = e.target as HTMLElement
            const parentPreBlock = target.closest("pre")
            const codeBlock = parentPreBlock.querySelector<HTMLElement>("code")

            navigator.clipboard.writeText(codeBlock.innerText)
            setHistory((prevData) =>
              prevData
                ? [
                    {
                      id: uuidv4(),
                      value: codeBlock.innerText,
                      createdAt: new Date(),
                      from: "微信",
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
                      from: "微信",
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
        }
      })
    }
  }

  function downloadMarkdown() {
    const html = document.querySelector("#img-content")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, article.title)
  }

  function downloadHtml() {
    const dom = document.querySelector("#img-content")
    saveHtml(dom, article.title)
  }

  return <div style={{ display: "none" }}></div>
}
