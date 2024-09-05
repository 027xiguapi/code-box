import { Readability } from "@mozilla/readability"
import { useEffect, useState } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import { addCss, saveHtml, setIcon } from "~tools"

const documentClone = document.cloneNode(true)
const article = new Readability(documentClone as Document, {}).parse()
setIcon(false)

export default function Custom() {
  const [runCss] = useStorage<boolean>("custom-runCss")
  const [cssCode] = useStorage<string>("custom-cssCode")
  const [closeLog] = useStorage("config-closeLog", true)
  const [codes, setCodes] = useState([])

  useEffect(() => {
    runCss && runCssFunc()
  }, [runCss])

  useMessage(async (req, res) => {
    if (req.name == "custom-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "getCodes") {
      res.send({ codes: getCodes() })
    }
    if (req.name == "scrollIntoViewCode") {
      scrollIntoViewCode(req.body)
    }
    if (req.name == "downloadCode") {
      downloadCode(req.body)
    }
  })

  /* 插入自定义css代码 */
  function runCssFunc() {
    closeLog || console.log("插入自定义css代码", cssCode)
    addCss(cssCode)
  }

  function getCodes() {
    let codes = []
    let codesTxt = []
    const _codes = document.querySelectorAll("code")
    _codes.forEach((code) => {
      const pre = code.closest("pre")
      if (pre) {
        codes.push(code)
        codesTxt.push(code.innerText.replace(/\n/g, ""))
      }
    })
    setCodes(codes)
    return codesTxt
  }

  function scrollIntoViewCode(data) {
    const code = codes[data.index]
    code.scrollIntoView()
  }

  function downloadCode(data) {
    const code = codes[data.index]
    saveHtml(code, article.title)
  }

  return <div style={{ display: "none" }}></div>
}
