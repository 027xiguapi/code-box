import { saveAs } from "file-saver"

import { sendToBackground } from "@plasmohq/messaging"

export function addCss(code) {
  const style = document.createElement("style")
  const css = document.createTextNode(code)
  style.appendChild(css)
  document.head.appendChild(style)
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

export function saveHtml(dom: Element) {
  if (dom) {
    const htmlContent = dom.outerHTML
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" })
    saveAs(blob, "page.html")
  }
}
