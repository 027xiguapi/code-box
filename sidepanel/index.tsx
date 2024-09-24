import { ThemeProvider } from "~theme"

import "~index.css"

import {
  DownloadOutlined,
  KeyOutlined,
  PushpinOutlined
} from "@ant-design/icons"
import { Button, Input, Space } from "antd"
import qrcodeUrl from "raw:~/public/wx/qrcode_wx.jpg"
import { useEffect, useState } from "react"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/dist/hook"

import styles from "./index.module.scss"

function IndexSidePanel() {
  const [codes, setCodes] = useState([])
  const [closeLog] = useStorage("config-closeLog", true)

  useEffect(() => {
    getCodes()
  }, [])

  async function getCodes() {
    sendToContentScript({ name: `custom-getCodes` })
      .then((res) => {
        res?.codes && setCodes(res?.codes)
      })
      .catch((err) => {
        closeLog || console.log("getCodes", err)
      })
  }

  function pinCode(index) {
    sendToContentScript({ name: `custom-scrollIntoViewCode`, body: { index } })
  }

  function downloadCode(index) {
    sendToContentScript({ name: `custom-downloadCode`, body: { index } })
  }

  function handleSubmit() {}

  return (
    <ThemeProvider>
      <div className={`${styles.sidepanel}`}>
        <div className="wechat">
          <h1>微信公众号</h1>
          <p className="wechatDesc">关注公众号，了解更多功能</p>
          <img className="wechatImg" src={qrcodeUrl} alt="微信公众号" />
          <Space.Compact style={{ width: "100%" }}>
            <Input placeholder="输入激活码" prefix={<KeyOutlined />} />
            <Button type="primary" onClick={handleSubmit}>
              提交
            </Button>
          </Space.Compact>
        </div>
        {codes.map((code, index) => (
          <div className="item code" onClick={() => pinCode(index)} key={index}>
            <span className="codeTxt">
              {index + 1}-{JSON.stringify(code)}
            </span>
            <PushpinOutlined
              style={{ color: "#52c41a", fontSize: "16px", marginLeft: "10px" }}
              className="download"
              onClick={() => pinCode(index)}
            />
            <DownloadOutlined
              style={{ color: "#52c41a", fontSize: "16px", marginLeft: "10px" }}
              className="download"
              onClick={() => downloadCode(index)}
            />
          </div>
        ))}
      </div>
    </ThemeProvider>
  )
}

export default IndexSidePanel
