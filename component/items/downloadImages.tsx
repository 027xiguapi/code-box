import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"
import { useState } from "react"

import { sendToContentScript } from "@plasmohq/messaging"

import { i18n } from "~tools"

export default function DownloadImages({ name }) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleDownload = async () => {
    if (isDownloading) return

    try {
      setIsDownloading(true)
      setProgress(0)

      const res = await sendToContentScript({
        name: `${name}-downloadImages`,
        body: {
          onProgress: (current, total) => {
            const percentage = Math.round((current / total) * 100)
            setProgress(percentage)
          }
        }
      })
    } catch (error) {
      console.error("Failed to download images:", error)
    } finally {
      setIsDownloading(false)
      setProgress(0)
    }
  }

  return (
    <div
      className={`item download ${isDownloading ? "downloading" : ""}`}
      onClick={handleDownload}
      style={{
        opacity: isDownloading ? 0.7 : 1,
        cursor: isDownloading ? "not-allowed" : "pointer"
      }}>
      <span>
        <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
        {isDownloading
          ? `${i18n("downloading")} (${progress}%)`
          : i18n("downloadAllImg")}
      </span>
      <DownloadOutlined
        style={{
          color: isDownloading ? "#999" : "#52c41a",
          fontSize: "16px"
        }}
      />
    </div>
  )
}
