import { useStorage } from "@plasmohq/storage/hook"

import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Cnblogs() {
  const [copyCode, setCopyCode] = useStorage("cnblogs-copyCode", (v) =>
    v === undefined ? true : v
  )

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
      <EditMarkdown name="cnblogs"></EditMarkdown>
      <DownloadMarkdown name="cnblogs"></DownloadMarkdown>
      <DownloadHtml name="cnblogs"></DownloadHtml>
    </fieldset>
  )
}
