import { useImperativeHandle } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import DownloadPdf from "~component/items/downloadPdf"
import EditMarkdown from "~component/items/editMarkdown"
import ShowTag from "~component/items/showTag"
import { i18n } from "~tools"

export default function Baidu({ forwardRef }) {
  const [closeAIBox, setCloseAIBox] = useStorage("baidu-closeAIBox", (v) =>
    v === undefined ? false : v
  )

  function handleReset() {
    setCloseAIBox(false)
  }

  useImperativeHandle(forwardRef, () => ({
    handleReset
  }))

  return (
    <fieldset>
      <legend>{i18n("baiduConfig")}</legend>
      <div className="item">
        <span>{i18n("baiduCloseAIBox")}</span>
        <input
          type="checkbox"
          id="baidu-closeAIBox"
          name="baidu-closeAIBox"
          className="codebox-offscreen"
          checked={closeAIBox}
          onChange={(e) => setCloseAIBox(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="baidu-closeAIBox"></label>
      </div>
      <CssCode name="baidu"></CssCode>
      <ShowTag name="baidu"></ShowTag>
      <EditMarkdown name="baidu"></EditMarkdown>
      <DownloadMarkdown name="baidu"></DownloadMarkdown>
      <DownloadHtml name="baidu"></DownloadHtml>
      <DownloadPdf name="baidu"></DownloadPdf>
    </fieldset>
  )
}
