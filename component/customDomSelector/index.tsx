import React, { useEffect, useRef, useState } from "react"
import { createRoot } from "react-dom/client"

import { useMessage } from "@plasmohq/messaging/hook"

import ValidateContent from "~component/contents/validateContent"
import { addCss, saveHtml, saveMarkdown } from "~tools"
import { useEditMarkdown } from "~utils/editMarkdownHook"
import { useParseMarkdown } from "~utils/parseMarkdownHook"
import { Print } from "~utils/print"
import Turndown from "~utils/turndown"

import Tooltip from "../ui/tooltip"

const turndownService = Turndown()

export default function CustomDomSelector() {
  const isReady = useRef(false)
  const isSelect = useRef(false)
  const downloadType = useRef("")
  const [editContent, setEditContent] = useEditMarkdown()
  const [parseContent, setParseContent] = useParseMarkdown()

  const selectorRef = useRef<HTMLElement | null>(null)
  const tooltipRef = useRef<HTMLElement | null>(null)
  const modalRef = useRef<HTMLElement | null>(null)

  const articleTitle = document
    .querySelector<HTMLElement>("head title")
    ?.innerText.trim()

  useEffect(() => {
    addEventListeners()
    addCss(`.codebox-current { outline: 2px solid #42b88350 !important; }`)
    return () => {
      removeEventListeners()
      removeTooltip()
      removeHighlight()
    }
  }, [])

  const createTooltip = () => {
    const tooltip = document.createElement("div")
    tooltip.classList.add("codebox-tooltip")

    document.body.appendChild(tooltip)
    const root = createRoot(tooltip)
    root.render(
      <Tooltip
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onNavigate={navigateElement}
      />
    )
    tooltipRef.current = tooltip
  }

  const removeTooltip = () => {
    if (tooltipRef.current) {
      document.body.removeChild(tooltipRef.current)
      tooltipRef.current = null
    }
  }

  const addEventListeners = () => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("click", handleClick)
  }

  const removeEventListeners = () => {
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("click", handleClick)
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (isReady.current && !isSelect.current) {
      const target = event.target as HTMLElement
      highlightElement(target)
    }
  }

  const handleClick = (event: MouseEvent) => {
    if (isReady.current) {
      const target = event.target as HTMLElement
      const tooltip = target.closest(".codebox-tooltip")
      const modal = target.closest(".codebox-modal")
      const submit = target.closest(".valid-submit")

      if (!tooltip && !modal && !submit) {
        removeTooltip()
        createTooltip()
        isSelect.current = true
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
    selectorRef.current = element
  }

  const removeHighlight = () => {
    const currentList = document.querySelectorAll(".codebox-current")
    currentList.forEach((el) => el.classList.remove("codebox-current"))
    selectorRef.current = null
  }

  const updateTooltipPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const distanceTop = rect.top + window.scrollY
    const distanceLeft = rect.left + window.scrollX
    const top =
      distanceTop < 50 ? distanceTop + rect.height + 5 : distanceTop - 40
    tooltipRef.current.style.top = `${top}px`
    tooltipRef.current.style.left = `${distanceLeft + 5}px`
    window.scrollTo({ top: top - 150, behavior: "smooth" })
  }

  useMessage(async (req: any, res: any) => {
    const name = req.name
    setCustom(name.split("-")[1])
  })

  const setCustom = (type: string) => {
    downloadType.current = type
    isReady.current = true
    isSelect.current = false
  }

  const handleOkModal = () => {
    if (!selectorRef.current || !downloadType.current) return

    const current = document.querySelector(".codebox-current")
    current.classList.remove("codebox-current")

    switch (downloadType.current) {
      case "downloadHtml":
        saveHtml(selectorRef.current, articleTitle)
        break
      case "downloadMarkdown":
        const markdown = turndownService.turndown(selectorRef.current)
        saveMarkdown(markdown, articleTitle)
        break
      case "editMarkdown":
        setEditContent(selectorRef.current)
        break
      case "parseMarkdown":
        setParseContent(selectorRef.current)
        break
      case "downloadPdf":
        const elementToPrint = selectorRef.current
        if (elementToPrint) {
          Print.print(elementToPrint, { title: articleTitle })
            .then(() => console.log("Printing complete"))
            .catch((error) => console.error("Printing failed:", error))
        }
        break
    }

    resetState()
    setTimeout(() => {
      document.body.removeChild(modalRef.current)
      modalRef.current = null
    }, 1000)
  }

  const handleConfirm = () => {
    const modal = document.createElement("div")
    modal.classList.add("codebox-modal")
    modal.style.position = "fixed"
    modal.style.zIndex = "2147483648"
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
    modal.style.width = "100vw"
    modal.style.height = "100vh"
    modal.style.top = "0"
    modal.style.left = "0"
    document.body.appendChild(modal)
    const root = createRoot(modal)
    root.render(
      <ValidateContent
        handleOk={handleOkModal}
        handleCancel={handleCancelModal}
      />
    )
    modalRef.current = modal
  }

  const handleCancel = () => {
    resetState()
  }

  const resetState = () => {
    removeHighlight()
    removeTooltip()
    isReady.current = false
    isSelect.current = false
  }

  const navigateElement = (direction: "parent" | "child" | "prev" | "next") => {
    if (!selectorRef.current) return

    let newElement: HTMLElement | null = null
    switch (direction) {
      case "parent":
        newElement = selectorRef.current.parentElement
        break
      case "child":
        newElement = selectorRef.current.firstElementChild as HTMLElement
        break
      case "prev":
        newElement = selectorRef.current.previousElementSibling as HTMLElement
        break
      case "next":
        newElement = selectorRef.current.nextElementSibling as HTMLElement
        break
    }

    if (newElement) {
      highlightElement(newElement)
      // updateSelectorPosition(newElement)
      updateTooltipPosition(newElement)
    }
  }

  const handleCancelModal = () => {
    document.body.removeChild(modalRef.current)
    modalRef.current = null
  }

  return <div style={{ display: "none" }}></div>
}
