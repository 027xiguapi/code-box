import { saveAs } from "file-saver"
import JSZip from "jszip"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchor,
  PlasmoGetShadowHostId,
  PlasmoGetStyle
} from "plasmo"
import { useEffect, type FC } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/dist/hook"

import TagBtnStyle from "~component/tagBtn/style"
import Tags from "~component/ui/tags"
import { i18n, saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useEditMarkdown } from "~utils/editMarkdownHook"
import { useParseMarkdown } from "~utils/parseMarkdownHook"
import { Print } from "~utils/print"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://mp.weixin.qq.com/s/*"]
}

const turndownService = Turndown()
const articleTitle = document
  .querySelector<HTMLElement>("head title")
  .innerText.trim()

const HOST_ID = "codebox-weixin"
export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector("#img-content .rich_media_title")

export const getStyle: PlasmoGetStyle = () => TagBtnStyle()

const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [parseContent, setParseContent] = useParseMarkdown()
  const [showTag, setShowTag] = useStorage<boolean>("weixin-showTag", true)
  const [cssCode, runCss] = useCssCodeHook("weixin")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [content, setContent] = useEditMarkdown()

  useMessage(async (req: any, res: any) => {
    if (req.name == "weixin-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "weixin-editMarkdown") {
      editMarkdown()
    }
    if (req.name == "weixin-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "weixin-downloadHtml") {
      downloadHtml()
    }
    if (req.name == "weixin-downloadPdf") {
      downloadPdf()
    }
    if (req.name == "weixin-downloadImages") {
      await downloadImages(req.body?.onProgress)
    }
    if (req.name == "weixin-getThumbMedia") {
      const thumbMediaUrl = document.querySelector<HTMLMetaElement>(
        'meta[property="og:image"]'
      ).content
      thumbMediaUrl && window.open(thumbMediaUrl)
    }
  })

  async function downloadImages(
    onProgress?: (current: number, total: number) => void
  ) {
    const article = document.querySelector("#js_content")
    if (!article) return

    const images = Array.from(article.getElementsByTagName("img"))
    const imageUrls = images
      .map((img) => img.dataset.src || img.src)
      .filter((url) => url)
      .map((url) =>
        url.replace(
          "//res.wx.qq.com/mmbizwap",
          "https://res.wx.qq.com/mmbizwap"
        )
      )

    const zip = new JSZip()
    const title = document.title.trim()
    const total = imageUrls.length

    for (let i = 0; i < imageUrls.length; i++) {
      try {
        const response = await fetch(imageUrls[i])
        const blob = await response.blob()

        let ext = ".jpg"
        if (
          imageUrls[i].includes("wx_fmt=gif") ||
          imageUrls[i].includes("mmbiz_gif")
        ) {
          ext = ".gif"
        } else if (
          imageUrls[i].includes("wx_fmt=png") ||
          imageUrls[i].includes("mmbiz_png")
        ) {
          ext = ".png"
        } else if (
          imageUrls[i].includes("wx_fmt=bmp") ||
          imageUrls[i].includes("mmbiz_bmp")
        ) {
          ext = ".bmp"
        }

        zip.file(`${title}-${i}${ext}`, blob)

        if (onProgress) {
          onProgress(i + 1, total)
        }
      } catch (error) {
        console.error(`Failed to download image ${i}:`, error)
      }
    }

    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, `${title}-images.zip`)
  }

  function downloadPdf() {
    const article = document.querySelector<HTMLElement>("#img-content")
    if (article) {
      Print.print(article, { title: articleTitle })
        .then(() => console.log("Printing complete"))
        .catch((error) => console.error("Printing failed:", error))
    }
  }

  function editMarkdown() {
    const dom = document.querySelector("#img-content")
    setContent(dom, articleTitle)
  }

  function downloadMarkdown() {
    const html = document.querySelector("#img-content")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector("#img-content")
    saveHtml(dom, articleTitle)
  }

  function parseMarkdown() {
    const dom = document.querySelector("#img-content")
    setParseContent(dom)
  }

  return showTag ? (
    <Tags
      onEdit={editMarkdown}
      onDownload={downloadMarkdown}
      onPrint={downloadPdf}
      onParse={parseMarkdown}
    />
  ) : (
    <></>
  )
}

export default PlasmoOverlay
