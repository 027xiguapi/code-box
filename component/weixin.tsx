import { DownloadOutlined } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/dist/hook"

import { i18n } from "~tools"

export default function Weixin() {
  const [copyCode, setCopyCode] = useStorage("weixin-copyCode", (v) =>
    v === undefined ? true : v
  )

  function downloadMarkdown() {
    sendToContentScript({
      name: "weixin-downloadMarkdown"
    })
  }

  function downloadHtml() {
    sendToContentScript({
      name: "weixin-downloadHtml"
    })
  }

  return (
    <fieldset>
      <legend>{i18n("weixinConfig")}</legend>
      <div className="item">
        <span>{i18n("copyCode")}</span>
        <input
          type="checkbox"
          id="weixin-copyCode"
          name="weixin-copyCode"
          className="codebox-offscreen"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="weixin-copyCode"></label>
      </div>
      <div className="item download" onClick={downloadMarkdown}>
        {i18n("downloadMarkdown")}
        <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
      <div className="item download" onClick={downloadHtml}>
        {i18n("downloadHtml")}
        <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
    </fieldset>
  )
}
