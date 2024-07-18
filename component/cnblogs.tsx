import { useStorage } from "@plasmohq/storage/hook"

export default function Cnblogs() {
  const [copyCode, setCopyCode] = useStorage("cnblogs-copyCode", (v) =>
    v === undefined ? true : v
  )

  return (
    <fieldset>
      <legend>博客园设置</legend>
      <div className="item">
        <span>一键复制代码</span>
        <input
          type="checkbox"
          id="cnblogs-copyCode"
          name="cnblogs-copyCode"
          className="codebox-offscreen"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="cnblogs-copyCode"></label>
      </div>
    </fieldset>
  )
}
