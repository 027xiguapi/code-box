import JSZip from "jszip"

import type { PlasmoMessaging } from "@plasmohq/messaging"

function mimeToExt(type: string) {
  if (!type) return ""
  if (type.includes("png")) return "png"
  if (type.includes("webp")) return "webp"
  if (type.includes("gif")) return "gif"
  if (type.includes("jpeg") || type.includes("jpg")) return "jpg"
  return ""
}

function getImageExt(type: string, url: string) {
  if (type.includes("png")) return "png"
  if (type.includes("webp")) return "webp"
  if (type.includes("gif")) return "gif"
  if (type.includes("jpeg") || type.includes("jpg")) return "jpg"
  const match = url.match(/\.(png|jpe?g|webp|gif)(?:[?#]|$)/i)
  return match ? match[1].toLowerCase().replace("jpeg", "jpg") : "jpg"
}

function safeFolderName(name: string) {
  return (
    (name || "ChatGPT")
      .replace(/[\\/:*?"<>|\r\n]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60) || "ChatGPT"
  )
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function downloadUrl(url: string, filename: string): Promise<number> {
  return new Promise((resolve, reject) => {
    chrome.downloads.download(
      { url, filename, conflictAction: "uniquify" },
      (downloadId) => {
        if (chrome.runtime.lastError || downloadId === undefined) {
          reject(new Error(chrome.runtime.lastError?.message || "download failed"))
          return
        }
        resolve(downloadId)
      }
    )
  })
}

// CDN 图片 URL 通常没有扩展名，先用 HEAD 探测类型
async function getImageTypeByHead(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD", credentials: "include" })
    if (!response.ok) return ""
    return response.headers.get("content-type") || ""
  } catch {
    return ""
  }
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { imageUrls, title, action, onProgress } = req.body

  // 逐张保存图片（用于 ChatGPT 等图片 CDN 不支持 CORS 的站点）
  if (action === "downloadImages") {
    const images: string[] = Array.isArray(req.body.images) ? req.body.images : []
    if (images.length === 0) {
      res.send({ code: 0, msg: "no images" })
      return
    }

    const folder = `chatgpt/${safeFolderName(title)}`
    let count = 0

    for (let i = 0; i < images.length; i++) {
      try {
        const url = images[i]
        const index = String(i + 1).padStart(2, "0")
        const headType = await getImageTypeByHead(url)
        const headExt = headType.includes("image/") ? mimeToExt(headType) : ""

        if (headExt) {
          // 直接用原 URL 交给浏览器下载：无 CORS/大小限制，filename 生效
          await downloadUrl(url, `${folder}/${index}.${headExt}`)
        } else {
          // HEAD 不可用时抓一次，按 blob 类型判断扩展名
          const response = await fetch(url, { credentials: "include" })
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const blob = await response.blob()
          const ext = mimeToExt(blob.type) || getImageExt("", url)
          const dataUrl = await blobToDataUrl(blob)
          await downloadUrl(dataUrl, `${folder}/${index}.${ext}`)
        }
        count++
      } catch (error) {
        console.error(`Failed to download image ${i}:`, error)
      }
    }

    res.send({ code: 200, count })
    return
  }

  if (action === "downloadAllImages") {
    const zip = new JSZip()

    const fetchImage = (url) => {
      return fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          const fileName = url.split("/").pop().split("?")[0]
          return { blob, fileName }
        })
    }

    Promise.all(imageUrls.map(fetchImage))
      .then((results) => {
        results.forEach(({ blob, fileName }, index) => {
          onProgress && onProgress(index + 1, imageUrls.length)
          zip.file(fileName || `image-${index}.jpg`, blob)
        })

        return zip.generateAsync({ type: "blob" })
      })
      .then((zipBlob) => {
        const reader = new FileReader()
        reader.onload = function (event) {
          const dataUrl = event.target.result as string

          chrome.downloads.download(
            {
              url: dataUrl,
              filename: `${title}.zip`
            },
            () => {
              res.send({ code: 200, msg: "success" })
            }
          )
        }
        reader.readAsDataURL(zipBlob)
      })
      .catch((err) => {
        console.error(err)
        res.send({ code: 0, msg: err })
      })
  }
}

export default handler
