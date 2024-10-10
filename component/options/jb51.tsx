import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Jb51() {
  const [closeAds, setCloseAds] = useStorage("jb51-closeAds", (v) =>
    v === undefined ? true : v
  )
  const [copyCode, setCopyCode] = useStorage("jb51-copyCode", (v) =>
    v === undefined ? true : v
  )

  function downloadMarkdown() {
    sendToContentScript({
      name: "jb51-downloadMarkdown"
    })
  }

  function downloadHtml() {
    sendToContentScript({
      name: "jb51-downloadHtml"
    })
  }

  return (
    <fieldset>
      <legend>{i18n("jb51Config")}</legend>
      <div className="item">
        <span>{i18n("jb51CloseAds")}</span>
        <input
          type="checkbox"
          id="jb51-closeAds"
          name="jb51-closeAds"
          className="codebox-offscreen"
          checked={closeAds}
          onChange={(e) => setCloseAds(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="jb51-closeAds"></label>
      </div>
      <div className="item">
        <span>{i18n("jb51CopyCode")}</span>
        <input
          type="checkbox"
          id="jb51-copyCode"
          name="jb51-copyCode"
          className="codebox-offscreen"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="jb51-copyCode"></label>
      </div>
      <EditMarkdown name="jb51"></EditMarkdown>
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
