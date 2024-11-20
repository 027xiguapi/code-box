import { useImperativeHandle } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import DownloadPdf from "~component/items/downloadPdf"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Jb51({ forwardRef }) {
  const [closeAds, setCloseAds] = useStorage("jb51-closeAds", (v) =>
    v === undefined ? true : v
  )
  const [copyCode, setCopyCode] = useStorage("jb51-copyCode", (v) =>
    v === undefined ? true : v
  )

  function handleReset() {
    setCopyCode(true)
    setCloseAds(true)
  }

  useImperativeHandle(forwardRef, () => ({
    handleReset
  }))

  return (
    <fieldset>
      <legend>{i18n("jb51Config")}</legend>
      <div className="item">
        <span>{i18n("jb51CloseAds")}</span>
        <input
          type="checkbox"
          id="jb51-closeAds"
          name="jb51-closeAds"
          className="codebox-offscreen"
          checked={closeAds}
          onChange={(e) => setCloseAds(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="jb51-closeAds"></label>
      </div>
      <div className="item">
        <span>{i18n("jb51CopyCode")}</span>
        <input
          type="checkbox"
          id="jb51-copyCode"
          name="jb51-copyCode"
          className="codebox-offscreen"
          checked={copyCode}
          onChange={(e) => setCopyCode(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="jb51-copyCode"></label>
      </div>
      <CssCode name="jb51"></CssCode>
      <EditMarkdown name="jb51"></EditMarkdown>
      <DownloadMarkdown name="jb51"></DownloadMarkdown>
      <DownloadHtml name="jb51"></DownloadHtml>
      <DownloadPdf name="jb51"></DownloadPdf>
    </fieldset>
  )
}
