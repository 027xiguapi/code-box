import { ThemeProvider } from "~theme"

import "~index.css"

import { DownloadOutlined, PushpinOutlined } from "@ant-design/icons"
import qrcodeUrl from "raw:~/public/wx/qrcode_wx.jpg"

import { sendToContentScript } from "@plasmohq/messaging"
import { useMessage } from "@plasmohq/messaging/dist/hook"
import { useStorage } from "@plasmohq/storage/dist/hook"

import styles from "./index.module.scss"

function IndexSidePanel() {
  const [codes] = useStorage("app-codes", [])
  const [summary, setSummary] = useStorage("app-summary", {
    title: "",
    score: "",
    content: ""
  })

  useMessage((req: any, res: any) => {
    if (req.name === "isSidePanelOpen") {
      return true
    }
    if (req.name == "sidepanel") {
      req.body.active || window.close()
    }
  })

  function pinCode(index) {
    sendToContentScript({ name: `custom-scrollIntoViewCode`, body: { index } })
  }

  function downloadCode(index) {
    sendToContentScript({ name: `custom-downloadCode`, body: { index } })
  }

  return (
    <ThemeProvider>
      <div className={`${styles.sidepanel}`}>
        <div className="wechat">
          <h1>微信公众号</h1>
          <img style={{ margin: "auto" }} src={qrcodeUrl} alt="微信公众号" />
        </div>
        <div className="content">
          {summary.content ? (
            <div className="summary">
              <div className="title">
                {summary.title}(评分：{summary.score})
              </div>
              <div className="content">{summary.content}</div>
            </div>
          ) : (
            <></>
          )}
          <h1 className="contentTitle">导航</h1>
          {codes.map((code, index) => (
            <div
              className="item code"
              onClick={() => pinCode(index)}
              key={index}>
              <span className="codeTxt">
                {index + 1}-{JSON.stringify(code)}
              </span>
              <PushpinOutlined
                style={{
                  color: "#52c41a",
                  fontSize: "16px",
                  marginLeft: "10px"
                }}
                className="download"
                onClick={() => pinCode(index)}
              />
              <DownloadOutlined
                style={{
                  color: "#52c41a",
                  fontSize: "16px",
                  marginLeft: "10px"
                }}
                className="download"
                onClick={() => downloadCode(index)}
              />
            </div>
          ))}
        </div>
      </div>
    </ThemeProvider>
  )
}

export default IndexSidePanel
