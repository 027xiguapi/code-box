import { useImperativeHandle } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import DownloadPdf from "~component/items/downloadPdf"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Jianshu({ forwardRef }) {
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

  function handleReset() {
    setCopyCode(true)
    setCloseLoginModal(true)
    setAutoOpenCode(true)
  }

  useImperativeHandle(forwardRef, () => ({
    handleReset
  }))

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
      <CssCode name="jianshu"></CssCode>
      <EditMarkdown name="jianshu"></EditMarkdown>
      <DownloadMarkdown name="jianshu"></DownloadMarkdown>
      <DownloadHtml name="jianshu"></DownloadHtml>
      <DownloadPdf name="jianshu"></DownloadPdf>
    </fieldset>
  )
}
