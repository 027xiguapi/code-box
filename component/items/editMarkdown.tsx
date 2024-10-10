import { EditOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import { i18n } from "~tools"

export default function EditMarkdown(props) {
  let { name } = props

  async function editMarkdown() {
    sendToContentScript({
      name: `${name}-editMarkdown`
    })
  }

  return (
    <div className="item download" onClick={editMarkdown}>
      <span>
        <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
        {i18n("editMarkdown")}
      </span>
      <EditOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
    </div>
  )
}
