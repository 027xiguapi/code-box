import { DownloadOutlined } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import { i18n } from "~tools"

export default function Segmentfault() {
  function downloadMarkdown() {
    sendToContentScript({
      name: "segmentfault-downloadMarkdown"
    })
  }

  function downloadHtml() {
    sendToContentScript({
      name: "segmentfault-downloadHtml"
    })
  }

  return (
    <fieldset>
      <legend>{i18n("segmentfaultConfig")}</legend>
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
