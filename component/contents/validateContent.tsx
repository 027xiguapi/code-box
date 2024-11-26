import { KeyOutlined } from "@ant-design/icons"
import { Button, Input, Space } from "antd"
import dayjs from "dayjs"
import qrcodeUrl from "raw:~/public/wx/qrcode_wx.jpg"
import { useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/dist/hook"

import { verifyTOTP } from "~utils/2FA"

export default function ValidateContent(props) {
  const [validTime, setValidTime] = useStorage("app-validTime", "1730390400")
  const [isValid, setIsValid] = useState(false)
  const inputRef = useRef(null)

  function handleSubmit() {
    let code = inputRef.current.input.value

    if (verifyTOTP(process.env.PLASMO_PUBLIC_CODEBOX_SECRET1, code)) {
      let time = dayjs().add(20, "day").unix()
      setValidTime(String(time))
      setIsValid(true)
      props.handleOk()
    } else if (verifyTOTP(process.env.PLASMO_PUBLIC_CODEBOX_SECRET2, code)) {
      let time = dayjs().add(65, "day").unix()
      setValidTime(String(time))
      setIsValid(true)
      props.handleOk()
    } else if (process.env.PLASMO_PUBLIC_CODEBOX_SECRET3 == code) {
      let time = dayjs().add(7, "day").unix()
      setValidTime(String(time))
      setIsValid(true)
      props.handleOk()
    }
  }

  function help() {
    sendToBackground({
      name: "tab",
      body: {
        url: "feed.html"
      }
    })
  }

  return (
    <>
      {isValid ? (
        <p className="valid" style={{ fontSize: "16px", color: "red" }}>
          验证成功
        </p>
      ) : (
        <>
          <div style={{ fontSize: "14px", color: "red" }}>
            此功能需要关注公众号【codebox代码助手】获取验证码(
            <a onClick={help} target="_blank">
              帮助
            </a>
            )
          </div>
          <div>
            <img src={qrcodeUrl} alt="微信公众号" />
          </div>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="输入激活码"
              ref={inputRef}
              prefix={<KeyOutlined />}
            />
            <Button
              type="primary"
              className="valid-submit"
              onClick={handleSubmit}>
              提交
            </Button>
          </Space.Compact>
        </>
      )}
    </>
  )
}
