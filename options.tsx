import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import React, { useState } from "react"

import { useStorage } from "@plasmohq/storage/dist/hook"

import SortableItem from "~component/sortableItem"
import { ThemeProvider } from "~theme"

import "./index.css"

export default function IndexOptions() {
  const itemsInit = [
    {
      id: "1",
      value: "csdn",
      label: "csdn",
      isShow: true
    },
    {
      id: "2",
      value: "zhihu",
      label: "知乎",
      isShow: true
    },
    {
      id: "3",
      value: "baidu",
      label: "百度",
      isShow: true
    },
    {
      id: "4",
      value: "jianshu",
      label: "简书",
      isShow: true
    },
    {
      id: "5",
      value: "jb51",
      label: "脚本之家",
      isShow: true
    },
    {
      id: "6",
      value: "cnblogs",
      label: "博客园",
      isShow: true
    },
    {
      id: "7",
      value: "51cto",
      label: "51CTO",
      isShow: true
    },
    {
      id: "8",
      value: "custom",
      label: "自定义",
      isShow: true
    }
  ]
  const [items, setItems] = useStorage("app-items", itemsInit)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  function handleDragEnd(event) {
    const { active, over } = event

    if (active.id !== over.id) {
      setItems((data) => {
        const oldIndex = data.findIndex((item) => item.id === active.id)
        const newIndex = data.findIndex((item) => item.id === over.id)

        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  function handleToggleShow(event) {
    const { isShow, index } = event

    items[index].isShow = !isShow
    setItems([...items])
  }

  function handleReset() {
    if (confirm("确认重置配置？")) {
      setItems([...itemsInit])
    }
  }

  return (
    <ThemeProvider>
      <div className="App options">
        <div className="App-header">
          <h2 className="title">CodeBox 🎉</h2>
          <p className="desc">{chrome.i18n.getMessage("popupDescription")}</p>
        </div>
        <div className="App-body">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}>
            <SortableContext
              items={items}
              strategy={verticalListSortingStrategy}>
              {items.map((item, index) => (
                <SortableItem
                  key={item.id}
                  index={index}
                  item={item}
                  onToggleShow={handleToggleShow}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <div className="App-link">
          <div className="item">
            {chrome.i18n.getMessage("version")}：
            {chrome.runtime.getManifest().version}
          </div>
          <div className="item">
            <button className="reset" onClick={handleReset}>
              {chrome.i18n.getMessage("reset")}
            </button>
          </div>
          <div className="item">
            <a
              className="btn"
              href="/tabs/history.html"
              target="_blank"
              rel="noreferrer">
              {chrome.i18n.getMessage("history")}🕮
            </a>
          </div>
          <div className="item">
            <a
              className="btn"
              href="https://027xiguapi.github.io/code-box/privacy-policy.html"
              target="_blank"
              rel="noreferrer">
              {chrome.i18n.getMessage("privacy")}📄
            </a>
          </div>
          <div>
            <a
              className="btn"
              href="https://github.com/027xiguapi/code-box"
              target="_blank"
              rel="noreferrer">
              {chrome.i18n.getMessage("support")}👍
            </a>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
