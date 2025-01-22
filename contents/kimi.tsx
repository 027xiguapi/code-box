import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import QRCodeModal from "~component/ui/QRCodeModal"

export const config: PlasmoCSConfig = {
  matches: ["https://kimi.moonshot.cn/*", "https://kimi.moonshot.cn/chat/*"]
}

export default function Kimi() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [content, setContent] = useStorage({
    key: "kimi-content",
    instance: new Storage({
      area: "local"
    })
  })

  useEffect(() => {
    let timer = null
    let index = 0
    if (content) {
      timer = setInterval(() => {
        const editorElement = document.querySelector(
          "div[data-lexical-editor=true]"
        )
        index++
        if (editorElement && index < 30) {
          setIsModalOpen(true)
          clearTimeout(timer)
        } else if (index >= 30) {
          clearTimeout(timer)
        }
      }, 1000)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [content])

  const handleCancelModal = () => {
    setContent("")
    setIsModalOpen(false)
  }

  function handleConfirmModal() {
    handleSetContent()
    setTimeout(() => {
      setIsModalOpen(false)
    }, 500)
  }

  function handleSetContent() {
    const editorElement = document.querySelector(
      "div[data-lexical-editor=true]"
    ) as HTMLElement

    const buttonElement = document.querySelector(
      ".chat-editor-action .send-button"
    ) as HTMLElement

    if (editorElement) {
      editorElement.focus()

      const event = new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        data: content,
        inputType: "insertText"
      })

      editorElement.dispatchEvent(event)
      setContent("")

      setTimeout(() => {
        buttonElement.click()
      }, 1000)
    }
  }

  return (
    <>
      {isModalOpen && (
        <QRCodeModal
          onClose={handleCancelModal}
          onConfirm={handleConfirmModal}
        />
      )}
    </>
  )
}
