import { ThemeProvider } from "~theme"

import "~index.css"

import {
  DownloadOutlined,
  KeyOutlined,
  PushpinOutlined
} from "@ant-design/icons"
import dayjs from "dayjs"
import { useRef, useState } from "react"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/dist/hook"

import ValidateContent from "~component/contents/validateContent"
import { verifyTOTP } from "~utils/2FA"

import styles from "./index.module.scss"

function IndexSidePanel() {
  const [codes] = useStorage("app-codes", [])

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
          <ValidateContent></ValidateContent>
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
