import { useStorage } from "@plasmohq/storage/hook"

function Jb51() {
  const [closeAds, setCloseAds] = useStorage("jb51-closeAds", (v) =>
    v === undefined ? true : v
  )
  const [copyCode, setCopyCode] = useStorage("jb51-copyCode", (v) =>
    v === undefined ? true : v
  )

  return (
    <fieldset>
      <legend>脚本之家设置</legend>
      <div>
        <input
          type="checkbox"
          id="jb51-closeAds"
          name="jb51-closeAds"
          checked={closeAds}
          onChange={(e) => setCloseAds(e.target.checked)}
        />
        <label htmlFor="jb51-closeAds">关闭广告</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="jb51-copyCode"
          name="jb51-copyCode"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label htmlFor="jb51-copyCode">一键复制代码</label>
      </div>
    </fieldset>
  )
}

export default Jb51
