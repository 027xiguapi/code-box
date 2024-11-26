import dayjs from "dayjs"
import { saveAs } from "file-saver"
import JSZip from "jszip"

export async function downloadAllImagesAsZip(filename?: string) {
  const zip = new JSZip() // 创建 ZIP 文件
  const imgFolder = zip.folder("images") // 创建一个文件夹存储图片
  const images = document.querySelectorAll("img") // 获取所有 img 元素
  const fetchPromises = []

  images.forEach((img, index) => {
    const imgUrl = img.src // 获取图片 URL
    fetchPromises.push(
      fetch(imgUrl)
        .then((response) => {
          if (!response.ok) throw new Error(`Failed to fetch ${imgUrl}`)
          return response.blob() // 转为 Blob 数据
        })
        .then((blob) => {
          const ext = imgUrl.split(".").pop().split("?")[0] || "jpg" // 推断图片扩展名
          imgFolder.file(`image_${index + 1}.${ext}`, blob) // 添加图片到 ZIP
        })
        .catch((err) => console.error(`Error fetching image: ${err}`))
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
