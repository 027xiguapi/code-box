import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import DownloadPdf from "~component/items/downloadPdf"
import EditMarkdown from "~component/items/editMarkdown"
import ParseMarkdown from "~component/items/parseMarkdown"
import { i18n } from "~tools"

export default function Custom() {
  function makerQRPost() {
    sendToContentScript({
      name: "app-makerQRPost"
    })
  }
  return (
    <fieldset>
      <legend>{i18n("customConfig")}</legend>
      <CssCode name="custom"></CssCode>
      <ParseMarkdown name="custom" />
      <EditMarkdown name="custom" />
      <DownloadMarkdown name="custom" />
      <DownloadHtml name="custom" />
      <DownloadPdf name="custom" />
      <div className="item download" onClick={makerQRPost}>
        <span>
          <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
          {i18n("makerQRPost")}
        </span>
        <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
    </fieldset>
  )
}
