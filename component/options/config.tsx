import { BookOutlined, DownloadOutlined, StarTwoTone } from "@ant-design/icons"
import { useImperativeHandle } from "react"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import DownloadImages from "~component/items/downloadImages"
import SetAiType from "~component/items/setAiType"
import { i18n } from "~tools"

export default function Config({ forwardRef }) {
  const [copyCode, setCopyCode] = useStorage("config-copyCode", (v) =>
    v === undefined ? true : v
  )
  const [closeLog, setCloseLog] = useStorage("config-closeLog", (v) =>
    v === undefined ? true : v
  )
  const [allShowTag, setAllShowTag] = useStorage("config-allShowTag", (v) =>
    v === undefined ? true : v
  )

  function downloadFullImg() {
    sendToContentScript({
      name: "app-full-page-screenshot"
    })
  }

  function getSummary() {
    sendToContentScript({
      name: "app-get-summary"
    })
    sendToBackground({
      name: "sidepanel",
      body: {
        active: true
      }
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
      <SetAiType />
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
        <span>{i18n("allShowTag")}</span>
        <input
          type="checkbox"
          id="allShowTag"
          name="allShowTag"
          className="codebox-offscreen"
          checked={allShowTag}
          onChange={(e) => setAllShowTag(e.target.checked)}
        />
        <label htmlFor="allShowTag" className="codebox-switch"></label>
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
      <div className="item download" onClick={getSummary}>
        <span>
          <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
          总结文章
        </span>
        <BookOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
    </fieldset>
  )
}
