import { useStorage } from "@plasmohq/storage/hook"

import { i18n } from "~tools"

export default function Config() {
  const [closeLog, setCloseLog] = useStorage("config-closeLog", (v) =>
    v === undefined ? true : v
  )

  return (
    <fieldset>
      <legend>{i18n("AppConfig")}</legend>
      <div className="item">
        <span>{i18n("configCloseLog")}</span>
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
