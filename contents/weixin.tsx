import { saveAs } from "file-saver"
import JSZip from "jszip"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchor,
  PlasmoGetShadowHostId
} from "plasmo"
import React, { useState, type FC } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/dist/hook"

import WeixinPanel from "~component/ui/weixinPanel"
import { i18n, saveHtml, saveMarkdown, saveMarkdownWithLocalImages, saveWord } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useEditMarkdown } from "~utils/editMarkdownHook"
import makerQRPost from "~utils/makerQRPost"
import { useParseMarkdown } from "~utils/parseMarkdownHook"
import { Print } from "~utils/print"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://mp.weixin.qq.com/s/*", "https://mp.weixin.qq.com/s?src=*"]
}

const turndownService = Turndown()
const articleTitle = document
  .querySelector<HTMLMetaElement>('meta[property="og:title"]')
  .content.trim()

const HOST_ID = "codebox-weixin"
export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector("#activity-detail")

const formatLimit = 5
const formatList = new WeakMap()
const urlReg =
  /\b((?:https?:\/\/)?(?![\d-]+\.[\d-]+)([\w-]+(\.[\w-]+)+[\S^\"\'\[\]\{\}\>\<]*))/gi
const ignoreTags = [
  "SCRIPT",
  "STYLE",
  "A",
  "TEXTAREA",
  "NOSCRIPT",
  "CODE",
  "TITLE"
]
const formatLinks = (target: Node, nodes: NodeList) => {
  if (
    !(target instanceof HTMLElement) ||
    ignoreTags.includes(target.nodeName) ||
    target.translate === false
  )
    return

  const formatTimes = formatList.get(target) || 0
  if (formatTimes > formatLimit) return

  let modified = false
  nodes.forEach((node: any) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.match(urlReg)) {
      const newContent = node.textContent.replace(
        urlReg,
        (match) =>
          `<a href="${match.startsWith("http") ? match : "http://" + match}" 
             target="_blank" 
             style="color: #576b95; text-decoration: none;">
            ${match}
          </a>`
      )
      const wrapper = document.createElement("span")
      wrapper.innerHTML = newContent
      node.replaceWith(wrapper)
      modified = true
    }
  })

  if (modified) {
    formatList.set(target, formatTimes + 1)
  }
}

const queryChildElements = (element: Node) => {
  if (element instanceof Element) {
    ;[...element.querySelectorAll("*")].forEach((child) =>
      formatLinks(child, child.childNodes)
    )
  }
}

const createLinkObserver = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      formatLinks(mutation.target, mutation.addedNodes)
      mutation.addedNodes.forEach((node) => queryChildElements(node))
    })
  })

  return observer
}

const observer = createLinkObserver()
observer.observe(document, {
  subtree: true,
  childList: true,
  characterData: true
})

queryChildElements(document.documentElement)

const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [parseContent, setParseContent] = useParseMarkdown()
  const [allShowTag, setAllShowTag] = useStorage("config-allShowTag", true)
  const [showTag, setShowTag] = useStorage<boolean>("weixin-showTag", true)
  const [cssCode, runCss] = useCssCodeHook("weixin")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [content, setContent] = useEditMarkdown()
  const [isShow, setIsShow] = useState(true)

  useMessage(async (req: any, res: any) => {
    if (req.name == "weixin-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "weixin-editMarkdown") {
      editMarkdown()
    }
    if (req.name == "weixin-downloadMarkdown") {
      if (req.body?.action === "getMarkdown") {
        const html = document.querySelector("#img-content")
        const markdown = turndownService.turndown(html)
        res.send({ markdown, title: articleTitle })
      } else {
        downloadMarkdown()
      }
    }
    if (req.name == "weixin-downloadMarkdownWithImages") {
      await downloadMarkdownWithImages(req.body?.onProgress)
    }
    if (req.name == "weixin-downloadHtml") {
      downloadHtml()
    }
    if (req.name == "weixin-downloadPdf") {
      downloadPdf()
    }
    if (req.name == "weixin-downloadWord") {
      downloadWord()
    }
    if (req.name == "weixin-downloadImages") {
      await downloadImages(req.body?.onProgress)
    }
    if (req.name == "weixin-getThumbMedia") {
      getThumbMedia()
    }
  })

  function getThumbMedia() {
    const thumbMediaUrl = document.querySelector<HTMLMetaElement>(
      'meta[property="og:image"]'
    ).content
    thumbMediaUrl && window.open(thumbMediaUrl)
  }

  function getDescription() {
    const summary = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    ).content
    summary && prompt(i18n("getDescription"), summary)
  }

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

  async function downloadWord() {
    await scrollToLoadImages()
    const dom = document.querySelector("#img-content")
    saveWord(dom, articleTitle)
  }

  function editMarkdown() {
    const dom = document.querySelector("#img-content")
    setContent(dom, articleTitle)
  }

  async function scrollToLoadImages() {
    const article = document.querySelector("#js_content")
    if (!article) return

    // 平滑滚动到底部
    return new Promise<void>((resolve) => {
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      const scrollStep = 300 // 每次滚动的距离
      let currentScroll = 0

      const scrollInterval = setInterval(() => {
        currentScroll += scrollStep
        window.scrollTo(0, currentScroll)

        if (currentScroll >= scrollHeight - clientHeight) {
          clearInterval(scrollInterval)
          // 等待图片加载
          setTimeout(() => {
            window.scrollTo(0, 0) // 滚回顶部
            resolve()
          }, 500)
        }
      }, 100)
    })
  }

  async function downloadMarkdown() {
    await scrollToLoadImages()

    const html = document.querySelector("#img-content")
    const markdown = turndownService.turndown(html)
    await saveMarkdown(markdown, articleTitle)
  }

  async function downloadMarkdownWithImages(
    onProgress?: (current: number, total: number) => void
  ) {
    await scrollToLoadImages()

    const html = document.querySelector("#img-content")
    if (!html) return

    let markdown = turndownService.turndown(html)
    const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
    const imageEntries: { alt: string; url: string }[] = []
    let match
    while ((match = mdImageRegex.exec(markdown)) !== null) {
      const url = match[2]
      if (url && !url.startsWith("./images/")) {
        imageEntries.push({ alt: match[1], url })
      }
    }

    const zip = new JSZip()
    const title = articleTitle || document.title.trim()
    const total = imageEntries.length + 1

    const getExt = (url: string) => {
      const fmt = url.match(/wx_fmt=(\w+)/)?.[1] || ""
      if (fmt === "gif") return ".gif"
      if (fmt === "png" || fmt === "webp") return ".png"
      if (fmt === "bmp") return ".bmp"
      if (url.includes("mmbiz_gif")) return ".gif"
      if (url.includes("mmbiz_png") || url.includes("mmbiz_webp")) return ".png"
      return ".jpg"
    }

    // 下载图片并替换 markdown 中的 URL
    for (let i = 0; i < imageEntries.length; i++) {
      const { url } = imageEntries[i]
      try {
        const response = await fetch(url)
        const blob = await response.blob()
        const ext = getExt(url)
        const localPath = `./images/${i}${ext}`

        zip.file(`images/${i}${ext}`, blob)
        markdown = markdown.replace(url, localPath)

        if (onProgress) {
          onProgress(i + 1, total)
        }
      } catch (error) {
        console.error(`Failed to download image ${i}:`, error)
      }
    }

    // 添加 markdown 文件到 zip
    zip.file(`${title}.md`, markdown)

    if (onProgress) {
      onProgress(total, total)
    }

    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, `${title}.zip`)
  }

  function downloadHtml() {
    const dom = document.querySelector("#img-content")
    saveHtml(dom, articleTitle)
  }

  async function parseMarkdown() {
    const html = document.querySelector("#img-content")
    const markdown = turndownService.turndown(html)
    await saveMarkdownWithLocalImages(markdown, articleTitle)
  }

  function onClose() {
    setIsShow(false)
  }

  return showTag && isShow && allShowTag ? (
    <WeixinPanel
      onGetThumbMedia={getThumbMedia}
      onGetDescription={getDescription}
      onEditMarkdown={editMarkdown}
      onDownloadMarkdown={downloadMarkdown}
      onParseMarkdown={parseMarkdown}
      onDownloadMarkdownWithImages={() => downloadMarkdownWithImages()}
      onDownloadPdf={downloadPdf}
      onDownloadWord={downloadWord}
      onDownloadImages={() => downloadImages()}
      onMakerQRPost={() => makerQRPost()}
      onClose={onClose}
    />
  ) : (
    <></>
  )
}

export default PlasmoOverlay
