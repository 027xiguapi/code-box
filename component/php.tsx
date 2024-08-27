import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import { i18n } from "~tools"

export default function Php() {
  const [copyCode, setCopyCode] = useStorage("php-copyCode", (v) =>
    v === undefined ? true : v
  )
  const [closeLoginModal, setCloseLoginModal] = useStorage(
    "php-closeLoginModal",
    (v) => (v === undefined ? true : v)
  )

  function downloadHtml() {
    sendToContentScript({
      name: "php-downloadHtml"
    })
  }

  return (
    <fieldset>
      <legend>{i18n("phpConfig")}</legend>
      <div className="item">
        <span>{i18n("phpCopyCode")}</span>
        <input
          type="checkbox"
          id="php-copyCode"
          name="php-copyCode"
          className="codebox-offscreen"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="php-copyCode"></label>
      </div>
      <div className="item">
        <span>{i18n("phpCloseLoginModal")}</span>
        <input
          type="checkbox"
          id="php-closeLoginModal"
          name="php-closeLoginModal"
          className="codebox-offscreen"
          checked={closeLoginModal}
          onChange={(e) => setCloseLoginModal(e.target.checked)}
        />
        <label htmlFor="php-closeLoginModal" className="codebox-switch"></label>
      </div>
      <div className="item download" onClick={downloadHtml}>
        {i18n("downloadHtml")}
      </div>
    </fieldset>
  )
}
