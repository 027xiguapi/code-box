import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"
import { useImperativeHandle } from "react"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import { i18n } from "~tools"

export default function Config({ forwardRef }) {
  const [copyCode, setCopyCode] = useStorage("config-copyCode", (v) =>
    v === undefined ? true : v
  )
  const [closeLog, setCloseLog] = useStorage("config-closeLog", (v) =>
    v === undefined ? true : v
  )

  async function downloadImg() {
    const res = await sendToContentScript({
      name: "app-downloadAllImg"
    })
    // const result = await sendToBackground({
    //   name: "download",
    //   body: {
    //     action: "downloadAllImage",
    //     imageUrls: res.imageUrls,
    //     title: res.title
    //   }
    // })
  }

  function downloadFullImg() {
    sendToContentScript({
      name: "app-full-page-screenshot"
    })
  }

  function handleReset() {
    setCopyCode(true)
    setCloseLog(true)
  }

  useImperativeHandle(forwardRef, () => ({
    handleReset
  }))

  return (
    <fieldset>
      <legend>{i18n("AppConfig")}</legend>
      <div className="item">
        <span>{i18n("copyCode")}</span>
        <input
          type="checkbox"
          id="config-copyCode"
          name="config-copyCode"
          className="codebox-offscreen"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="config-copyCode"></label>
      </div>
      <div className="item">
        <span>{i18n("configCloseLog")}</span>
        <input
          type="checkbox"
          id="config-closeLog"
          name="config-closeLog"
          className="codebox-offscreen"
          checked={closeLog}
          onChange={(e) => setCloseLog(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="config-closeLog"></label>
      </div>
      <div className="item download" onClick={downloadImg}>
        <span>
          <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
          {i18n("downloadAllImg")}
        </span>
        <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
      <div className="item download" onClick={downloadFullImg}>
        <span>
          <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
          {i18n("fullPageScreenshot")}
        </span>
        <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
    </fieldset>
  )
}
