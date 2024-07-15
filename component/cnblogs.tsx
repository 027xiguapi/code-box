import { useStorage } from "@plasmohq/storage/hook"

export default function Cnblogs() {
  const [copyCode, setCopyCode] = useStorage("cnblogs-copyCode", (v) =>
    v === undefined ? true : v
  )

  return (
    <fieldset>
      <legend>博客园设置</legend>
      <div>
        <input
          type="checkbox"
          id="cnblogs-copyCode"
          name="cnblogs-copyCode"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label htmlFor="cnblogs-copyCode">一键复制代码</label>
      </div>
    </fieldset>
  )
}
