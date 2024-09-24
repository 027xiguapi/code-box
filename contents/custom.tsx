import { StyleProvider } from "@ant-design/cssinjs"
import {
  CheckOutlined,
  CloseOutlined,
  DownSquareOutlined,
  UpSquareOutlined
} from "@ant-design/icons"
import { FloatButton, message, Modal } from "antd"
import antdResetCssText from "data-text:antd/dist/reset.css"
import type { PlasmoCSConfig, PlasmoGetShadowHostId } from "plasmo"
import { useEffect, useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import { ThemeProvider } from "~theme"
import { addCss, saveHtml, saveMarkdown, saveTxt, setIcon } from "~tools"
import DrawImages from "~utils/drawImages"
import Dom2Pdf from "~utils/html2Pdf"
import Turndown from "~utils/turndown"

const turndownService = Turndown()
const articleTitle = document.querySelector<HTMLElement>("head title").innerText

setIcon(false)

const HOST_ID = "codebox-csui"

export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = antdResetCssText
  return style
}

let isDownloadType = "markdown"
let isReady = false
let isSelect = false
export default function CustomOverlay() {
  const [runCss] = useStorage<boolean>("custom-runCss")
  const [cssCode] = useStorage<string>("custom-cssCode")
  const [closeLog] = useStorage("config-closeLog", true)
  const [codes, setCodes] = useState([])
  const [isCurrentDom, setIsCurrentDom] = useState<boolean>(false)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    getSelection()
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
      isReady = true
      isSelect = false
      isDownloadType = "html"
      messageApi.info("请在页面选择要下载区域！")
    }
    if (req.name == "custom-downloadMarkdown") {
      isReady = true
      isSelect = false
      isDownloadType = "markdown"
      messageApi.info("请在页面选择要下载区域！")
    }
    if (req.name == "custom-downloadPdf") {
      isReady = true
      isSelect = false
      isDownloadType = "pdf"
      messageApi.info("请在页面选择要下载区域！")
    }
    if (req.name == "custom-downloadImg") {
      isReady = true
      isSelect = false
      isDownloadType = "img"
      messageApi.info("请在页面选择要下载区域！")
    }
    if (req.name == "app-full-page-screenshot") {
      const { scrollHeight, clientHeight } = document.documentElement
      const devicePixelRatio = window.devicePixelRatio || 1

      let capturedHeight = 0
      let capturedImages = []

      const captureAndScroll = async () => {
        const scrollAmount = clientHeight * devicePixelRatio
        const res = await sendToBackground({ name: "screenshot" })
        const dataUrl = res.dataUrl

        capturedHeight += scrollAmount
        if (capturedHeight < scrollHeight * devicePixelRatio) {
          capturedImages.push(dataUrl)
          window.scrollTo(0, capturedHeight)
          setTimeout(captureAndScroll, 2000) // Adjust the delay as needed
        } else {
          DrawImages(capturedImages, articleTitle)
        }
      }

      captureAndScroll()
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

  function getSelection() {
    addCss(`.codebox-current { border: 1px solid #7983ff; }`)
    document.addEventListener("mousemove", (event) => {
      const target = event.target as HTMLElement
      if (isReady && target && !isSelect) {
        removeCurrentDom()
        target.classList.add("codebox-current")
      }
    })
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement
      if (isReady && target) {
        isSelect = true
        setIsCurrentDom(true)
        removeCurrentDom()
        target.classList.add("codebox-current")
        event.stopPropagation()
        event.preventDefault()
        setTimeout(() => {
          if (confirm("是否下载？")) {
            handleDownload()
          }
        }, 1000)
      }
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

  function handleDownload() {
    const currentDom = document.querySelector(".codebox-current")
    removeCurrentDom()
    if (isDownloadType == "html") {
      downloadHtml(currentDom)
    } else if (isDownloadType == "markdown") {
      downloadMarkdown(currentDom)
    } else if (isDownloadType == "pdf") {
      downloadPdf(currentDom)
    } else if (isDownloadType == "img") {
      downloadImg(currentDom)
    }
    isReady = false
    isSelect = false
    setIsCurrentDom(false)
  }

  function handleConfirm() {
    Modal.confirm({
      title: "提示",
      content: (
        <>
          <div style={{ fontSize: "18px" }}>是否保存？</div>
          <div style={{ fontSize: "14px", color: "red" }}>
            此功能限时免费免登录，预计10月份以后需要注册，后续可能收费...
          </div>
        </>
      ),
      okText: "确认",
      cancelText: "取消",
      onOk: () => {
        handleDownload()
      }
    })
  }

  function handleCancel() {
    removeCurrentDom()
    isReady = false
    isSelect = false
    setIsCurrentDom(false)
  }

  function handleSetParent(event) {
    const currentDom = document.querySelector(".codebox-current")
    const parent = currentDom.parentElement

    if (parent) {
      removeCurrentDom()
      parent.classList.add("codebox-current")
    }
    event.stopPropagation()
  }

  function handleSetChild(event) {
    const currentDom = document.querySelector(".codebox-current")
    const child = currentDom.firstElementChild
    if (child) {
      removeCurrentDom()
      child.classList.add("codebox-current")
    }
    event.stopPropagation()
  }

  return (
    <ThemeProvider>
      {contextHolder}
      <StyleProvider container={document.getElementById(HOST_ID).shadowRoot}>
        {isCurrentDom ? (
          <FloatButton.Group
            shape="square"
            style={{ insetBlockStart: 80, insetBlockEnd: "auto" }}>
            <FloatButton
              icon={<CheckOutlined />}
              onClick={handleConfirm}
              tooltip="<div>确定</div>"
            />
            <FloatButton
              icon={<UpSquareOutlined />}
              onClick={handleSetParent}
              tooltip="父节点"
            />
            <FloatButton
              icon={<DownSquareOutlined />}
              onClick={handleSetChild}
              tooltip="子节点"
            />
            <FloatButton
              icon={<CloseOutlined />}
              onClick={handleCancel}
              tooltip="取消"
            />
          </FloatButton.Group>
        ) : (
          <></>
        )}
      </StyleProvider>
    </ThemeProvider>
  )
}
