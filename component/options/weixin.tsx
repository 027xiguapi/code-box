import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadImages from "~component/items/downloadImages"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import DownloadPdf from "~component/items/downloadPdf"
import EditMarkdown from "~component/items/editMarkdown"
import ShowTag from "~component/items/showTag"
import { i18n } from "~tools"

export default function Weixin() {
  async function getThumbMedia() {
    sendToContentScript({
      name: `weixin-getThumbMedia`
    })
  }

  return (
    <fieldset>
      <legend>{i18n("weixinConfig")}</legend>
      <CssCode name="weixin" />
      <ShowTag name="weixin" />
      <EditMarkdown name="weixin" />
      <DownloadMarkdown name="weixin" />
      <DownloadHtml name="weixin" />
      <DownloadPdf name="weixin" />
      <DownloadImages name="weixin" />
      <div className="item download" onClick={getThumbMedia}>
        <span>
          <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
          {i18n("getThumbMedia")}
        </span>
        <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
    </fieldset>
  )
}
