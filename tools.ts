import dayjs from "dayjs"
import { saveAs } from "file-saver"

import { sendToBackground } from "@plasmohq/messaging"

export function scrollToTop(element) {
  window.scrollTo({
    top: element.offsetTop - 50,
    behavior: "smooth" // 可选，平滑滚动
  })
}

export function addCss(code, id?) {
  const style = document.createElement("style")
  const css = document.createTextNode(code)
  style.setAttribute("data-id", id || "codebox-css")
  style.appendChild(css)
  document.head.appendChild(style)
}

export function removeCss(id) {
  var style = document.querySelector(`[data-id="${id}"]`)
  style && style.remove()
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

export function saveTxt(txt: string, filename?: string) {
  if (txt) {
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" })
    filename = filename || "CodeBox-page"
    saveAs(blob, `${filename}-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.txt`)
  }
}

export function saveHtml(dom: Element, filename?: string) {
  if (dom) {
    const htmlContent = dom.outerHTML
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" })
    filename = filename || "CodeBox-page"
    saveAs(blob, `${filename}-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.html`)
  }
}

export function saveMarkdown(markdown: string, filename?: string) {
  if (markdown) {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
    filename = filename || "CodeBox-page"
    saveAs(blob, `${filename}-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.md`)
  }
}

export async function saveMarkdownWithLocalImages(markdown: string, filename?: string) {
  if (!markdown) return

  // 匹配 markdown 中的图片链接 ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  const images: { alt: string; url: string; index: number }[] = []
  let match

  while ((match = imageRegex.exec(markdown)) !== null) {
    images.push({
      alt: match[1],
      url: match[2],
      index: match.index
    })
  }

  if (images.length === 0) {
    // 没有图片，直接保存
    saveMarkdown(markdown, filename)
    return
  }

  // 下载所有图片并转换为 base64
  const imagePromises = images.map(async (img) => {
    try {
      const response = await fetch(img.url)
      const blob = await response.blob()
      return new Promise<{ url: string; base64: string }>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve({
            url: img.url,
            base64: reader.result as string
          })
        }
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error(`Failed to download image: ${img.url}`, error)
      return { url: img.url, base64: img.url } // 失败时保持原 URL
    }
  })

  const downloadedImages = await Promise.all(imagePromises)

  // 替换 markdown 中的图片 URL 为 base64
  let updatedMarkdown = markdown
  downloadedImages.forEach((img) => {
    updatedMarkdown = updatedMarkdown.replace(
      new RegExp(`\\(${img.url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`, "g"),
      `(${img.base64})`
    )
  })

  // 保存更新后的 markdown
  const blob = new Blob([updatedMarkdown], { type: "text/markdown;charset=utf-8" })
  filename = filename || "CodeBox-page"
  saveAs(blob, `${filename}-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.md`)
}

export function saveWord(dom: Element, filename?: string) {
  if (dom) {
    const content = dom.innerHTML
    const fullHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>${filename || "CodeBox-page"}</title>
<style>
  body { font-family: '宋体', SimSun, serif; font-size: 14pt; line-height: 1.8; padding: 20px; }
  img { max-width: 100%; height: auto; }
  h1, h2, h3, h4 { font-family: '黑体', SimHei, sans-serif; }
  pre, code { font-family: 'Courier New', monospace; font-size: 12pt; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #ccc; padding: 6px; }
  a { color: #576b95; }
</style>
</head>
<body>
${content}
</body>
</html>`
    const blob = new Blob([fullHtml], {
      type: "application/msword;charset=utf-8"
    })
    filename = filename || "CodeBox-page"
    saveAs(blob, `${filename}-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.doc`)
  }
}

export function i18n(key: string) {
  return chrome.i18n.getMessage(key)
}

export function getMetaContentByProperty(metaProperty: string) {
  const metas = document.getElementsByTagName("meta")

  for (let i = 0; i < metas.length; i++) {
    if (metas[i].getAttribute("property") === metaProperty) {
      return metas[i].getAttribute("content")
    }
  }

  return ""
}

export function isValidUrl(urlString: string) {
  try {
    return Boolean(new URL(urlString))
  } catch (e) {
    return false
  }
}
