import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import { i18n } from "~tools"

export default function DownloadWord(props) {
  let { name } = props

  async function downloadWord() {
    sendToContentScript({
      name: `${name}-downloadWord`
    })
  }

  return (
    <div className="item download" onClick={downloadWord}>
      <span>
        <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
        {i18n("downloadWord")}
      </span>
      <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
    </div>
  )
}
