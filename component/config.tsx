import { useStorage } from "@plasmohq/storage/hook"

export default function Config() {
  const [closeLog, setCloseLog] = useStorage("config-closeLog", (v) =>
    v === undefined ? true : v
  )

  return (
    <fieldset>
      <legend>{chrome.i18n.getMessage("AppConfig")}</legend>
      <div className="item">
        <span>{chrome.i18n.getMessage("configCloseLog")}</span>
        <input
          type="checkbox"
          id="config-closeLog"
          name="config-closeLog"
          className="codebox-offscreen"
          checked={closeLog}
          onChange={(e) => setCloseLog(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="config-closeLog"></label>
      </div>
    </fieldset>
  )
}
