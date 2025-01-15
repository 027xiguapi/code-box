import { SyncOutlined } from "@ant-design/icons"
import React from "react"

import { tooltipStyles } from "../styles/domSelector"

export default function Tooltip(props: any) {
  const handleConfirm = () => {
    props.onConfirm()
  }

  return (
    <div style={tooltipStyles.tooltip}>
      <button style={tooltipStyles.blueButton} onClick={handleConfirm}>
        <SyncOutlined /> 同步
      </button>
    </div>
  )
}
