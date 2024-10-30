import dayjs from "dayjs"
import { saveAs } from "file-saver"

import { sendToBackground } from "@plasmohq/messaging"

export function scrollToTop(element) {
  window.scrollTo({
    top: element.offsetTop,
    behavior: "smooth" // 可选，平滑滚动
  })
}

export function addCss(code, id?) {
  const style = document.createElement("style")
  const css = document.createTextNode(code)
  style.setAttribute("data-id", id || "codebox-css")
  style.appendChild(css)
  document.head.appendChild(style)
}

export function removeCss(id) {
  var style = document.querySelector(`[data-id="${id}"]`)
  style && style.remove()
}

export function addJs(code) {
  const script = document.createElement("script")
  // const js = document.createTextNode(`(()=>{${code}})()`)
  const js = document.createTextNode(code)
  script.appendChild(js)
  document.head.appendChild(script)
}

export function setIcon(active: boolean) {
  sendToBackground({
    name: "icon",
    body: {
      active: active
    }
  })
}

export function saveTxt(txt: string, filename?: string) {
  if (txt) {
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" })
    filename = filename || "CodeBox-page"
    saveAs(blob, `${filename}-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.txt`)
  }
}

export function saveHtml(dom: Element, filename?: string) {
  if (dom) {
    const htmlContent = dom.outerHTML
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" })
    filename = filename || "CodeBox-page"
    saveAs(blob, `${filename}-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.html`)
  }
}

export function saveMarkdown(markdown: string, filename?: string) {
  if (markdown) {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
    filename = filename || "CodeBox-page"
    saveAs(blob, `${filename}-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.md`)
  }
}

export function i18n(key: string) {
  return chrome.i18n.getMessage(key)
}

export function getMetaContentByProperty(metaProperty: string) {
  const metas = document.getElementsByTagName("meta")

  for (let i = 0; i < metas.length; i++) {
    if (metas[i].getAttribute("property") === metaProperty) {
      return metas[i].getAttribute("content")
    }
  }

  return ""
}

export function isValidUrl(urlString: string) {
  try {
    return Boolean(new URL(urlString))
  } catch (e) {
    return false
  }
}
