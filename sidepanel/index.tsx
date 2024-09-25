import { ThemeProvider } from "~theme"

import "~index.css"

import {
  DownloadOutlined,
  KeyOutlined,
  PushpinOutlined
} from "@ant-design/icons"
import { Button, Input, Space } from "antd"
import dayjs from "dayjs"
import qrcodeUrl from "raw:~/public/wx/qrcode_wx.jpg"
import { useRef, useState } from "react"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/dist/hook"

import { verifyTOTP } from "~utils/2FA"

import styles from "./index.module.scss"

function IndexSidePanel() {
  const [codes] = useStorage("app-codes", [])
  const [validTime, setValidTime] = useStorage("app-validTime", "1730390400")
  const [isValid, setIsValid] = useState(false)
  const inputRef = useRef(null)

  function pinCode(index) {
    sendToContentScript({ name: `custom-scrollIntoViewCode`, body: { index } })
  }

  function downloadCode(index) {
    sendToContentScript({ name: `custom-downloadCode`, body: { index } })
  }

  function handleSubmit() {
    let code = inputRef.current.input.value

    if (verifyTOTP(process.env.PLASMO_PUBLIC_CODEBOX_SECRET1, code)) {
      let time = dayjs().add(20, "day").unix()
      setValidTime(String(time))
      setIsValid(true)
    } else if (verifyTOTP(process.env.PLASMO_PUBLIC_CODEBOX_SECRET2, code)) {
      let time = dayjs().add(65, "day").unix()
      setValidTime(String(time))
      setIsValid(true)
    } else if (process.env.PLASMO_PUBLIC_CODEBOX_SECRET3 == code) {
      let time = dayjs().add(7, "day").unix()
      setValidTime(String(time))
      setIsValid(true)
    }
  }

  return (
    <ThemeProvider>
      <div className={`${styles.sidepanel}`}>
        <div className="wechat">
          <h1>微信公众号</h1>
          <p className="wechatDesc">关注公众号，了解更多功能</p>
          <img className="wechatImg" src={qrcodeUrl} alt="微信公众号" />
          {isValid ? (
            <p className="valid">已验证</p>
          ) : (
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="输入激活码"
                ref={inputRef}
                prefix={<KeyOutlined />}
              />
              <Button type="primary" onClick={handleSubmit}>
                提交
              </Button>
            </Space.Compact>
          )}
        </div>
        <div className="content">
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
