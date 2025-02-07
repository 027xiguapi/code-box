import { BookOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import { i18n } from "~tools"

export default function Weixin() {
  async function getThumbMedia() {
    sendToContentScript({
      name: `mp-getMediaResources`
    })
  }

  return (
    <fieldset>
      <legend>{i18n("weixinConfig")}</legend>
      <div className="item download" onClick={getThumbMedia}>
        <span>
          <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
          {i18n("getMediaResources")}
        </span>
        <BookOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
    </fieldset>
  )
}
