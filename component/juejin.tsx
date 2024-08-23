import { DownloadOutlined } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import { i18n } from "~tools"

export default function Juejin() {
  function downloadMarkdown() {
    sendToContentScript({
      name: "juejin-downloadMarkdown"
    })
  }

  function downloadHtml() {
    sendToContentScript({
      name: "juejin-downloadHtml"
    })
  }

  return (
    <fieldset>
      <legend>{i18n("juejinConfig")}</legend>
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
