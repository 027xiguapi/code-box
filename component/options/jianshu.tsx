import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Jianshu() {
  const [copyCode, setCopyCode] = useStorage("jianshu-copyCode", (v) =>
    v === undefined ? true : v
  )
  const [closeLoginModal, setCloseLoginModal] = useStorage(
    "jianshu-closeLoginModal",
    (v) => (v === undefined ? true : v)
  )
  const [autoOpenCode, setAutoOpenCode] = useStorage(
    "jianshu-autoOpenCode",
    (v) => (v === undefined ? true : v)
  )

  function downloadMarkdown() {
    sendToContentScript({
      name: "jianshu-downloadMarkdown"
    })
  }

  function downloadHtml() {
    sendToContentScript({
      name: "jianshu-downloadHtml"
    })
  }

  return (
    <fieldset>
      <legend>{i18n("jianshuConfig")}</legend>
      <div className="item">
        <span>{i18n("jianshuCopyCode")}</span>
        <input
          type="checkbox"
          id="jianshu-copyCode"
          name="jianshu-copyCode"
          className="codebox-offscreen"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="jianshu-copyCode"></label>
      </div>
      <div className="item">
        <span>{i18n("jianshuCloseLoginModal")}</span>
        <input
          type="checkbox"
          id="jianshu-closeLoginModal"
          name="jianshu-closeLoginModal"
          className="codebox-offscreen"
          checked={closeLoginModal}
          onChange={(e) => setCloseLoginModal(e.target.checked)}
        />
        <label
          className="codebox-switch"
          htmlFor="jianshu-closeLoginModal"></label>
      </div>
      <div className="item">
        <span>{i18n("jianshuAutoOpenCode")}</span>
        <input
          type="checkbox"
          id="jianshu-autoOpenCode"
          name="jianshu-autoOpenCode"
          className="codebox-offscreen"
          checked={autoOpenCode}
          onChange={(e) => setAutoOpenCode(e.target.checked)}
        />
        <label
          className="codebox-switch"
          htmlFor="jianshu-autoOpenCode"></label>
      </div>
      <EditMarkdown name="jianshu"></EditMarkdown>
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
