import { useStorage } from "@plasmohq/storage/hook"

function Csdn() {
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
    <fieldset>
      <legend>CSDN设置</legend>
      <div>
        <input
          type="checkbox"
          id="csdn-closeAds"
          name="csdn-closeAds"
          checked={closeAds}
          onChange={(e) => setCloseAds(e.target.checked)}
        />
        <label htmlFor="csdn-closeAds">关闭广告</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="csdn-copyCode"
          name="csdn-copyCode"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label htmlFor="csdn-copyCode">一键复制代码</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="csdn-closeFollow"
          name="csdn-closeFollow"
          checked={closeFollow}
          onChange={(e) => setCloseFollow(e.target.checked)}
        />
        <label htmlFor="csdn-closeFollow">关注阅读全文</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="csdn-autoOpenCode"
          name="csdn-autoOpenCode"
          checked={autoOpenCode}
          onChange={(e) => setAutoOpenCode(e.target.checked)}
        />
        <label htmlFor="csdn-autoOpenCode">自动展开代码块</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="csdn-closeLoginModal"
          name="csdn-closeLoginModal"
          checked={closeLoginModal}
          onChange={(e) => setCloseLoginModal(e.target.checked)}
        />
        <label htmlFor="csdn-closeLoginModal">关闭登陆弹窗</label>
      </div>
    </fieldset>
  )
}

export default Csdn
