import { CloseOutlined } from "@ant-design/icons"
import React, { useState } from "react"

import { i18n } from "~tools"

const tagsStyles = {
  tags: {
    height: "28px",
    display: "flex",
    cursor: "pointer",
    alignItems: "center",
    color: "#1e80ff",
    width: "160px",
    backgroundColor: "rgb(255, 255, 255, .3)",
    borderRadius: "5px",
    justifyContent: "space-between",
    padding: "0 8px",
    marginTop: "-20px",
    fontSize: "14px"
  }
}

export default function Tags(props: any) {
  const [isShowTag, setIsShowTag] = useState(true)
  const handleEdit = () => {
    props.onEdit()
  }

  const handleDownload = () => {
    props.onDownload()
  }

  const handleParse = () => {
    props.onParse()
  }

  const handlePrint = () => {
    props.onPrint()
  }

  const handleClose = () => {
    setIsShowTag(false)
  }

  return isShowTag ? (
    <div className="codebox-tagBtn" style={tagsStyles.tags}>
      <div onClick={handleEdit} className="btn">
        {i18n("edit")}
      </div>
      <div onClick={handleDownload} className="btn">
        {i18n("download")}
      </div>
      <div onClick={handlePrint} className="btn">
        {i18n("print")}
      </div>
      <div onClick={handleParse} className="btn">
        {i18n("parse")}
      </div>
      <div onClick={handleClose} className="btn">
        <CloseOutlined />
      </div>
    </div>
  ) : (
    <></>
  )
}
