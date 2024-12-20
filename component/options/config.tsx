import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"
import { useImperativeHandle } from "react"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import DownloadImages from "~component/items/downloadImages"
import { i18n } from "~tools"

export default function Config({ forwardRef }) {
  const [copyCode, setCopyCode] = useStorage("config-copyCode", (v) =>
    v === undefined ? true : v
  )
  const [closeLog, setCloseLog] = useStorage("config-closeLog", (v) =>
    v === undefined ? true : v
  )

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
      <DownloadImages name="app"></DownloadImages>
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
