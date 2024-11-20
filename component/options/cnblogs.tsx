import { useImperativeHandle } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import DownloadPdf from "~component/items/downloadPdf"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Cnblogs({ forwardRef }) {
  const [copyCode, setCopyCode] = useStorage("cnblogs-copyCode", (v) =>
    v === undefined ? true : v
  )

  function handleReset() {
    setCopyCode(true)
  }

  useImperativeHandle(forwardRef, () => ({
    handleReset
  }))

  return (
    <fieldset>
      <legend>{i18n("cnblogsConfig")}</legend>
      <div className="item">
        <span>{i18n("cnblogsCopyCode")}</span>
        <input
          type="checkbox"
          id="cnblogs-copyCode"
          name="cnblogs-copyCode"
          className="codebox-offscreen"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="cnblogs-copyCode"></label>
      </div>
      <CssCode name="cnblogs"></CssCode>
      <EditMarkdown name="cnblogs"></EditMarkdown>
      <DownloadMarkdown name="cnblogs"></DownloadMarkdown>
      <DownloadHtml name="cnblogs"></DownloadHtml>
      <CssCode name="cnblogs"></CssCode>
      <DownloadPdf name="cnblogs"></DownloadPdf>
    </fieldset>
  )
}
