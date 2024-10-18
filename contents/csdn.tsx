import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import { addCss, saveHtml, saveMarkdown, setIcon } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.blog.csdn.net/*"]
}

const turndownService = Turndown()
const articleTitle = document.querySelector<HTMLElement>("head title").innerText

const csdn = () => {
  const [cssCode, runCss] = useCssCodeHook("csdn")
  const [closeAds] = useStorage<boolean>("csdn-closeAds")
  const [closeFollow] = useStorage<boolean>("csdn-closeFollow")
  const [closeVip] = useStorage<boolean>("csdn-closeVip")
  const [autoOpenCode] = useStorage<boolean>("csdn-autoOpenCode")
  const [closeLoginModal] = useStorage<boolean>("csdn-closeLoginModal")
  const [closeRedirectModal] = useStorage<boolean>("csdn-closeLoginModal")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [closeLog] = useStorage("config-closeLog", true)
  const [content, setContent] = useContent()

  useEffect(() => {
    closeLog ||
      console.log("CSDN status", {
        closeAds,
        autoOpenCode,
        closeFollow,
        closeVip,
        closeLoginModal,
        closeRedirectModal
      })
    closeAds && closeAdsFunc()
    autoOpenCode && autoOpenCodeFunc()
    closeFollow && followFunc()
    closeVip && closeVipFunc()
    closeLoginModal && closeLoginModalFunc()
    closeRedirectModal && closeRedirectModalFunc()
    setIcon(true)
  }, [closeAds, autoOpenCode, closeFollow, closeLoginModal, closeRedirectModal])

  useMessage(async (req, res) => {
    if (req.name == "csdn-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "csdn-editMarkdown") {
      setContent(".blog-content-box")
    }
    if (req.name == "csdn-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "csdn-downloadHtml") {
      downloadHtml()
    }
  })

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
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector(".blog-content-box")
    saveHtml(dom, articleTitle)
  }

  return <div style={{ display: "none" }}></div>
}

export default csdn
