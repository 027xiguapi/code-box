import { useStorage } from "@plasmohq/storage/hook"

export default function Php() {
  const [copyCode, setCopyCode] = useStorage("php-copyCode", (v) =>
    v === undefined ? true : v
  )
  const [closeLoginModal, setCloseLoginModal] = useStorage(
    "php-closeLoginModal",
    (v) => (v === undefined ? true : v)
  )

  return (
    <fieldset>
      <legend>{chrome.i18n.getMessage("phpConfig")}</legend>
      <div className="item">
        <span>{chrome.i18n.getMessage("phpCopyCode")}</span>
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
        <span>{chrome.i18n.getMessage("phpCloseLoginModal")}</span>
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
    </fieldset>
  )
}
