import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import QRCodeModal from "~component/ui/QRCodeModal"

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*", "https://chatgpt.com/c/*"]
}

export default function Chatgpt() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [content, setContent] = useStorage({
    key: "chatgpt-content",
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
          "._prosemirror-parent_cy42l_1 p"
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
      "._prosemirror-parent_cy42l_1 p"
    ) as HTMLElement

    if (editorElement) {
      editorElement.innerText = content

      let index = 0
      const timer = setInterval(() => {
        const buttonElement = document.querySelector(
          "button[data-testid=send-button]"
        ) as HTMLElement
        index++
        console.log(buttonElement, index)
        if (buttonElement && index < 30) {
          buttonElement.click()
          setContent("")
          clearTimeout(timer)
        } else if (index >= 30) {
          clearTimeout(timer)
        }
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
