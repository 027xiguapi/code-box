import { StyleProvider } from "@ant-design/cssinjs"
import {
  CheckOutlined,
  CloseOutlined,
  DownSquareOutlined,
  UpSquareOutlined
} from "@ant-design/icons"
import { Button, Flex, message, Modal } from "antd"
import antdResetCssText from "data-text:antd/dist/reset.css"
import dayjs from "dayjs"
import type { PlasmoCSConfig, PlasmoGetShadowHostId } from "plasmo"
import { useEffect, useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import ValidateContent from "~component/contents/validateContent"
import { ThemeProvider } from "~theme"
import { addCss, saveHtml, saveMarkdown, saveTxt, setIcon } from "~tools"
import DrawImages from "~utils/drawImages"
import { useContent } from "~utils/editMarkdownHook"
import Dom2Pdf from "~utils/html2Pdf"
import Turndown from "~utils/turndown"

const turndownService = Turndown()
const articleTitle =
  document.querySelector<HTMLElement>("head title")?.innerText

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
  const [codesDom, setCodesDom] = useState([])
  const [codes, setCodes] = useStorage("app-codes", [])
  const [content, setContent] = useContent()
  const [validTime, setValidTime] = useStorage("app-validTime", "1730390400")
  const [isCurrentDom, setIsCurrentDom] = useState<boolean>(false)
  const [rect, setRect] = useState<any>(() => {
    return { top: 0, right: 0 }
  })
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    getSelection()
    getCodes()
  }, [])

  useEffect(() => {
    runCss && runCssFunc()
  }, [runCss])

  useMessage(async (req, res) => {
    if (req.name == "custom-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "custom-scrollIntoViewCode") {
      scrollIntoViewCode(req.body)
    }
    if (req.name == "custom-downloadCode") {
      downloadCode(req.body)
    }
    if (req.name == "custom-downloadHtml") {
      setCustom("html")
    }
    if (req.name == "custom-downloadMarkdown") {
      setCustom("downloadMarkdown")
    }
    if (req.name == "custom-downloadPdf") {
      setCustom("pdf")
    }
    if (req.name == "custom-downloadImg") {
      setCustom("img")
    }
    if (req.name == "custom-editMarkdown") {
      setCustom("editMarkdown")
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
    setCodesDom(codes)
    setCodes(codesTxt)
  }

  function scrollIntoViewCode(data) {
    const code = codesDom[data.index]
    code && code.scrollIntoView()
  }

  function downloadCode(data) {
    let code = codesDom[data.index]
    if (code && code.querySelector("code")) {
      code = code.querySelector("code")
    }
    code && saveTxt(code.innerText, articleTitle)
  }

  function setCustom(type) {
    isReady = true
    isSelect = false
    isDownloadType = type
    messageApi.info("请在页面选择要下载区域！")
  }

  function getSelection() {
    addCss(`.codebox-current { border: 1px solid #7983ff!important; }`)
    document.addEventListener("mousemove", (event) => {
      const target = event.target as HTMLElement
      if (isReady && target && !isSelect) {
        removeCurrentDom()
        target.classList.add("codebox-current")
      }
    })
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement
      const tooltip = target.closest("#codebox-csui")
      const modal = target.closest(".ant-modal")
      if (isReady && target && !tooltip && !modal) {
        isSelect = true
        setIsCurrentDom(true)
        removeCurrentDom()
        target.classList.add("codebox-current")
        setTooltip()
        event.stopPropagation()
        event.preventDefault()
      }
    })
  }

  function setTooltip() {
    const currentDom = document.querySelector<HTMLElement>(".codebox-current")
    const rect = currentDom.getBoundingClientRect()
    const distanceTop = rect.top + window.scrollY
    const distanceLeft = rect.left + window.scrollX
    const top = distanceTop < 50 ? distanceTop + 10 : distanceTop - 40
    const left = distanceLeft + 10

    setRect({ top, left })
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

  function handleOk() {
    const currentDom = document.querySelector(".codebox-current")
    removeCurrentDom()
    if (isDownloadType == "html") {
      downloadHtml(currentDom)
    } else if (isDownloadType == "downloadMarkdown") {
      downloadMarkdown(currentDom)
    } else if (isDownloadType == "editMarkdown") {
      setContent(".codebox-current")
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
          <ValidateContent></ValidateContent>
        </>
      ),
      okText: "确认",
      okButtonProps: {
        disabled: Number(validTime) > dayjs().unix()
      },
      onOk: () => {
        handleOk()
      },
      cancelText: "取消",
      onCancel: () => {
        handleCancel()
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
      setTooltip()
    }
    event.stopPropagation()
  }

  function handleSetChild(event) {
    const currentDom = document.querySelector(".codebox-current")
    const child = currentDom.firstElementChild
    if (child) {
      removeCurrentDom()
      child.classList.add("codebox-current")
      setTooltip()
    }
    event.stopPropagation()
  }

  return (
    <ThemeProvider>
      {contextHolder}
      <StyleProvider container={document.getElementById(HOST_ID).shadowRoot}>
        {isCurrentDom ? (
          <div
            className="codebox-tooltip"
            style={{
              position: "absolute",
              top: `${rect.top}px`,
              left: `${rect.left}px`,
              width: "390px",
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: "5px"
            }}>
            <Flex wrap gap="small">
              <Button
                color="primary"
                variant="text"
                icon={<CheckOutlined />}
                onClick={handleConfirm}>
                确定
              </Button>
              <Button
                color="default"
                variant="text"
                icon={<UpSquareOutlined />}
                onClick={handleSetParent}>
                父节点
              </Button>
              <Button
                color="default"
                variant="text"
                icon={<DownSquareOutlined />}
                onClick={handleSetChild}>
                子节点
              </Button>
              <Button
                color="danger"
                variant="text"
                icon={<CloseOutlined />}
                onClick={handleCancel}>
                取消
              </Button>
            </Flex>
          </div>
        ) : (
          <></>
        )}
      </StyleProvider>
    </ThemeProvider>
  )
}
