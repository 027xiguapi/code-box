import { DownloadOutlined } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import { i18n } from "~tools"

export default function Oschina() {
  function downloadMarkdown() {
    sendToContentScript({
      name: "oschina-downloadMarkdown"
    })
  }

  function downloadHtml() {
    sendToContentScript({
      name: "oschina-downloadHtml"
    })
  }

  return (
    <fieldset>
      <legend>{i18n("oschinaConfig")}</legend>
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
