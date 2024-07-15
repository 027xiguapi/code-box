import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef } from "react"

import { useStorage } from "@plasmohq/storage/hook"

export const config: PlasmoCSConfig = {
  matches: ["https://*.blog.csdn.net/*"]
}

window.addEventListener("load", () => {
  console.log("CSDN 加载完成，执行代码")
})

const csdn = () => {
  const [closeAds] = useStorage<boolean>("csdn-closeAds")
  const [copyCode] = useStorage<boolean>("csdn-copyCode")
  const [closeFollow, setCloseFollow] = useStorage("csdn-closeFollow")
  const [autoOpenCode] = useStorage<boolean>("csdn-autoOpenCode")
  const [closeLoginModal] = useStorage<boolean>("csdn-closeLoginModal")
  const isMount = useRef<boolean>(false)

  useEffect(() => {
    console.log("CSDN closeAds", closeAds)
    closeAds && closeAdsFunc()
  }, [closeAds])

  useEffect(() => {
    console.log("CSDN copyCode", copyCode)
    copyCode && copyCodeFunc()
  }, [copyCode])

  useEffect(() => {
    console.log("CSDN autoOpenCode", autoOpenCode)
    autoOpenCode && autoOpenCodeFunc()
  }, [autoOpenCode])

  useEffect(() => {
    console.log("CSDN closeFollow", closeFollow)
    closeFollow && followFunc()
  }, [closeFollow])

  useEffect(() => {
    console.log("CSDN closeLoginModal", closeLoginModal)
    closeLoginModal && closeLoginModalFunc()
  }, [closeLoginModal])

  /* 未登录复制代码 */
  function copyCodeCssFunc() {
    let style = document.createElement("style")
    style.innerHTML = `
    #content_views pre,
    #content_views pre code {
      -webkit-touch-callout: auto !important;
      -webkit-user-select: auto !important;
      -khtml-user-select: auto !important;
      -moz-user-select: auto !important;
      -ms-user-select: auto !important;
      user-select: auto !important;
    }`
    document.head.appendChild(style)
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
    let style = document.createElement("style")
    style.innerHTML = `
    .toolbar-advert,
    #recommendAdBox,
    .adsbygoogle {
      display:none !important;
    }`
    document.head.appendChild(style)
  }

  // 解除 关注博主即可阅读全文的提示
  const followFunc = () => {
    let readMore = document.querySelector(".btn-readmore")
    let style = document.createElement("style")

    style.innerHTML = `
    #article_content{
      height: auto !important;
    }
    .hide-article-box {
      z-index: -1 !important;
    }`
    if (readMore) {
      document.head.appendChild(style)
    }
  }

  // 隐藏登陆弹窗
  function closeLoginModalFunc() {
    let style = document.createElement("style")
    style.innerHTML = `
    .passport-login-container {
      display:none !important;
    }`
    document.head.appendChild(style)
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

    pres.forEach((pre) => {
      pre.style.height = "unset"
      pre.style.maxHeight = "unset"
    })
    presBox.forEach((box) => {
      box.style.display = "none"
    })
  }

  return <div style={{ display: "none" }}></div>
}

export default csdn
