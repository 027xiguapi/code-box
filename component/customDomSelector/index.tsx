import { Modal } from "antd"
import React, { useEffect, useRef, useState } from "react"
import { createRoot } from "react-dom/client"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import { addCss, saveHtml, saveMarkdown, scrollToTop, setIcon } from "~tools"
import { savePdf } from "~utils/downloadPdf"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

import Tooltip from "./Tooltip"

const turndownService = Turndown()

export default function CustomDomSelector() {
  const isReady = useRef(false)
  const isSelect = useRef(false)
  const downloadType = useRef("")
  const [content, setContent] = useContent()
  const [validTime] = useStorage("app-validTime", "1730390400")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const selectorRef = useRef<HTMLElement | null>(null)
  const tooltipRef = useRef<HTMLElement | null>(null)

  const articleTitle = document
    .querySelector<HTMLElement>("head title")
    ?.innerText.trim()

  useEffect(() => {
    addEventListeners()
    setIcon(true)
    addCss(`.codebox-current { outline: 2px solid #42b88350 !important; }`)
    return () => {
      removeEventListeners()
      // removeSelector()
      removeTooltip()
      removeHighlight()
    }
  }, [])

  const createSelector = () => {
    const selector = document.createElement("div")
    selector.classList.add("codebox-selector")
    selector.style.position = "absolute"
    selector.style.pointerEvents = "none"
    selector.style.zIndex = "2147483640"
    selector.style.backgroundColor = "#42b88325"
    selector.style.border = "2px solid #42b88350"
    selector.style.borderRadius = "2px"
    selector.style.transition = "all 0.1s ease-in"
    selector.style.display = "none"
    document.body.appendChild(selector)
    selectorRef.current = selector
  }

  const createTooltip = () => {
    const tooltip = document.createElement("div")
    tooltip.classList.add("codebox-tooltip")
    tooltip.style.position = "absolute"
    tooltip.style.zIndex = "2147483641"
    tooltip.style.backgroundColor = "#fff"
    tooltip.style.border = "1px solid #eee"
    tooltip.style.borderRadius = "5px"
    tooltip.style.padding = "8px"
    tooltip.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)"
    // tooltip.style.display = "none"
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

  const removeSelector = () => {
    if (selectorRef.current) {
      document.body.removeChild(selectorRef.current)
    }
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
      // updateSelectorPosition(target)
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
        // updateSelectorPosition(target)
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

  const updateSelectorPosition = (element: HTMLElement) => {
    if (selectorRef.current) {
      const rect = element.getBoundingClientRect()
      selectorRef.current.style.top = `${rect.top + window.scrollY}px`
      selectorRef.current.style.left = `${rect.left + window.scrollX}px`
      selectorRef.current.style.width = `${rect.width}px`
      selectorRef.current.style.height = `${rect.height}px`
      selectorRef.current.style.display = "block"
    }
  }

  const updateTooltipPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const distanceTop = rect.top + window.scrollY
    const distanceLeft = rect.left + window.scrollX
    const top =
      distanceTop < 50 ? distanceTop + rect.height + 5 : distanceTop - 40
    tooltipRef.current.style.top = `${top}px`
    tooltipRef.current.style.left = `${distanceLeft + 5}px`
    scrollToTop(tooltipRef.current)
  }

  useMessage(async (req: any, res: any) => {
    if (req.name == "custom-downloadHtml") {
      setCustom("html")
    }
    if (req.name == "custom-downloadMarkdown") {
      setCustom("downloadMarkdown")
    }
    if (req.name == "custom-editMarkdown") {
      setCustom("editMarkdown")
    }
    if (req.name == "custom-downloadPdf") {
      setCustom("pdf")
    }
    if (req.name == "custom-downloadImg") {
      setCustom("img")
    }
  })

  const setCustom = (type: string) => {
    downloadType.current = type
    isReady.current = true
    isSelect.current = false
  }

  const handleConfirm = () => {
    if (!selectorRef.current || !downloadType.current) return
    switch (downloadType.current) {
      case "html":
        saveHtml(selectorRef.current, articleTitle)
        break
      case "downloadMarkdown":
        const markdown = turndownService.turndown(selectorRef.current)
        saveMarkdown(markdown, articleTitle)
        break
      case "editMarkdown":
        setContent(".codebox-current")
        break
      case "pdf":
        savePdf(selectorRef.current, articleTitle)
        break
    }

    resetState()
  }

  const handleCancel = () => {
    resetState()
  }

  const resetState = () => {
    removeHighlight()
    // removeSelector()
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

  const handleOkModal = () => {
    setIsModalOpen(false)
  }

  const handleCancelModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Modal
        title="Basic Modal"
        className="codebox-modal"
        open={isModalOpen}
        onOk={handleOkModal}
        onCancel={handleCancelModal}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </>
  )
}
