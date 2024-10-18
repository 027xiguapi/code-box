import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Custom() {
  // const [codes] = useStorage("app-codes", [])

  function downloadCode(index) {
    sendToContentScript({ name: `custom-downloadCode`, body: { index } })
  }

  function pinCode(index) {
    sendToContentScript({ name: `custom-scrollIntoViewCode`, body: { index } })
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
      <CssCode name="custom"></CssCode>
      <EditMarkdown name="custom"></EditMarkdown>
      <DownloadMarkdown name="custom"></DownloadMarkdown>
      <DownloadHtml name="custom"></DownloadHtml>
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
