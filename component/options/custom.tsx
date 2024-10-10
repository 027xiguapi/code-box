import { DownloadOutlined, EditOutlined, StarTwoTone } from "@ant-design/icons"
import { Input } from "antd"
import { useEffect, useState } from "react"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import { i18n } from "~tools"

export default function Custom() {
  const [runCss, setRunCss] = useStorage("custom-runCss", (v) =>
    v === undefined ? false : v
  )
  const [cssCode, setCssCode, { setRenderValue, setStoreValue, remove }] =
    useStorage("custom-cssCode")
  // const [codes] = useStorage("app-codes", [])

  useEffect(() => {}, [cssCode])

  function downloadCode(index) {
    sendToContentScript({ name: `custom-downloadCode`, body: { index } })
  }

  function pinCode(index) {
    sendToContentScript({ name: `custom-scrollIntoViewCode`, body: { index } })
  }

  function editMarkdown() {
    sendToContentScript({
      name: "custom-editMarkdown"
    })
  }

  function downloadMarkdown() {
    sendToContentScript({
      name: "custom-downloadMarkdown"
    })
  }

  function downloadHtml() {
    sendToContentScript({
      name: "custom-downloadHtml"
    })
  }

  function downloadPdf() {
    sendToContentScript({
      name: "custom-downloadPdf"
    })
  }

  function downloadImg() {
    sendToContentScript({
      name: "custom-downloadImg"
    })
  }

  function handleChange(event) {
    setCssCode(event.target.value)
  }

  return (
    <fieldset>
      <legend>{i18n("customConfig")}</legend>
      {/*{codes.map((code, index) => (*/}
      {/*  <div className="item code" onClick={() => pinCode(index)} key={index}>*/}
      {/*    <span className="codeTxt">*/}
      {/*      {index + 1}-{JSON.stringify(code)}*/}
      {/*    </span>*/}
      {/*    <DownloadOutlined*/}
      {/*      style={{ color: "#52c41a", fontSize: "16px" }}*/}
      {/*      onClick={() => downloadCode(index)}*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*))}*/}
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
        <Input.TextArea
          name="custom-cssCode"
          value={cssCode}
          onChange={(e) => setRenderValue(e.target.value)}
          onBlur={(e) => setStoreValue()}></Input.TextArea>
      </div>
      <div className="item download" onClick={editMarkdown}>
        <span>
          <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
          {i18n("editMarkdown")}
        </span>
        <EditOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
      <div className="item download" onClick={downloadMarkdown}>
        <span>
          <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
          {i18n("downloadMarkdown")}
        </span>
        <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
      <div className="item download" onClick={downloadHtml}>
        <span>
          <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
          {i18n("downloadHtml")}
        </span>
        <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
      <div className="item download" onClick={downloadPdf}>
        <span>
          <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
          {i18n("downloadPdf")}
        </span>
        <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
      <div className="item download" onClick={downloadImg}>
        <span>
          <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
          {i18n("downloadImg")}
        </span>
        <DownloadOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
      </div>
    </fieldset>
  )
}
