import {
  CheckOutlined,
  CloseOutlined,
  DownSquareOutlined,
  LeftSquareOutlined,
  RightSquareOutlined,
  UpSquareOutlined
} from "@ant-design/icons"
import React from "react"

const tooltipStyles = {
  tooltip: {
    backgroundColor: "#fff"
  },
  button: {
    backgroundColor: "#fff",
    border: "1px solid #eee",
    color: "#000",
    borderRadius: "4px",
    padding: "2px 7px",
    fontSize: "14px"
  },
  blueButton: {
    backgroundColor: "#1677FF",
    border: "1px solid #1677FF",
    color: "#fff",
    borderRadius: "4px",
    padding: "2px 7px",
    fontSize: "14px"
  },
  redButton: {
    backgroundColor: "#d9363e",
    border: "1px solid #d9363e",
    color: "#fff",
    borderRadius: "4px",
    padding: "2px 7px",
    fontSize: "14px"
  }
}

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
    <div style={tooltipStyles.tooltip as React.CSSProperties}>
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
