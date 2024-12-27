import { StyleProvider } from "@ant-design/cssinjs"
import antdResetCssText from "data-text:antd/dist/reset.css"
import type {
  PlasmoCSConfig,
  PlasmoGetShadowHostId,
  PlasmoGetStyle
} from "plasmo"
import { useEffect, useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import CustomDomSelector from "~component/customDomSelector"
import { ThemeProvider } from "~theme"
import { setIcon } from "~tools"
import { getSummary } from "~utils/coze"
import DrawImages from "~utils/drawImages"

const HOST_ID = "codebox-csui"

export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")

  style.textContent = antdResetCssText
  return style
}

const articleTitle = document
  .querySelector<HTMLElement>("head title")
  ?.innerText.trim()

export default function CustomOverlay() {
  const [summary, setSummary] = useStorage("app-summary", "")

  useEffect(() => {
    setIcon(true)
  }, [])

  useMessage(async (req: any, res: any) => {
    if (req.name == "app-downloadImages") {
      await downloadImages(req.body?.onProgress)
    }
    if (req.name == "app-get-summary") {
      setSummary("")
      const res = await getSummary(location.href)
      if (res.code == 0) {
        const result = JSON.parse(res.data)
        setSummary(result)
      }
    }
    if (req.name == "app-full-page-screenshot") {
      if (confirm("确认截图？")) {
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

  async function downloadImages(
    onProgress?: (current: number, total: number) => void
  ) {
    const imageUrls = Array.from(document.images).map((img) => img.src)
    try {
      const res = await sendToBackground({
        name: "download",
        body: {
          action: "downloadAllImages",
          imageUrls: imageUrls,
          title: articleTitle,
          onProgress: onProgress
        }
      })
      if (res.code == 0) {
        alert("下载失败")
      }
    } catch (error) {
      console.error(`Failed to download images:`, error)
    }
  }

  return (
    <ThemeProvider>
      <StyleProvider container={document.getElementById(HOST_ID).shadowRoot}>
        <CustomDomSelector />
      </StyleProvider>
    </ThemeProvider>
  )
}
