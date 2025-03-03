import qrcodeUrl from "raw:~/public/wx/gzh.jpg"
import React, { useState } from "react"

import { i18n } from "~tools"
import makerQRPost from "~utils/makerQRPost"

const boxStyles = {
  box: {
    position: "fixed" as const,
    border: "1px solid #D9DADC",
    left: "25px",
    top: "85px",
    width: "140px",
    padding: "16px",
    cursor: "pointer"
  },
  close: {
    position: "absolute" as const,
    top: "-5px",
    right: "0px",
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "0.5rem"
  },
  img: {
    width: "100%"
  },
  item: {
    color: "#000000",
    fontSize: "1.2rem",
    marginBottom: "3px"
  }
}

export default function ToolBox(props: any) {
  const [isShowTag, setIsShowTag] = useState(true)
  const handleGetDescription = () => {
    props.onGetDescription()
  }

  const handleEditMarkdown = () => {
    props.onEditMarkdown()
  }

  const handleDownloadMarkdown = () => {
    props.onDownloadMarkdown()
  }

  const handleParseMarkdown = () => {
    props.onParseMarkdown()
  }

  const handlePrint = () => {
    props.onPrint()
  }

  const handleClose = () => {
    setIsShowTag(false)
  }

  return isShowTag ? (
    <div id="ws_cmbm" className="ws_cmbmc" style={boxStyles.box}>
      <button style={boxStyles.close} onClick={handleClose} aria-label="Close">
        ×
      </button>
      <img src={qrcodeUrl} alt="qrcodeUrl" style={boxStyles.img} />
      <div style={boxStyles.item}>
        <a onClick={handleGetDescription}>{i18n("getDescription")}</a>
      </div>
      <div style={boxStyles.item}>
        <a onClick={handleEditMarkdown}>{i18n("editMarkdown")}</a>
      </div>
      <div style={boxStyles.item}>
        <a onClick={handleDownloadMarkdown}>{i18n("downloadMarkdown")}</a>
      </div>
      <div style={boxStyles.item}>
        <a onClick={handleParseMarkdown}>{i18n("parseMarkdown")}</a>
      </div>
      <div style={boxStyles.item}>
        <a onClick={handlePrint}>{i18n("downloadPdf")}</a>
      </div>
      <div style={boxStyles.item}>
        <a onClick={() => makerQRPost()}>{i18n("makerQRPost")}</a>
      </div>
      <a style={boxStyles.item} href="https://www.code-box.fun" target="_blank">
        帮助
      </a>
    </div>
  ) : (
    <></>
  )
}
