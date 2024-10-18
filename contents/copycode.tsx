import { CheckOutlined, CopyOutlined } from "@ant-design/icons"
import type {
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchorList,
  PlasmoGetStyle
} from "plasmo"
import { useEffect, useState } from "react"
import type { FC } from "react"
import { v4 as uuidv4 } from "uuid"

import { useStorage } from "@plasmohq/storage/dist/hook"

import { addCss, removeCss } from "~tools"

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
  .codebox-copyCodeBtn {
    display: inline-block;
    border-radius: 4;
    background-color: rgba(242, 247, 252, .5);
    padding: 4;
    border: 0;
    position: relative;
    top: 1px;
    left: 1px;
  }
  .codebox-copyCodeBtn:hover {
    background-color: rgba(242, 247, 252, 1);
    cursor: pointer;
  }
  `
  return style
}

export const getOverlayAnchorList: PlasmoGetOverlayAnchorList = async () =>
  document.querySelectorAll("pre")

const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [copyCode] = useStorage("config-copyCode", true)
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [isCopy, setIsCopy] = useState(false)

  useEffect(() => {
    copyCodeCssFunc(copyCode)
  }, [copyCode])

  const onCopy = async () => {
    try {
      const target = anchor.element as HTMLElement
      const preBlock = target.closest("pre")
      const codeBlock = target.querySelector("code")
      let textContent = ""

      if (codeBlock) {
        textContent = codeBlock.textContent
      } else {
        textContent = preBlock && preBlock.textContent
      }

      navigator.clipboard.writeText(textContent)

      setHistory((prevData) =>
        prevData
          ? [
              {
                id: uuidv4(),
                value: codeBlock.innerText,
                createdAt: new Date(),
                from: "CSDN",
                link: location.href,
                tags: [],
                remark: ""
              },
              ...prevData
            ]
          : [
              {
                id: uuidv4(),
                value: codeBlock.innerText,
                createdAt: new Date(),
                from: "CSDN",
                link: location.href,
                tags: [],
                remark: ""
              }
            ]
      )

      setIsCopy(true)
      setTimeout(() => {
        setIsCopy(false)
      }, 1000)
    } catch (error) {
      console.log(error)
    }
  }

  function copyCodeCssFunc(copyCode) {
    copyCode
      ? addCss(
          `
      #article .jb51code,
      #article .code {
        -webkit-touch-callout: auto !important;
        -webkit-user-select: auto !important;
        -khtml-user-select: auto !important;
        -moz-user-select: auto !important;
        -ms-user-select: auto !important;
        user-select: auto !important;
      }
      .php-article .code,
      .php-article{
        -webkit-touch-callout: auto !important;
        -webkit-user-select: auto !important;
        -khtml-user-select: auto !important;
        -moz-user-select: auto !important;
        -ms-user-select: auto !important;
        user-select: auto !important;
      }
      `,
          "codebox-copyCodeCss"
        )
      : removeCss("codebox-copyCodeCss")
  }

  return (
    <>
      {copyCode ? (
        <button onClick={onCopy} className="codebox-copyCodeBtn" style={{}}>
          {isCopy ? (
            <CheckOutlined
              style={{
                fontSize: 16
              }}
            />
          ) : (
            <CopyOutlined
              style={{
                fontSize: 16
              }}
            />
          )}
        </button>
      ) : (
        <></>
      )}
    </>
  )
}

export default PlasmoOverlay
