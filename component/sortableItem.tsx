import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import React from "react"

import Csdn from "~component/csdn"
import Zhihu from "~component/zhihu"
import Jianshu from "~component/jianshu"
import Jb51 from "~component/jb51"
import Cnblogs from "~component/cnblogs"
import Cto51 from "~component/51cto"
import Php from "~component/php"
import Custom from "~component/custom"

import "./sortableItem.css"

const itemMap = {
  csdn: <Csdn />,
  zhihu: <Zhihu />,
  jianshu: <Jianshu />,
  jb51: <Jb51 />,
  cnblogs: <Cnblogs />,
  "51cto": <Cto51 />,
  php: <Php />,
  custom: <Custom />
}

export default function SortableItem(props) {
  const { item, index, onToggleShow } = props
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }


  function handleToggleShow() {
    onToggleShow({ isShow: item.isShow, index: index })
  }

  return (
    <div ref={setNodeRef} style={style} className="sortableItem">
      {itemMap[item.value]}
      <span className="isShow-toggle" onClick={handleToggleShow}>
      {item.isShow ?
        <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 36C35.0457 36 44 24 44 24C44 24 35.0457 12 24 12C12.9543 12 4 24 4 24C4 24 12.9543 36 24 36Z"
                fill="none" stroke="#333" strokeWidth="4" strokeLinejoin="round" />
          <path
            d="M24 29C26.7614 29 29 26.7614 29 24C29 21.2386 26.7614 19 24 19C21.2386 19 19 21.2386 19 24C19 26.7614 21.2386 29 24 29Z"
            fill="none" stroke="#333" strokeWidth="4" strokeLinejoin="round" />
        </svg>

        : <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9.85786 18C6.23858 21 4 24 4 24C4 24 12.9543 36 24 36C25.3699 36 26.7076 35.8154 28 35.4921M20.0318 12.5C21.3144 12.1816 22.6414 12 24 12C35.0457 12 44 24 44 24C44 24 41.7614 27 38.1421 30"
            stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M20.3142 20.6211C19.4981 21.5109 19 22.6972 19 23.9998C19 26.7612 21.2386 28.9998 24 28.9998C25.3627 28.9998 26.5981 28.4546 27.5 27.5705"
            stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M42 42L6 6" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }
      </span>
      <button {...listeners} className="draggable-handle button">
        <svg viewBox="0 0 20 20" width="12">
          <path
            d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
        </svg>
      </button>
    </div>
  )
}
