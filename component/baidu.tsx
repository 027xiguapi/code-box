import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import { i18n } from "~tools"

export default function Custom() {
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
      <div className="item download" onClick={downloadMarkdown}>
        {i18n("downloadMarkdown")}
      </div>
      <div className="item download" onClick={downloadHtml}>
        {i18n("downloadHtml")}
      </div>
    </fieldset>
  )
}
