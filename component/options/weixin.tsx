import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/dist/hook"

import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Weixin() {
  const [copyCode, setCopyCode] = useStorage("weixin-copyCode", (v) =>
    v === undefined ? true : v
  )

  function downloadMarkdown() {
    sendToContentScript({
      name: "weixin-downloadMarkdown"
    })
  }

  function downloadHtml() {
    sendToContentScript({
      name: "weixin-downloadHtml"
    })
  }

  return (
    <fieldset>
      <legend>{i18n("weixinConfig")}</legend>
      <div className="item">
        <span>{i18n("copyCode")}</span>
        <input
          type="checkbox"
          id="weixin-copyCode"
          name="weixin-copyCode"
          className="codebox-offscreen"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="weixin-copyCode"></label>
      </div>
      <EditMarkdown name="weixin"></EditMarkdown>
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
