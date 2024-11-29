import { StyleProvider } from "@ant-design/cssinjs"
import {
  CheckOutlined,
  CloseOutlined,
  DownSquareOutlined,
  LeftSquareOutlined,
  RightSquareOutlined,
  UpSquareOutlined
} from "@ant-design/icons"
import { Button, Flex, message, Modal } from "antd"
import antdResetCssText from "data-text:antd/dist/reset.css"
import dayjs from "dayjs"
import type {
  PlasmoCSConfig,
  PlasmoGetShadowHostId,
  PlasmoGetStyle
} from "plasmo"
import { useEffect, useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import ValidateContent from "~component/contents/validateContent"
import { ThemeProvider } from "~theme"
import { addCss, saveHtml, saveMarkdown, scrollToTop, setIcon } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { downloadAllImagesAsZip } from "~utils/downloadAllImg"
import { savePdf } from "~utils/downloadPdf"
import DrawImages from "~utils/drawImages"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

const turndownService = Turndown()
const articleTitle = document
  .querySelector<HTMLElement>("head title")
  ?.innerText.trim()

const HOST_ID = "codebox-csui"

export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")

  style.textContent = antdResetCssText
  return style
}

let isDownloadType = "markdown"
let isReady = false
let isSelect = false
let instance = null

export default function CustomOverlay() {
  const [cssCode, runCss] = useCssCodeHook("custom")
  const [content, setContent] = useContent()
  const [validTime, setValidTime] = useStorage("app-validTime", "1730390400")
  const [isCurrentDom, setIsCurrentDom] = useState<boolean>(false)
  const [rect, setRect] = useState<any>(() => {
    return { top: 0, right: 0 }
  })
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    getSelection()
    setIcon(true)
  }, [])

  useMessage(async (req, res) => {
    if (req.name == "custom-isShow") {
      res.send({ isShow: true })
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
    if (req.name == "app-downloadAllImg") {
      const imageUrls = Array.from(document.images).map((img) => img.src)

      // res.send({ imageUrls, title: articleTitle })
      const res = await sendToBackground({
        name: "download",
        body: {
          action: "downloadAllImage",
          imageUrls: imageUrls,
          title: articleTitle
        }
      })
      if (res.code == 0) {
        alert("下载失败")
      }
    }
    if (req.name == "app-full-page-screenshot") {
      if (confirm("确认下载？")) {
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
    }
  })

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
      const submit = target.closest(".valid-submit")

      if (isReady && target && !tooltip && !modal && !submit) {
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
    const top = distanceTop < 50 ? distanceTop + 15 : distanceTop - 40
    const left = distanceLeft + 5

    setRect({ top, left })
    scrollToTop(currentDom)
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

  function handleOk() {
    const currentDom = document.querySelector(".codebox-current")

    if (isDownloadType == "html") {
      removeCurrentDom()
      downloadHtml(currentDom)
    } else if (isDownloadType == "downloadMarkdown") {
      removeCurrentDom()
      downloadMarkdown(currentDom)
    } else if (isDownloadType == "editMarkdown") {
      setContent(".codebox-current")
      removeCurrentDom()
    } else if (isDownloadType == "pdf") {
      removeCurrentDom()
      savePdf(currentDom, articleTitle)
    }
    isReady = false
    isSelect = false
    setIsCurrentDom(false)
    instance.destroy()
  }

  function handleConfirm() {
    instance = Modal.confirm({
      title: "提示",
      content: (
        <>
          <div style={{ fontSize: "18px" }}>是否保存？</div>
          {Number(validTime) > dayjs().unix() ? (
            <></>
          ) : (
            <ValidateContent handleOk={handleOk}></ValidateContent>
          )}
        </>
      ),
      okText: "确认",
      okButtonProps: {
        disabled: Number(validTime) <= dayjs().unix()
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
    instance.destroy()
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

  function handleSetPrev(event) {
    const currentDom = document.querySelector(".codebox-current")
    const previousSibling = currentDom.previousElementSibling
    if (previousSibling) {
      removeCurrentDom()
      previousSibling.classList.add("codebox-current")
      setTooltip()
    }
    event.stopPropagation()
  }

  function handleSetNext(event) {
    const currentDom = document.querySelector(".codebox-current")
    const nextSibling = currentDom.nextElementSibling
    if (nextSibling) {
      removeCurrentDom()
      nextSibling.classList.add("codebox-current")
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
              width: "520px",
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: "5px"
            }}>
            <Flex wrap gap="small">
              <Button
                color="primary"
                variant="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={handleConfirm}>
                确定
              </Button>
              <Button
                color="default"
                variant="text"
                size="small"
                icon={<UpSquareOutlined />}
                onClick={handleSetParent}>
                父节点
              </Button>
              <Button
                color="default"
                variant="text"
                size="small"
                icon={<DownSquareOutlined />}
                onClick={handleSetChild}>
                子节点
              </Button>
              <Button
                color="default"
                variant="text"
                size="small"
                icon={<LeftSquareOutlined />}
                onClick={handleSetPrev}>
                上一个
              </Button>
              <Button
                color="default"
                variant="text"
                size="small"
                icon={<RightSquareOutlined />}
                onClick={handleSetNext}>
                下一个
              </Button>
              <Button
                color="danger"
                variant="text"
                size="small"
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
