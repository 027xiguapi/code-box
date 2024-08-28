import { Readability } from "@mozilla/readability"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef } from "react"
import { v4 as uuidv4 } from "uuid"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import {
  addCss,
  getMetaContentByProperty,
  saveHtml,
  saveMarkdown,
  setIcon
} from "~tools"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.blog.csdn.net/*"]
}

const turndownService = Turndown()
const documentClone = document.cloneNode(true)
const article = new Readability(documentClone as Document, {}).parse()
const articleUrl = window.location.href
const author = article.byline ?? ""
const authorLink = getMetaContentByProperty("article:author")
const domain = window.location.hostname

const csdn = () => {
  const [closeAds] = useStorage<boolean>("csdn-closeAds")
  const [copyCode] = useStorage<boolean>("csdn-copyCode")
  const [closeFollow] = useStorage<boolean>("csdn-closeFollow")
  const [closeVip] = useStorage<boolean>("csdn-closeVip")
  const [autoOpenCode] = useStorage<boolean>("csdn-autoOpenCode")
  const [closeLoginModal] = useStorage<boolean>("csdn-closeLoginModal")
  const [closeRedirectModal] = useStorage<boolean>("csdn-closeLoginModal")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [closeLog] = useStorage("config-closeLog", true)

  useEffect(() => {
    closeLog ||
      console.log("CSDN status", {
        closeAds,
        copyCode,
        autoOpenCode,
        closeFollow,
        closeVip,
        closeLoginModal,
        closeRedirectModal
      })
    closeAds && closeAdsFunc()
    copyCode && copyCodeFunc()
    autoOpenCode && autoOpenCodeFunc()
    closeFollow && followFunc()
    closeVip && closeVipFunc()
    closeLoginModal && closeLoginModalFunc()
    closeRedirectModal && closeRedirectModalFunc()
    setIcon(
      closeAds ||
        copyCode ||
        autoOpenCode ||
        closeFollow ||
        closeLoginModal ||
        closeRedirectModal
    )
  }, [
    closeAds,
    copyCode,
    autoOpenCode,
    closeFollow,
    closeLoginModal,
    closeRedirectModal
  ])

  useMessage(async (req, res) => {
    if (req.name == "csdn-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "csdn-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "csdn-downloadHtml") {
      downloadHtml()
    }
  })

  /* 未登录复制代码 */
  function copyCodeCssFunc() {
    const css = `
    #content_views pre,
    #content_views pre code {
      -webkit-touch-callout: auto !important;
      -webkit-user-select: auto !important;
      -khtml-user-select: auto !important;
      -moz-user-select: auto !important;
      -ms-user-select: auto !important;
      user-select: auto !important;
    }`
    addCss(css)
  }

  function copyCodeFunc() {
    copyCodeCssFunc()
    // 内容区开启复制
    var content_views = document.querySelector("#content_views")
    content_views.replaceWith(content_views.cloneNode(true))

    // 功能一： 修改复制按钮，支持一键复制
    const buttons = document.querySelectorAll<HTMLElement>(".hljs-button")

    buttons.forEach((btn) => {
      // 更改标题
      btn.dataset.title = "复制"

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
        const parentPreBlock = target.closest("pre")
        const codeBlock = parentPreBlock.querySelector("code")

        navigator.clipboard.writeText(codeBlock.innerText)
        setHistory((prevData) =>
          prevData
            ? [
                {
                  id: uuidv4(),
                  value: codeBlock.innerText,
                  createdAt: new Date(),
                  from: "CSDN",
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
                  from: "CSDN",
                  link: location.href,
                  tags: [],
                  remark: ""
                }
              ]
        )

        target.dataset.title = "复制成功"
        setTimeout(() => {
          target.dataset.title = "复制"
        }, 1000)
        e.stopPropagation()
        e.preventDefault()
      })
    })
  }

  // 关闭广告
  function closeAdsFunc() {
    const css = `
    .toolbar-advert,
    #recommendAdBox,
    .adsbygoogle {
      display:none !important;
    }`
  }

  // 解除 关注博主即可阅读全文的提示
  const followFunc = () => {
    const readMore = document.querySelector(".btn-readmore")
    if (readMore) {
      const css = `
        #article_content{
          height: auto !important;
        }
        .hide-article-box {
          z-index: -1 !important;
        }`
      addCss(css)
    }
  }

  // 隐藏登录弹窗
  function closeLoginModalFunc() {
    const css = `
    .passport-login-container {
      display:none !important;
    }`
    addCss(css)
  }

  // 自动展开代码块
  function autoOpenCodeFunc() {
    const pres = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main div.blog-content-box pre.set-code-hide"
      )
    )
    const presBox = Array.from(
      document.querySelectorAll<HTMLElement>(".hide-preCode-box")
    )

    const readallBox = document.querySelector<HTMLElement>(".readall_box")

    pres.forEach((pre) => {
      pre.style.height = "unset"
      pre.style.maxHeight = "unset"
    })
    presBox.forEach((box) => {
      box.style.display = "none"
    })

    if (readallBox) {
      const articleContent =
        document.querySelector<HTMLElement>(".article_content")

      articleContent.style.height = "unset"
      readallBox.style.display = "none"
    }
  }

  // 隐藏移动端跳转APP弹窗
  function closeRedirectModalFunc() {
    const css = `
    .ios-shadowbox,
    .feed-Sign-weixin,
    .weixin-shadowbox {
      display:none !important;
    }`
    addCss(css)
  }

  function closeVipFunc() {
    document.querySelectorAll(".hide-article-box").forEach((box) => {
      box.remove()
    })
  }

  function downloadMarkdown() {
    const html = document.querySelector(".blog-content-box")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, article.title)
  }

  function downloadHtml() {
    const dom = document.querySelector(".blog-content-box")
    saveHtml(dom, article.title)
  }

  return <div style={{ display: "none" }}></div>
}

export default csdn
