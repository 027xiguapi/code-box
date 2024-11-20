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

import { addCss, i18n, saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { savePdf } from "~utils/downloadPdf"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.blog.csdn.net/*", "https://devpress.csdn.net/*"]
}

const turndownService = Turndown()
const articleTitle = document.querySelector<HTMLElement>("head title").innerText

const HOST_ID = "codebox-csdn"
export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector(".blog-content-box .title-article") ||
  document.querySelector(".article-detail .title")

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
  .codebox-tagBtn {
    height: 28px;
    display: flex;
    cursor: pointer;
    align-items: center;
    color: #1e80ff;
    width: 60px;
    background: #fff;
    border-radius: 5px;
    justify-content: space-between;
    padding: 0 8px;
    margin-top: -20px;
    font-size: 14px;
  }
  `
  return style
}

const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [showTag, setShowTag] = useStorage<boolean>("csdn-showTag")
  const [cssCode, runCss] = useCssCodeHook("csdn")
  const [closeAds] = useStorage<boolean>("csdn-closeAds")
  const [copyCode] = useStorage<boolean>("csdn-copyCode")
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
        showTag,
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
    if (req.name == "csdn-editMarkdown") {
      setContent(".blog-content-box")
    }
    if (req.name == "csdn-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "csdn-downloadHtml") {
      downloadHtml()
    }
    if (req.name == "csdn-downloadPdf") {
      var article = document.querySelector<HTMLElement>(".blog-content-box")
      savePdf(article, articleTitle)
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
    content_views?.replaceWith(content_views.cloneNode(true))

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
    const readMore =
      document.querySelector(".btn-readmore") ||
      document.querySelector(".article-show-more")

    if (readMore) {
      const css = `
        #article_content{
          height: auto !important;
        }
        .hide-article-box {
          z-index: -1 !important;
        }
        .article-detail .main-content .user-article-hide{
          height: auto !important;
        }
        .article-show-more {
          display: none !important;
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

  function handleEdit() {
    setContent(".blog-content-box")
  }

  function handleDownload() {
    const html = document.querySelector(".blog-content-box")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function closeTag() {
    setShowTag(false)
  }

  return showTag ? (
    <div className="codebox-tagBtn">
      <div onClick={handleEdit}>{i18n("edit")}</div>
      <div onClick={handleDownload}>{i18n("download")}</div>
    </div>
  ) : (
    <></>
  )
}

export default PlasmoOverlay
