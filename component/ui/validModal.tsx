import dayjs from "dayjs"
import qrcodeUrl from "raw:~/public/wx/gzh.jpg"
import React, { useEffect, useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/dist/hook"

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  container: {
    width: "350px",
    padding: "2rem",
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    borderRadius: "5px",
    textAlign: "center" as const,
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
  },
  closeButton: {
    position: "absolute" as const,
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "0.5rem"
  },
  activatedText: {
    fontSize: "16px",
    color: "red"
  },
  noticeText: {
    fontSize: "14px",
    color: "red"
  },
  helpLink: {
    cursor: "pointer"
  },
  qrcodeImage: {
    margin: "auto"
  },
  inputContainer: {
    marginTop: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  label: {
    display: "block",
    marginRight: "7px"
  },
  captchaSection: {
    marginTop: "1.5rem",
    borderTop: "1px solid #eee",
    paddingTop: "1.5rem"
  },
  captchaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem"
  },
  captchaText: {
    fontSize: "1.2rem",
    letterSpacing: "2px",
    color: "#333"
  },
  inputGroup: {
    display: "flex",
    gap: "0.5rem"
  },
  input: {
    flex: 1,
    padding: "0.8rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    outline: "none",
    "&:focus": {
      borderColor: "#007bff"
    }
  },
  verifyButton: {
    padding: "0.8rem 1.5rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#0056b3"
    }
  },
  errorText: {
    color: "#ff4444",
    fontSize: "0.9rem",
    marginTop: "0.5rem"
  }
}

export default function ValidModal(props) {
  const [validTime, setValidTime] = useStorage("app-validTime", "1730390400")
  const [inputCode, setInputCode] = useState<string>("")
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    if (Number(validTime) > dayjs().unix()) {
      setTimeout(() => {
        handleSubmit()
      }, 1000)
    }
  }, [validTime])

  function handleSubmit() {
    if (Number(validTime) > dayjs().unix()) {
      props.onConfirm()
    } else if (process.env.PLASMO_PUBLIC_CODEBOX_SECRET3 == inputCode) {
      let time = dayjs().add(7, "day").unix()
      setValidTime(String(time))
      setIsValid(true)
      props.onConfirm()
    } else {
      setIsValid(false)
    }
  }

  function handleCancel() {
    props.onClose()
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
    <div style={styles.overlay} className="codebox-modal">
      <div style={styles.container}>
        <button
          style={styles.closeButton}
          onClick={handleCancel}
          aria-label="Close">
          ×
        </button>
        {Number(validTime) > dayjs().unix() ? (
          <>
            <p style={styles.activatedText}>
              已激活！正在{typeMap[props.type]}...
            </p>
          </>
        ) : (
          <>
            <div style={styles.noticeText}>
              此功能需要关注公众号
              <p>
                【codebox代码助手】获取验证码(
                <a onClick={help} target="_blank" style={styles.helpLink}>
                  帮助
                </a>
                )
              </p>
            </div>
            <div>
              <img
                style={styles.qrcodeImage}
                src={qrcodeUrl}
                alt="微信公众号"
              />
            </div>
            <div style={styles.captchaSection}>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d\s]/g, "")
                    setInputCode(val)
                    setIsValid(null) // 清除验证状态
                  }}
                  placeholder="请输入验证码"
                  style={{
                    ...styles.input,
                    borderColor: isValid === false ? "#ff4444" : "#ddd"
                  }}
                  maxLength={11} // 6数字+5空格
                />
                <button style={styles.verifyButton} onClick={handleSubmit}>
                  验证
                </button>
              </div>
              {isValid === false && (
                <div style={styles.errorText}>验证码错误，请重新输入</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
