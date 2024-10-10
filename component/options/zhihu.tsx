import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Zhihu() {
  const [copyCode, setCopyCode] = useStorage("zhihu-copyCode", (v) =>
    v === undefined ? true : v
  )
  const [closeLoginModal, setCloseLoginModal] = useStorage(
    "zhihu-closeLoginModal",
    (v) => (v === undefined ? true : v)
  )
  const [autoOpenCode, setAutoOpenCode] = useStorage(
    "zhihu-autoOpenCode",
    (v) => (v === undefined ? true : v)
  )

  function downloadHtml() {
    sendToContentScript({
      name: "zhihu-downloadHtml"
    })
  }

  function downloadMarkdown() {
    sendToContentScript({
      name: "zhihu-downloadMarkdown"
    })
  }

  return (
    <fieldset>
      <legend>{i18n("zhihuConfig")}</legend>
      <div className="item">
        <span>{i18n("zhihuCopyCode")}</span>
        <input
          type="checkbox"
          id="zhihu-copyCode"
          name="zhihu-copyCode"
          className="codebox-offscreen"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="zhihu-copyCode"></label>
      </div>
      <div className="item">
        <span>{i18n("zhihuCloseLoginModal")}</span>
        <input
          type="checkbox"
          id="zhihu-closeLoginModal"
          name="zhihu-closeLoginModal"
          className="codebox-offscreen"
          checked={closeLoginModal}
          onChange={(e) => setCloseLoginModal(e.target.checked)}
        />
        <label
          className="codebox-switch"
          htmlFor="zhihu-closeLoginModal"></label>
      </div>
      <div className="item">
        <span>{i18n("zhihuAutoOpenCode")}</span>
        <input
          type="checkbox"
          id="zhihu-autoOpenCode"
          name="zhihu-autoOpenCode"
          className="codebox-offscreen"
          checked={autoOpenCode}
          onChange={(e) => setAutoOpenCode(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="zhihu-autoOpenCode"></label>
      </div>
      <EditMarkdown name="zhihu"></EditMarkdown>
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
