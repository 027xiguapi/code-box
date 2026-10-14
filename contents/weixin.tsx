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
  matches: [
    "https://mp.weixin.qq.com/s/*",
    "https://mp.weixin.qq.com/s?*"
  ]
}

const turndownService = Turndown()

function getArticleTitle() {
  return (
    document
      .querySelector<HTMLMetaElement>('meta[property="og:title"]')
      ?.content?.trim() ||
    document
      .querySelector("#js_image_content .rich_media_title, #activity-name")
      ?.textContent?.trim() ||
    document.title.trim()
  )
}

// 图片消息（新版图文/分享页，根容器为 #js_article.share_content_page）
function isImageArticle() {
  return !!document.querySelector(
    "#js_image_content, #img_list, .share_content_page"
  )
}

function normalizeArticleImageUrl(url: string) {
  let result = url.trim()
  if (result.startsWith("//")) result = "https:" + result
  // tp=webp 是压缩预览图，去掉后尽量取原图
  return result.replace(/([?&])tp=webp(?=&|$)/, "$1")
}

// 图片消息的图片列表：优先 swiper 的 data-src（原图），否则回退到 img.src
function getImageArticleImages() {
  const urls: string[] = []
  const seen = new Set<string>()
  const push = (raw?: string | null) => {
    if (!raw) return
    const url = normalizeArticleImageUrl(raw)
    if (url && !seen.has(url)) {
      seen.add(url)
      urls.push(url)
    }
  }

  // 占位区 #img_list 只有首图，真实列表由 Vue 渲染在 #page_top_area
  document
    .querySelectorAll<HTMLElement>(".swiper_item[data-src]")
    .forEach((item) => push(item.getAttribute("data-src")))

  if (urls.length === 0) {
    document
      .querySelectorAll<HTMLImageElement>(".swiper_item_img img")
      .forEach((img) => push(img.currentSrc || img.src))
  }

  return urls
}

// 图片消息没有 #img-content，拼一个等价的内容节点供 markdown/html/word/pdf 导出
function getImageArticleDom() {
  const container = document.createElement("div")
  container.id = "codebox-weixin-image-article"

  const title = getArticleTitle()
  if (title) {
    const h1 = document.createElement("h1")
    h1.textContent = title
    container.appendChild(h1)
  }

  const desc = document.querySelector("#js_image_desc")
  if (desc) {
    // <br><br> 作段落分隔，单个 <br> 保留为行内换行
    desc.innerHTML
      .split(/(?:<br\s*\/?>\s*){2,}/i)
      .forEach((html) => {
        const p = document.createElement("p")
        p.innerHTML = html
        container.appendChild(p)
      })
  }

  getImageArticleImages().forEach((url) => {
    const p = document.createElement("p")
    const img = document.createElement("img")
    img.setAttribute("src", url)
    p.appendChild(img)
    container.appendChild(p)
  })

  return container
}

function getArticleDom(): HTMLElement | null {
  return (
    document.querySelector<HTMLElement>("#img-content") ||
    (isImageArticle() ? getImageArticleDom() : null)
  )
}

const HOST_ID = "codebox-weixin"
export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector("#activity-detail") ||
  document.querySelector("#js_image_content") ||
  document.querySelector("#js_content")

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
        const html = getArticleDom()
        const markdown = html ? turndownService.turndown(html) : ""
        res.send({ markdown, title: getArticleTitle() })
      } else {
        downloadMarkdown()
      }
    }
    if (req.name == "weixin-downloadMarkdownWithImages") {
      await downloadMarkdownWithImages(req.body?.onProgress)
      res.send({ ok: true })
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
      res.send({ ok: true })
    }
    if (req.name == "weixin-getThumbMedia") {
      getThumbMedia()
    }
  })

  function getThumbMedia() {
    const ogImage = document.querySelector<HTMLMetaElement>(
      'meta[property="og:image"]'
    )?.content
    const thumbMediaUrl = ogImage || getImageArticleImages()[0]
    thumbMediaUrl && window.open(thumbMediaUrl)
  }

  function getDescription() {
    const summary =
      document.querySelector<HTMLMetaElement>('meta[name="description"]')
        ?.content || document.querySelector("#js_image_desc")?.textContent
    summary && prompt(i18n("getDescription"), summary)
  }

  async function downloadImages(
    onProgress?: (current: number, total: number) => void
  ) {
    let imageUrls: string[] = []

    if (isImageArticle()) {
      imageUrls = getImageArticleImages()
    } else {
      const article = document.querySelector("#js_content")
      if (!article) return

      const images = Array.from(article.getElementsByTagName("img"))
      imageUrls = images
        .map((img) => img.dataset.src || img.src)
        .filter((url) => url)
        .map((url) =>
          url.replace(
            "//res.wx.qq.com/mmbizwap",
            "https://res.wx.qq.com/mmbizwap"
          )
        )
    }

    const zip = new JSZip()
    const title = getArticleTitle()
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
    const article = getArticleDom()
    if (article) {
      Print.print(article, { title: getArticleTitle() })
        .then(() => console.log("Printing complete"))
        .catch((error) => console.error("Printing failed:", error))
    }
  }

  async function downloadWord() {
    await scrollToLoadImages()
    const dom = getArticleDom()
    saveWord(dom, getArticleTitle())
  }

  function editMarkdown() {
    const dom = getArticleDom()
    setContent(dom, getArticleTitle())
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

    const html = getArticleDom()
    if (!html) return
    const markdown = turndownService.turndown(html)
    await saveMarkdown(markdown, getArticleTitle())
  }

  async function downloadMarkdownWithImages(
    onProgress?: (current: number, total: number) => void
  ) {
    await scrollToLoadImages()

    const html = getArticleDom()
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
    const title = getArticleTitle()
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
    const dom = getArticleDom()
    saveHtml(dom, getArticleTitle())
  }

  async function parseMarkdown() {
    const html = getArticleDom()
    if (!html) return
    const markdown = turndownService.turndown(html)
    await saveMarkdownWithLocalImages(markdown, getArticleTitle())
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
