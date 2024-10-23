import { useStorage } from "@plasmohq/storage/hook"

import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Php() {
  const [copyCode, setCopyCode] = useStorage("php-copyCode", true)
  const [closeLoginModal, setCloseLoginModal] = useStorage(
    "php-closeLoginModal",
    true
  )

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
      <EditMarkdown name="php"></EditMarkdown>
      <DownloadMarkdown name="php"></DownloadMarkdown>
      <DownloadHtml name="php"></DownloadHtml>
      <CssCode name="php"></CssCode>
    </fieldset>
  )
}
