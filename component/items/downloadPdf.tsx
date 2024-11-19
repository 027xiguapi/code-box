import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import { i18n } from "~tools"

export default function DownloadPdf(props) {
  let { name } = props

  async function downloadPdf() {
    sendToContentScript({
      name: `${name}-downloadPdf`
    })
  }

  return (
    <div className="item download" onClick={downloadPdf}>
      <span>
        <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
        {i18n("downloadPdf")}
      </span>
      <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
    </div>
  )
}
