import { DownloadOutlined } from "@ant-design/icons"
import { useEffect, useState } from "react"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import { i18n } from "~tools"

export default function Custom() {
  const [runCss, setRunCss] = useStorage("custom-runCss", (v) =>
    v === undefined ? false : v
  )
  const [cssCode, setCssCode] = useStorage("custom-cssCode")

  const [codes, setCodes] = useState([])

  useEffect(() => {
    getCodes()
  }, [])

  async function getCodes() {
    const res = await sendToContentScript({ name: `getCodes` })
    res?.codes && setCodes(res?.codes)
  }

  function downloadCode(index) {
    sendToContentScript({ name: `downloadCode`, body: { index } })
  }

  function pinCode(index) {
    sendToContentScript({ name: `scrollIntoViewCode`, body: { index } })
  }

  return (
    <fieldset>
      <legend>{i18n("customConfig")}</legend>
      {codes.map((code, index) => (
        <div className="item code" onClick={() => pinCode(index)} key={index}>
          <span className="codeTxt">
            {index + 1}-{JSON.stringify(code)}
          </span>
          <DownloadOutlined
            style={{ color: "#52c41a", fontSize: "16px" }}
            onClick={() => downloadCode(index)}
          />
        </div>
      ))}
      <div className="item">
        <span>{i18n("customCssCode")}</span>
        <input
          type="checkbox"
          id="custom-runCss"
          name="custom-runCss"
          className="codebox-offscreen"
          checked={runCss}
          onChange={(e) => setRunCss(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor="custom-runCss"></label>
      </div>
      <div className={`item ${runCss ? "" : "hide"}`}>
        <textarea
          name="custom-cssCode"
          value={cssCode}
          onChange={(e) => setCssCode(e.target.value)}></textarea>
      </div>
    </fieldset>
  )
}
