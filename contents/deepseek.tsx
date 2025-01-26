import dayjs from "dayjs"
import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import QRCodeModal from "~component/ui/QRCodeModal"

export const config: PlasmoCSConfig = {
  matches: ["https://chat.deepseek.com/*"]
}

export default function Deepseek() {
  const [validTime, setValidTime] = useStorage("ai-validTime", "1737872293")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [content, setContent] = useStorage({
    key: "ai-content",
    instance: new Storage({
      area: "local"
    })
  })

  useEffect(() => {
    let timer = null
    let index = 0
    if (content) {
      if (Number(validTime) < dayjs().unix()) {
        timer = setInterval(() => {
          const editorElement = document.querySelector(
            "#chat-input"
          ) as HTMLElement
          index++
          if (editorElement && index < 30) {
            setIsModalOpen(true)
            clearTimeout(timer)
          } else if (index >= 30) {
            clearTimeout(timer)
          }
        }, 1000)
      } else {
        handleSetContent()
      }
    }
    return () => {
      clearTimeout(timer)
    }
  }, [content, validTime])

  const handleCancelModal = () => {
    setContent("")
    setIsModalOpen(false)
  }

  function handleConfirmModal() {
    let time = dayjs().add(1, "day").unix()

    setValidTime(String(time))
    handleSetContent()
    setTimeout(() => {
      setIsModalOpen(false)
    }, 500)
  }

  function handleSetContent() {
    const editorElement = document.querySelector(
      "#chat-input"
    ) as HTMLInputElement

    const buttonElement = document.querySelector(".f6d670") as HTMLElement

    if (editorElement) {
      editorElement.value = content
      editorElement.dispatchEvent(new Event("input", { bubbles: true }))
      editorElement.dispatchEvent(new Event("change", { bubbles: true }))
      editorElement.focus()
      editorElement.setSelectionRange(
        editorElement.value.length,
        editorElement.value.length
      )
      document.execCommand("InsertText", false, content)

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
