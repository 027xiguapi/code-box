import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import { i18n } from "~tools"

export default function Config() {
  const [closeLog, setCloseLog] = useStorage("config-closeLog", true)
  // const [copyCode, setCopyCode] = useStorage("config-copyCode", true)

  async function downloadImg() {
    sendToContentScript({
      name: "app-full-page-screenshot"
    })
  }

  return (
    <fieldset>
      <legend>{i18n("AppConfig")}</legend>
      {/*<div className="item">*/}
      {/*  <span>{i18n("copyCode")}</span>*/}
      {/*  <input*/}
      {/*    type="checkbox"*/}
      {/*    id="config-copyCode"*/}
      {/*    name="config-copyCode"*/}
      {/*    className="codebox-offscreen"*/}
      {/*    checked={copyCode}*/}
      {/*    onChange={(e) => setCopyCode(e.target.checked)}*/}
      {/*  />*/}
      {/*  <label className="codebox-switch" htmlFor="config-copyCode"></label>*/}
      {/*</div>*/}
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
          {i18n("fullPageScreenshot")}
        </span>
        <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
    </fieldset>
  )
}
