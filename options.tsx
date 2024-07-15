import { useStorage } from "@plasmohq/storage/hook"

function IndexOptions() {
  const [closeAds, setCloseAds] = useStorage("csdn-closeAds", (v) =>
    v === undefined ? true : v
  )
  const [copyCode, setCopyCode] = useStorage("csdn-copyCode", (v) =>
    v === undefined ? true : v
  )
  const [closeFollow, setCloseFollow] = useStorage("csdn-closeFollow", (v) =>
    v === undefined ? true : v
  )
  const [autoOpenCode, setAutoOpenCode] = useStorage(
    "csdn-autoOpenCode",
    (v) => (v === undefined ? true : v)
  )
  const [closeLoginModal, setCloseLoginModal] = useStorage(
    "csdn-closeLoginModal",
    (v) => (v === undefined ? true : v)
  )

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <fieldset>
        <legend>CSDN设置</legend>
        <div>
          <input
            type="checkbox"
            id="closeAds"
            name="closeAds"
            checked={closeAds}
            onChange={(e) => setCloseAds(e.target.checked)}
          />
          <label htmlFor="closeAds">关闭广告</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="copyCode"
            name="copyCode"
            checked={copyCode}
            onChange={(e) => setCopyCode(e.target.checked)}
          />
          <label htmlFor="copyCode">一键复制代码</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="closeFollow"
            name="closeFollow"
            checked={closeFollow}
            onChange={(e) => setCloseFollow(e.target.checked)}
          />
          <label htmlFor="closeFollow">关注阅读全文</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="autoOpenCode"
            name="autoOpenCode"
            checked={autoOpenCode}
            onChange={(e) => setAutoOpenCode(e.target.checked)}
          />
          <label htmlFor="autoOpenCode">自动展开代码块</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="closeLoginModal"
            name="closeLoginModal"
            checked={closeLoginModal}
            onChange={(e) => setCloseLoginModal(e.target.checked)}
          />
          <label htmlFor="closeLoginModal">关闭登陆弹窗</label>
        </div>
      </fieldset>
    </div>
  )
}

export default IndexOptions
