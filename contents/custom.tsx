import { Modal, message } from "antd"
import { useEffect, useState } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import { addCss, saveHtml, saveMarkdown, saveTxt, setIcon } from "~tools"
import Dom2Pdf from "~utils/html2Pdf"
import Turndown from "~utils/turndown"

const turndownService = Turndown()
const articleTitle = document.querySelector<HTMLElement>("head title").innerText

setIcon(false)

let isSelect = false
let isDownloadType = "markdown"

export default function Custom() {
  const [runCss] = useStorage<boolean>("custom-runCss")
  const [cssCode] = useStorage<string>("custom-cssCode")
  const [closeLog] = useStorage("config-closeLog", true)
  const [codes, setCodes] = useState([])

  useEffect(() => {
    getSelection("markdown")
  }, [])

  useEffect(() => {
    runCss && runCssFunc()
  }, [runCss])

  useMessage(async (req, res) => {
    if (req.name == "custom-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "custom-getCodes") {
      res.send({ codes: getCodes() })
    }
    if (req.name == "custom-scrollIntoViewCode") {
      scrollIntoViewCode(req.body)
    }
    if (req.name == "custom-downloadCode") {
      downloadCode(req.body)
    }
    if (req.name == "custom-downloadHtml") {
      isSelect = true
      isDownloadType = "html"
      message.info('请在页面选择要下载区域！')
    }
    if (req.name == "custom-downloadMarkdown") {
      isSelect = true
      isDownloadType = "markdown"
      message.info('请在页面选择要下载区域！')
    }
    if (req.name == "custom-downloadPdf") {
      isSelect = true
      isDownloadType = "pdf"
      message.info('请在页面选择要下载区域！')
    }
    if (req.name == "custom-downloadImg") {
      isSelect = true
      isDownloadType = "img"
      message.info('请在页面选择要下载区域！')
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
    const _codes = document.querySelectorAll("pre")
    _codes.forEach((code) => {
      let codeTxt = code.innerText
      if (code.querySelector("code")) {
        codeTxt = code.querySelector("code").innerText
      }
      codeTxt = codeTxt.replace(/\n/g, "")
      if (codeTxt.length > 8) {
        codes.push(code)
        codesTxt.push(codeTxt)
      }
    })
    setCodes(codes)
    return codesTxt
  }

  function scrollIntoViewCode(data) {
    const code = codes[data.index]
    code && code.scrollIntoView()
  }

  function downloadCode(data) {
    let code = codes[data.index]
    if (code && code.querySelector("code")) {
      code = code.querySelector("code")
    }
    code && saveTxt(code.innerText, articleTitle)
  }

  function getSelection(type) {
    addCss(`.codebox-current { border: 1px solid #7983ff; }`)
    document.addEventListener("mousemove", function (event) {
      const target = event.target as HTMLElement

      removeCurrentDom()
      isSelect && target.classList.add("codebox-current")
    })
    document.addEventListener("click", function (event) {
      if (!isSelect) return
      const currentDom = document.querySelector(".codebox-current")
      removeCurrentDom()
      isSelect = false
      Modal.confirm({
        title: "提示",
        content:(
            <>
              <div style={{fontSize: '18px'}}>是否保存？</div>
              <div style={{fontSize: '14px',color : 'red'}}>此功能限时免费免登录，预计10月份以后需要注册，后续可能收费...</div>
            </>
        ),
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          if (isDownloadType == "html") {
            downloadHtml(currentDom)
          } else if (isDownloadType == "markdown") {
            downloadMarkdown(currentDom)
          } else if (isDownloadType == "pdf") {
            downloadPdf(currentDom)
          } else if (isDownloadType == "img") {
            downloadImg(currentDom)
          }
        }
      })

      event.stopPropagation()
      event.preventDefault()
    })
  }

  function removeCurrentDom() {
    const currentList = document.querySelectorAll(".codebox-current")
    currentList.forEach((el) => {
      el.classList.remove("codebox-current")
    })
  }

  function downloadHtml(currentDom) {
    saveHtml(currentDom, articleTitle)
  }

  function downloadMarkdown(currentDom) {
    const markdown = turndownService.turndown(currentDom)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadPdf(currentDom) {
    const pdf = new Dom2Pdf(currentDom, articleTitle)
    pdf.downloadPdf()
  }

  function downloadImg(currentDom) {
    const img = new Dom2Pdf(currentDom, articleTitle)
    img.downloadImg()
  }

  return <div style={{ display: "none" }}></div>
}
