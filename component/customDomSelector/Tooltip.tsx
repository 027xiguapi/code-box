import {
  CheckOutlined,
  CloseOutlined,
  DownSquareOutlined,
  LeftSquareOutlined,
  RightSquareOutlined,
  UpSquareOutlined
} from "@ant-design/icons"
import { Button, Flex, message, Modal } from "antd"
import React, { useCallback, useEffect, useRef, useState } from "react"

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
    <Flex wrap gap="small">
      <Button
        type="primary"
        size="small"
        icon={<CheckOutlined />}
        onClick={handleConfirm}>
        确定
      </Button>
      <Button
        size="small"
        icon={<UpSquareOutlined />}
        onClick={() => navigateElement("parent")}>
        父节点
      </Button>
      <Button
        size="small"
        icon={<DownSquareOutlined />}
        onClick={() => navigateElement("child")}>
        子节点
      </Button>
      <Button
        size="small"
        icon={<LeftSquareOutlined />}
        onClick={() => navigateElement("prev")}>
        上一个
      </Button>
      <Button
        size="small"
        icon={<RightSquareOutlined />}
        onClick={() => navigateElement("next")}>
        下一个
      </Button>
      <Button
        danger
        size="small"
        icon={<CloseOutlined />}
        onClick={handleCancel}>
        取消
      </Button>
    </Flex>
  )
}
