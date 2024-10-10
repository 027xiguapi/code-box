import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Baidu() {
  const [closeAIBox, setCloseAIBox] = useStorage("baidu-closeAIBox", (v) =>
    v === undefined ? false : v
  )

  function downloadMarkdown() {
    sendToContentScript({
      name: "baidu-downloadMarkdown"
    })
  }

  function downloadHtml() {
    sendToContentScript({
      name: "baidu-downloadHtml"
    })
  }

  return (
    <fieldset>
      <legend>{i18n("baiduConfig")}</legend>
      <div className="item">
        <span>{i18n("baiduCloseAIBox")}</span>
        <input
          type="checkbox"
          id="baidu-closeAIBox"
          name="baidu-closeAIBox"
          className="codebox-offscreen"
          checked={closeAIBox}
          onChange={(e) => setCloseAIBox(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="baidu-closeAIBox"></label>
      </div>
      <EditMarkdown name="baidu"></EditMarkdown>
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
