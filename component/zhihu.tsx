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
      <div className="item">
        <span>一键复制代码</span>
        <input
          type="checkbox"
          id="zhihu-copyCode"
          name="zhihu-copyCode"
          className="codebox-offscreen"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label htmlFor="zhihu-copyCode"></label>
      </div>
      <div className="item">
        <span>关闭登陆弹窗</span>
        <input
          type="checkbox"
          id="zhihu-closeLoginModal"
          name="zhihu-closeLoginModal"
          className="codebox-offscreen"
          checked={closeLoginModal}
          onChange={(e) => setCloseLoginModal(e.target.checked)}
        />
        <label
          className="codebox-switch"
          htmlFor="zhihu-closeLoginModal"></label>
      </div>
      <div className="item">
        <span>自动展开全文</span>
        <input
          type="checkbox"
          id="zhihu-autoOpenCode"
          name="zhihu-autoOpenCode"
          className="codebox-offscreen"
          checked={autoOpenCode}
          onChange={(e) => setAutoOpenCode(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="zhihu-autoOpenCode"></label>
      </div>
    </fieldset>
  )
}
