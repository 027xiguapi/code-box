import React from "react"

import ValidateContent from "~component/contents/validateContent"

const Modal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  }

  const modalStyle = {
    background: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center"
  }

  const modalButtonsStyle = {
    marginTop: "20px"
  }

  const buttonStyle = {
    borderRadius: "4px",
    padding: "2px 7px",
    margin: "0 10px",
    fontSize: "16px",
    cursor: "pointer"
  }

  const cancelBtnStyle = {
    ...buttonStyle,
    backgroundColor: "#d9363e",
    border: "1px solid #d9363e",
    color: "#fff"
  }

  const confirmBtnStyle = {
    ...buttonStyle,
    backgroundColor: "#1677FF",
    border: "1px solid #1677FF",
    color: "#fff"
  }

  return (
    <div style={modalOverlayStyle as React.CSSProperties}>
      <div style={modalStyle as React.CSSProperties}>
        <ValidateContent
          type="parseMarkdown"
          handleOk={onConfirm}
          handleCancel={onClose}
        />
      </div>
    </div>
  )
}

export default Modal
