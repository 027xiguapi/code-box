import { useStorage } from "@plasmohq/storage/hook"

export default function Cto51() {
  const [copyCode, setCopyCode] = useStorage("51cto-copyCode", (v) =>
    v === undefined ? true : v
  )
  const [closeLoginModal, setCloseLoginModal] = useStorage(
    "51cto-closeLoginModal",
    (v) => (v === undefined ? true : v)
  )

  return (
    <fieldset>
      <legend>51CTO设置</legend>
      <div className="item">
        <span>一键复制代码</span>
        <input
          type="checkbox"
          id="51cto-copyCode"
          name="51cto-copyCode"
          className="codebox-offscreen"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="51cto-copyCode"></label>
      </div>
      <div className="item">
        <span>关闭登录弹窗</span>
        <input
          type="checkbox"
          id="51cto-closeLoginModal"
          name="51cto-closeLoginModal"
          className="codebox-offscreen"
          checked={closeLoginModal}
          onChange={(e) => setCloseLoginModal(e.target.checked)}
        />
        <label
          htmlFor="51cto-closeLoginModal"
          className="codebox-switch"></label>
      </div>
    </fieldset>
  )
}
