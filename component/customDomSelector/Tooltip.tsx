import {
  CheckOutlined,
  CloseOutlined,
  DownSquareOutlined,
  LeftSquareOutlined,
  RightSquareOutlined,
  UpSquareOutlined
} from "@ant-design/icons"
import React from "react"

import { tooltipStyles } from "../styles/domSelector"

export default function Tooltip(props: any) {
  const handleConfirm = () => {
    props.onConfirm()
  }

  const navigateElement = (direction: "parent" | "child" | "prev" | "next") => {
    props.onNavigate(direction)
  }

  const handleCancel = () => {
    props.onCancel()
  }

  return (
    <div style={tooltipStyles.tooltip}>
      <button style={tooltipStyles.blueButton} onClick={handleConfirm}>
        <CheckOutlined /> 确定
      </button>
      <button
        style={tooltipStyles.button}
        onClick={() => navigateElement("parent")}>
        <UpSquareOutlined /> 父节点
      </button>
      <button
        style={tooltipStyles.button}
        onClick={() => navigateElement("child")}>
        <DownSquareOutlined /> 子节点
      </button>
      <button
        style={tooltipStyles.button}
        onClick={() => navigateElement("prev")}>
        <LeftSquareOutlined /> 上一个
      </button>
      <button
        style={tooltipStyles.button}
        onClick={() => navigateElement("next")}>
        <RightSquareOutlined /> 下一个
      </button>
      <button style={tooltipStyles.redButton} onClick={handleCancel}>
        <CloseOutlined /> 取消
      </button>
    </div>
  )
}
