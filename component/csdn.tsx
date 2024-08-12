import { useStorage } from "@plasmohq/storage/hook"

export default function Csdn() {
  const [closeAds, setCloseAds] = useStorage("csdn-closeAds", (v) =>
    v === undefined ? true : v
  )
  const [copyCode, setCopyCode] = useStorage("csdn-copyCode", (v) =>
    v === undefined ? true : v
  )
  const [closeFollow, setCloseFollow] = useStorage("csdn-closeFollow", (v) =>
    v === undefined ? true : v
  )
  const [closeVip, setCloseVip] = useStorage("csdn-closeVip", (v) =>
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

  const [closeRedirectModal, setCloseRedirectModal] = useStorage(
    "csdn-closeRedirectModal",
    (v) => (v === undefined ? true : v)
  )

  return (
    <fieldset>
      <legend>{chrome.i18n.getMessage("baiduConfig")}</legend>
      <div className="item">
        <span>{chrome.i18n.getMessage("csdnCloseAds")}</span>
        <input
          type="checkbox"
          id="csdn-closeAds"
          name="csdn-closeAds"
          className="codebox-offscreen"
          checked={closeAds}
          onChange={(e) => setCloseAds(e.target.checked)}
        />
        <label htmlFor="csdn-closeAds" className="codebox-switch"></label>
      </div>
      <div className="item">
        <span>{chrome.i18n.getMessage("csdnCopyCode")}</span>
        <input
          type="checkbox"
          id="csdn-copyCode"
          name="csdn-copyCode"
          className="codebox-offscreen"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label htmlFor="csdn-copyCode" className="codebox-switch"></label>
      </div>
      <div className="item">
        <span>{chrome.i18n.getMessage("csdnCloseFollow")}</span>
        <input
          type="checkbox"
          id="csdn-closeFollow"
          name="csdn-closeFollow"
          className="codebox-offscreen"
          checked={closeFollow}
          onChange={(e) => setCloseFollow(e.target.checked)}
        />
        <label htmlFor="csdn-closeFollow" className="codebox-switch"></label>
      </div>
      <div className="item">
        <span>{chrome.i18n.getMessage("csdnCloseVip")}</span>
        <input
          type="checkbox"
          id="csdn-closeVip"
          name="csdn-closeVip"
          className="codebox-offscreen"
          checked={closeVip}
          onChange={(e) => setCloseVip(e.target.checked)}
        />
        <label htmlFor="csdn-closeVip" className="codebox-switch"></label>
      </div>
      <div className="item">
        <span>{chrome.i18n.getMessage("csdnAutoOpenCode")}</span>
        <input
          type="checkbox"
          id="csdn-autoOpenCode"
          name="csdn-autoOpenCode"
          className="codebox-offscreen"
          checked={autoOpenCode}
          onChange={(e) => setAutoOpenCode(e.target.checked)}
        />
        <label htmlFor="csdn-autoOpenCode" className="codebox-switch"></label>
      </div>
      <div className="item">
        <span>{chrome.i18n.getMessage("csdnCloseLoginModal")}</span>
        <input
          type="checkbox"
          id="csdn-closeLoginModal"
          name="csdn-closeLoginModal"
          className="codebox-offscreen"
          checked={closeLoginModal}
          onChange={(e) => setCloseLoginModal(e.target.checked)}
        />
        <label
          htmlFor="csdn-closeLoginModal"
          className="codebox-switch"></label>
      </div>
      <div className="item">
        <span>{chrome.i18n.getMessage("csdnCloseRedirectModal")}</span>
        <input
          type="checkbox"
          id="csdn-closeRedirectModal"
          name="csdn-closeRedirectModal"
          className="codebox-offscreen"
          checked={closeRedirectModal}
          onChange={(e) => setCloseRedirectModal(e.target.checked)}
        />
        <label
          htmlFor="csdn-closeRedirectModal"
          className="codebox-switch"></label>
      </div>
    </fieldset>
  )
}
