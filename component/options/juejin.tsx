import { DownloadOutlined, EditOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Juejin() {
  function editMarkdown() {
    sendToContentScript({
      name: "juejin-editMarkdown"
    })
  }

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
      <EditMarkdown name="juejin"></EditMarkdown>
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
