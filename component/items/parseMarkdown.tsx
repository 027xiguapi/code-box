import { EditOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import { i18n } from "~tools"

export default function ParseMarkdown(props) {
  let { name } = props

  async function parseMarkdown() {
    sendToContentScript({
      name: `${name}-parseMarkdown`
    })
  }

  return (
    <div className="item download" onClick={parseMarkdown}>
      <span>
        <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
        {i18n("parseMarkdown")}
      </span>
      <EditOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
    </div>
  )
}
