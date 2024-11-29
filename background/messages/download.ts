import JSZip from "jszip"

import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  if (req.body.action === "downloadAllImage") {
    const { imageUrls, title } = req.body
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
