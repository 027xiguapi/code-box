import { useStorage } from "@plasmohq/storage/hook"

export default function Custom() {
  const [closeAIBox, setCloseAIBox] = useStorage("baidu-closeAIBox", (v) =>
    v === undefined ? false : v
  )

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
    </fieldset>
  )
}
