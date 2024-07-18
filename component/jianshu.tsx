import { useStorage } from "@plasmohq/storage/hook"

export default function Jianshu() {
  const [copyCode, setCopyCode] = useStorage("jianshu-copyCode", (v) =>
    v === undefined ? true : v
  )
  const [closeLoginModal, setCloseLoginModal] = useStorage(
    "jianshu-closeLoginModal",
    (v) => (v === undefined ? true : v)
  )
  const [autoOpenCode, setAutoOpenCode] = useStorage(
    "jianshu-autoOpenCode",
    (v) => (v === undefined ? true : v)
  )

  return (
    <fieldset>
      <legend>简书设置</legend>
      <div className="item">
        <span>一键复制代码</span>
        <input
          type="checkbox"
          id="jianshu-copyCode"
          name="jianshu-copyCode"
          className="codebox-offscreen"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="jianshu-copyCode"></label>
      </div>
      <div className="item">
        <span>关闭登录弹窗</span>
        <input
          type="checkbox"
          id="jianshu-closeLoginModal"
          name="jianshu-closeLoginModal"
          className="codebox-offscreen"
          checked={closeLoginModal}
          onChange={(e) => setCloseLoginModal(e.target.checked)}
        />
        <label
          className="codebox-switch"
          htmlFor="jianshu-closeLoginModal"></label>
      </div>
      <div className="item">
        <span>自动展开全文</span>
        <input
          type="checkbox"
          id="jianshu-autoOpenCode"
          name="jianshu-autoOpenCode"
          className="codebox-offscreen"
          checked={autoOpenCode}
          onChange={(e) => setAutoOpenCode(e.target.checked)}
        />
        <label
          className="codebox-switch"
          htmlFor="jianshu-autoOpenCode"></label>
      </div>
    </fieldset>
  )
}
