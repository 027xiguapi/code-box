import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef } from "react"

import { useStorage } from "@plasmohq/storage/hook"

export const config: PlasmoCSConfig = {
  matches: ["https://*.jb51.net/*"]
}

window.addEventListener("load", () => {
  console.log("脚本之家加载完成，执行代码")
})

export default function jb51() {
  const [closeAds] = useStorage<boolean>("jb51-closeAds")
  const [copyCode] = useStorage<boolean>("jb51-copyCode")

  useEffect(() => {
    console.log("jb51 closeAds", closeAds)
    closeAds && closeAdsFunc()
  }, [closeAds])

  useEffect(() => {
    console.log("jb51 copyCode", copyCode)
    copyCode && copyCodeFunc()
  }, [copyCode])

  /* 未登录复制代码 */
  function copyCodeCssFunc() {
    let style = document.createElement("style")
    style.innerHTML = `
    #article .jb51code,
    #article .code {
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
    var content_views = document.querySelector("#article")
    content_views.replaceWith(content_views.cloneNode(true))

    // 功能一： 修改复制按钮，支持一键复制
    const buttons = document.querySelectorAll<HTMLElement>(".codetool .copy")

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

        target.innerText = "复制成功"
        setTimeout(() => {
          target.innerText = "复制"
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
    .tipsa_ds,
    #txtlink,
    #r1gg,
    #idctu,
    #rbbd {
      display:none !important;
    }`
    document.head.appendChild(style)
  }

  return <div style={{ display: "none" }}></div>
}
