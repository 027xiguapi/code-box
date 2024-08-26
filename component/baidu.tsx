import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

export default function Custom() {
  const [closeAIBox, setCloseAIBox] = useStorage("baidu-closeAIBox", (v) =>
    v === undefined ? false : v
  )

  function downloadHtml() {
    sendToContentScript({
      name: "baidu-downloadHtml"
    })
  }

  return (
    <fieldset>
      <legend>{chrome.i18n.getMessage("baiduConfig")}</legend>
      <div className="item">
        <span>{chrome.i18n.getMessage("baiduCloseAIBox")}</span>
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
      <div className="item download" onClick={downloadHtml}>
        {chrome.i18n.getMessage("downloadHtml")}
      </div>
    </fieldset>
  )
}
