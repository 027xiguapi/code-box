import { useStorage } from "@plasmohq/storage/hook"

export default function Jb51() {
  const [closeAds, setCloseAds] = useStorage("jb51-closeAds", (v) =>
    v === undefined ? true : v
  )
  const [copyCode, setCopyCode] = useStorage("jb51-copyCode", (v) =>
    v === undefined ? true : v
  )

  return (
    <fieldset>
      <legend>{chrome.i18n.getMessage("jb51Config")}</legend>
      <div className="item">
        <span>{chrome.i18n.getMessage("jb51CloseAds")}</span>
        <input
          type="checkbox"
          id="jb51-closeAds"
          name="jb51-closeAds"
          className="codebox-offscreen"
          checked={closeAds}
          onChange={(e) => setCloseAds(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="jb51-closeAds"></label>
      </div>
      <div className="item">
        <span>{chrome.i18n.getMessage("jb51CopyCode")}</span>
        <input
          type="checkbox"
          id="jb51-copyCode"
          name="jb51-copyCode"
          className="codebox-offscreen"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="jb51-copyCode"></label>
      </div>
    </fieldset>
  )
}
