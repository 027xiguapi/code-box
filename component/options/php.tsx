import { useStorage } from "@plasmohq/storage/hook"

import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Php() {
  const [closeLoginModal, setCloseLoginModal] = useStorage(
    "php-closeLoginModal",
    (v) => (v === undefined ? true : v)
  )

  return (
    <fieldset>
      <legend>{i18n("phpConfig")}</legend>
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
    </fieldset>
  )
}
