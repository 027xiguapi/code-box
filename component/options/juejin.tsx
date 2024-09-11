import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

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
        <span>
          <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
          {i18n("downloadMarkdown")}
        </span>
        <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
      <div className="item download" onClick={downloadHtml}>
        <span>
          <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
          {i18n("downloadHtml")}
        </span>
        <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
    </fieldset>
  )
}
