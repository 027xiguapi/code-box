import { CheckOutlined, CopyOutlined } from "@ant-design/icons"
import type {
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchorList,
  PlasmoGetStyle
} from "plasmo"
import { useState } from "react"
import type { FC } from "react"

import { useStorage } from "@plasmohq/storage/dist/hook"

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
  const [isCopy, setIsCopy] = useState(false)

  const onCopy = async () => {
    try {
      const target = anchor.element as HTMLElement
      const preBlock = target.closest("pre")

      preBlock && navigator.clipboard.writeText(preBlock.textContent)

      setIsCopy(true)
      setTimeout(() => {
        setIsCopy(false)
      }, 1000)
    } catch (error) {
      console.log(error)
    }
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
