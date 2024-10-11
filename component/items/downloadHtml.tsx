import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import { i18n } from "~tools"

export default function DownloadHtml(props) {
  let { name } = props

  async function downloadHtml() {
    sendToContentScript({
      name: `${name}-downloadHtml`
    })
  }

  return (
    <div className="item download" onClick={downloadHtml}>
      <span>
        <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
        {i18n("downloadHtml")}
      </span>
      <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
    </div>
  )
}
