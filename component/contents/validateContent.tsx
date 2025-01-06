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
    let code = inputRef.current?.input?.value

    if (isValid || Number(validTime) > dayjs().unix()) {
      props.handleOk()
    } else if (verifyTOTP(process.env.PLASMO_PUBLIC_CODEBOX_SECRET1, code)) {
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

  function handleCancel() {
    props.handleCancel()
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
    <div
      style={{
        width: "350px",
        padding: "10px",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        borderRadius: "5px",
        textAlign: "center"
      }}>
      {isValid || Number(validTime) > dayjs().unix() ? (
        <p className="valid" style={{ fontSize: "16px", color: "red" }}>
          已激活！确认下载？
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
            <img style={{ margin: "auto" }} src={qrcodeUrl} alt="微信公众号" />
          </div>
          <div style={{ marginTop: "10px" }}>
            <Input
              placeholder="输入激活码"
              ref={inputRef}
              prefix={<KeyOutlined />}
            />
          </div>
        </>
      )}
      <div
        style={{
          margin: "10px 50px 0",
          display: "flex",
          justifyContent: "space-between"
        }}>
        <Button type="primary" className="valid-submit" onClick={handleSubmit}>
          提交
        </Button>
        <Button onClick={handleCancel}>取消</Button>
      </div>
    </div>
  )
}
