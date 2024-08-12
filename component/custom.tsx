import { useStorage } from "@plasmohq/storage/hook"

export default function Custom() {
  const [runCss, setRunCss] = useStorage("custom-runCss", (v) =>
    v === undefined ? false : v
  )
  const [cssCode, setCssCode] = useStorage("custom-cssCode")

  return (
    <fieldset>
      <legend>{chrome.i18n.getMessage("customConfig")}</legend>
      <div className="item">
        <span>{chrome.i18n.getMessage("customCssCode")}</span>
        <input
          type="checkbox"
          id="custom-runCss"
          name="custom-runCss"
          className="codebox-offscreen"
          checked={runCss}
          onChange={(e) => setRunCss(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="custom-runCss"></label>
      </div>
      <div className={`item ${runCss ? "" : "hide"}`}>
        <textarea
          name="custom-cssCode"
          value={cssCode}
          onChange={(e) => setCssCode(e.target.value)}></textarea>
      </div>
    </fieldset>
  )
}
