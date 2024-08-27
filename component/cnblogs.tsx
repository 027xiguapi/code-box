import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import { i18n } from "~tools"

export default function Cnblogs() {
  const [copyCode, setCopyCode] = useStorage("cnblogs-copyCode", (v) =>
    v === undefined ? true : v
  )

  function downloadHtml() {
    sendToContentScript({
      name: "cnblogs-downloadHtml"
    })
  }

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
      <div className="item download" onClick={downloadHtml}>
        {i18n("downloadHtml")}
      </div>
    </fieldset>
  )
}
