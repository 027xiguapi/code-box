import { useStorage } from "@plasmohq/storage/dist/hook"

import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Weixin() {
  const [copyCode, setCopyCode] = useStorage("weixin-copyCode", (v) =>
    v === undefined ? true : v
  )

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
      <DownloadMarkdown name="weixin"></DownloadMarkdown>
      <DownloadHtml name="weixin"></DownloadHtml>
    </fieldset>
  )
}
