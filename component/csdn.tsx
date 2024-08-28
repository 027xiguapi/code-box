import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import { i18n } from "~tools"

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

  function downloadMarkdown() {
    sendToContentScript({
      name: "csdn-downloadMarkdown"
    })
  }

  function downloadHtml() {
    sendToContentScript({
      name: "csdn-downloadHtml"
    })
  }

  return (
    <fieldset>
      <legend>{i18n("csdnConfig")}</legend>
      <div className="item">
        <span>{i18n("csdnCloseAds")}</span>
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
        <span>{i18n("csdnCopyCode")}</span>
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
        <span>{i18n("csdnCloseFollow")}</span>
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
        <span>{i18n("csdnCloseVip")}</span>
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
        <span>{i18n("csdnAutoOpenCode")}</span>
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
        <span>{i18n("csdnCloseLoginModal")}</span>
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
        <span>{i18n("csdnCloseRedirectModal")}</span>
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
      <div className="item download" onClick={downloadMarkdown}>
        {i18n("downloadMarkdown")}
      </div>
      <div className="item download" onClick={downloadHtml}>
        {i18n("downloadHtml")}
      </div>
    </fieldset>
  )
}
