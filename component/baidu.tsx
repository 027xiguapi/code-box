import { useStorage } from "@plasmohq/storage/hook"

export default function Custom() {
  const [closeAIBox, setCloseAIBox] = useStorage("baidu-closeAIBox", (v) =>
    v === undefined ? false : v
  )

  return (
    <fieldset>
      <legend>百度设置</legend>
      <div className="item">
        <span>关闭AI框</span>
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
