import dayjs from "dayjs"
import { saveAs } from "file-saver"
import JSZip from "jszip"

export async function downloadAllImagesAsZip(filename?: string) {
  const zip = new JSZip() // 创建 ZIP 文件
  const imgFolder = zip.folder("images") // 创建一个文件夹存储图片
  const images = document.querySelectorAll("img") // 获取所有 img 元素
  const fetchPromises = []

  images.forEach((img, index) => {
    fetchPromises.push(
      new Promise((resolve) => {
        console.log(img.src)
        fetch(img.src)
          .then((response) => response.blob())
          .then((blob) => {
            const imgElement = new Image()
            imgElement.crossOrigin = "Anonymous"
            imgElement.src = URL.createObjectURL(blob)
            imgElement.onload = function () {
              const canvas = document.createElement("canvas")
              canvas.width = imgElement.naturalWidth
              canvas.height = imgElement.naturalHeight
              const context = canvas.getContext("2d")
              context.drawImage(imgElement, 0, 0) // 将图片绘制到 Canvas
              canvas.toBlob((blob) => {
                const ext = "png" // 使用 PNG 格式
                imgFolder.file(`image_${index + 1}.${ext}`, blob)
              })
            }
            imgElement.onerror = resolve
          })
      })
    )
  })

  await Promise.all(fetchPromises) // 等待所有图片处理完成

  zip
    .generateAsync({ type: "blob" }) // 生成 ZIP 文件
    .then((content) => {
      filename = filename || "CodeBox-page"
      saveAs(
        content,
        `${filename}-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.zip`
      ) // 使用 FileSaver 保存 ZIP 文件
    })
    .catch((err) => console.error(`Error generating ZIP: ${err}`))
}
