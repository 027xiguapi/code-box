import { useStorage } from "@plasmohq/storage/hook"

export default function Zhihu() {
  const [copyCode, setCopyCode] = useStorage("zhihu-copyCode", (v) =>
    v === undefined ? true : v
  )
  const [closeLoginModal, setCloseLoginModal] = useStorage(
    "zhihu-closeLoginModal",
    (v) => (v === undefined ? true : v)
  )
  const [autoOpenCode, setAutoOpenCode] = useStorage(
    "zhihu-autoOpenCode",
    (v) => (v === undefined ? true : v)
  )

  return (
    <fieldset>
      <legend>知乎设置</legend>
      <div>
        <input
          type="checkbox"
          id="zhihu-copyCode"
          name="zhihu-copyCode"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label htmlFor="zhihu-copyCode">一键复制代码</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="zhihu-closeLoginModal"
          name="zhihu-closeLoginModal"
          checked={closeLoginModal}
          onChange={(e) => setCloseLoginModal(e.target.checked)}
        />
        <label htmlFor="zhihu-closeLoginModal">关闭登陆弹窗</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="zhihu-autoOpenCode"
          name="zhihu-autoOpenCode"
          checked={autoOpenCode}
          onChange={(e) => setAutoOpenCode(e.target.checked)}
        />
        <label htmlFor="zhihu-autoOpenCode">自动展开全文</label>
      </div>
    </fieldset>
  )
}
