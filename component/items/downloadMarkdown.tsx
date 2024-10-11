import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import { i18n } from "~tools"

export default function EditMarkdown(props) {
  let { name } = props

  async function downloadMarkdown() {
    sendToContentScript({
      name: `${name}-downloadMarkdown`
    })
  }

  return (
    <div className="item download" onClick={downloadMarkdown}>
      <span>
        <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
        {i18n("downloadMarkdown")}
      </span>
      <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
    </div>
  )
}
