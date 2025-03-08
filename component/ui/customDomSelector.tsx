import React, { useEffect, useRef, useState } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/dist/hook"

import ValidModal from "~component/ui/validModal"
import { addCss, saveHtml, saveMarkdown } from "~tools"
import { useEditMarkdown } from "~utils/editMarkdownHook"
import { useParseMarkdown } from "~utils/parseMarkdownHook"
import { Print } from "~utils/print"
import Turndown from "~utils/turndown"

import Tooltip from "../ui/tooltip"

const turndownService = Turndown()

export default function CustomDomSelector() {
  const [aiType, setAiType] = useStorage("app-aiType")
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [isReady, setIsReady] = useState(false)
  const [isSelect, setIsSelect] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const downloadType = useRef("")
  const [editContent, setEditContent] = useEditMarkdown()
  const [parseContent, setParseContent] = useParseMarkdown()

  const articleTitle = document
    .querySelector<HTMLElement>("head title")
    ?.innerText.trim()

  useEffect(() => {
    if (aiType) {
      addCss(`.codebox-current { outline: 2px solid #42b88350 !important; }`)
      if (isReady) {
        addEventListeners()
      } else {
        removeEventListeners()
      }
    }
    return () => {
      removeEventListeners()
    }
  }, [aiType, isReady, isSelect])

  const addEventListeners = () => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("click", handleClick)
  }

  const removeEventListeners = () => {
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("click", handleClick)
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (isReady && !isSelect) {
      const target = event.target as HTMLElement
      highlightElement(target)
    }
  }

  const handleClick = (event: MouseEvent) => {
    if (isReady) {
      const target = event.target as HTMLElement
      const tooltip = target.closest(".codebox-tooltip")
      const modal = target.closest(".codebox-modal")
      const csui = target.closest("#codebox-csui")

      if (!tooltip && !modal && !csui) {
        setIsSelect(true)
        highlightElement(target)
        updateTooltipPosition(target)
        event.stopPropagation()
        event.preventDefault()
      }
    }
  }

  const highlightElement = (element: HTMLElement) => {
    removeHighlight()
    element.classList.add("codebox-current")
  }

  const removeHighlight = () => {
    const currentList = document.querySelectorAll(".codebox-current")
    currentList.forEach((el) => el.classList.remove("codebox-current"))
  }

  const updateTooltipPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const distanceTop = rect.top + window.scrollY
    const distanceLeft = rect.left + window.scrollX
    const top =
      distanceTop < 50 ? distanceTop + rect.height + 5 : distanceTop - 40
    const left = distanceLeft + 5

    setPosition({ top: top, left: left })
    window.scrollTo({ top: top - 150, behavior: "smooth" })
  }

  useMessage(async (req: any, res: any) => {
    const name = req.name
    const isApp = name.split("-")[0] == "app"
    console.log(isApp)
    if (name && !isApp) {
      const type = name.split("-")[1]
      setCustom(type)
    }
  })

  const setCustom = (type: string) => {
    downloadType.current = type
    setIsReady(true)
    setIsSelect(false)
  }

  const handleOkModal = () => {
    const selector = document.querySelector<HTMLElement>(".codebox-current")
    if (!selector || !downloadType.current) return

    selector.classList.remove("codebox-current")

    switch (downloadType.current) {
      case "downloadHtml":
        saveHtml(selector, articleTitle)
        break
      case "downloadMarkdown":
        const markdown = turndownService.turndown(selector)
        saveMarkdown(markdown, articleTitle)
        break
      case "editMarkdown":
        setEditContent(selector)
        break
      case "parseMarkdown":
        setParseContent(selector, aiType)
        break
      case "downloadPdf":
        Print.print(selector, { title: articleTitle })
          .then(() => console.log("Printing complete"))
          .catch((error) => console.error("Printing failed:", error))
        break
    }

    resetState()
    setTimeout(() => {
      setIsModalOpen(false)
    }, 1000)
  }

  const handleConfirm = () => {
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    resetState()
  }

  const resetState = () => {
    removeHighlight()
    setIsSelect(false)
    setIsReady(false)
  }

  const navigateElement = (direction: "parent" | "child" | "prev" | "next") => {
    const selector = document.querySelector(".codebox-current")
    if (!selector) return
    let newElement: HTMLElement | null = null
    switch (direction) {
      case "parent":
        newElement = selector.parentElement
        break
      case "child":
        newElement = selector.firstElementChild as HTMLElement
        break
      case "prev":
        newElement = selector.previousElementSibling as HTMLElement
        break
      case "next":
        newElement = selector.nextElementSibling as HTMLElement
        break
    }

    if (newElement) {
      highlightElement(newElement)
      updateTooltipPosition(newElement)
    }
  }

  const handleCancelModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      {isSelect && (
        <Tooltip
          left={position.left}
          top={position.top}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onNavigate={navigateElement}
        />
      )}
      {isModalOpen && (
        <ValidModal
          onClose={handleCancelModal}
          onConfirm={handleOkModal}
          type={downloadType.current}
        />
      )}
    </>
  )
}
