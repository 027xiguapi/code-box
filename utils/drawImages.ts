import dayjs from "dayjs"
import { saveAs } from "file-saver"

export default function DrawImages(images, filename) {
  if (images.length === 0) {
    console.error("No images captured.")
    return
  }

  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  const firstImage = new Image()
  firstImage.onload = () => {
    canvas.width = firstImage.width
    canvas.height = images.length * firstImage.height

    let imagesLoaded = 0

    const drawImageOnCanvas = (image, index) => {
      context.drawImage(image, 0, index * firstImage.height)
      imagesLoaded++

      if (imagesLoaded === images.length) {
        filename = filename || "CodeBox-page"
        canvas.toBlob(function (blob) {
          saveAs(
            blob,
            `${filename}-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.png`
          )
        })
      }
    }

    images.forEach((dataUrl, index) => {
      const image = new Image()
      image.onload = () => drawImageOnCanvas(image, index)
      image.src = dataUrl
    })
  }

  firstImage.src = images[0]
}
