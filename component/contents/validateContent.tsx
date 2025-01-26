import { CheckOutlined, CloseOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import qrcodeUrl from "raw:~/public/wx/qrcode_wx.jpg"
import React, { useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/dist/hook"

const validateContent = {
  blueButton: {
    backgroundColor: "#1677FF",
    border: "1px solid #1677FF",
    color: "#fff",
    borderRadius: "4px",
    padding: "7px 15px",
    fontSize: "14px"
  },
  redButton: {
    backgroundColor: "#d9363e",
    border: "1px solid #d9363e",
    color: "#fff",
    borderRadius: "4px",
    padding: "7px 15px",
    fontSize: "14px"
  }
}

export default function ValidateContent(props) {
  const [validTime, setValidTime] = useStorage("app-validTime", "1730390400")
  const [activationCode, setActivationCode] = useState("")
  const [isValid, setIsValid] = useState(true)

  const handleChange = (event) => {
    const code = event.target.value
    setActivationCode(code)
  }

  function handleSubmit() {
    if (Number(validTime) > dayjs().unix()) {
      props.handleOk()
    } else if (process.env.PLASMO_PUBLIC_CODEBOX_SECRET3 == activationCode) {
      let time = dayjs().add(7, "day").unix()
      setValidTime(String(time))
      setIsValid(true)
      props.handleOk()
    } else {
      setIsValid(false)
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

  const typeMap = {
    downloadHtml: "下载HTML",
    downloadMarkdown: "下载markdown",
    editMarkdown: "编辑markdown",
    parseMarkdown: "解析markdown",
    downloadPdf: "下载PDF"
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
      {Number(validTime) > dayjs().unix() ? (
        <p className="valid" style={{ fontSize: "16px", color: "red" }}>
          已激活！确认{typeMap[props.type]}？
        </p>
      ) : (
        <>
          <div style={{ fontSize: "14px", color: "red" }}>
            此功能需要关注公众号
            <p>
              【codebox代码助手】获取验证码(
              <a onClick={help} target="_blank">
                帮助
              </a>
              )
            </p>
          </div>
          <div>
            <img style={{ margin: "auto" }} src={qrcodeUrl} alt="微信公众号" />
          </div>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
            <label
              htmlFor="activationCodeInput"
              style={{ display: "block", marginRight: "7px" }}>
              验证码:
            </label>
            <input
              type="text"
              id="activationCodeInput"
              value={activationCode}
              onChange={handleChange}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: isValid ? "1px solid #ccc" : "1px solid red",
                width: "200px",
                fontSize: "14px"
              }}
              placeholder="请输入验证码"
            />
          </div>
          {!isValid ? (
            <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
              验证码错误
            </div>
          ) : (
            <></>
          )}
        </>
      )}
      <div
        style={{
          margin: "10px 50px 0",
          display: "flex",
          justifyContent: "space-between"
        }}>
        <button
          className="valid-submit"
          style={validateContent.blueButton}
          onClick={handleSubmit}>
          <CheckOutlined /> 提交
        </button>
        <button style={validateContent.redButton} onClick={handleCancel}>
          <CloseOutlined /> 取消
        </button>
      </div>
    </div>
  )
}
