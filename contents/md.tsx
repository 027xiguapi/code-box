import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/dist/hook"

export const config: PlasmoCSConfig = {
  matches: ["https://md.randbox.top/*"]
}

export default function Markdown() {
  const [content] = useStorage({
    key: "md-content",
    instance: new Storage({
      area: "local"
    })
  })

  useEffect(() => {
    let timer = null
    let index = 0
    if (content) {
      timer = setInterval(() => {
        const setValue = (window as any).setValue
        index++
        if (setValue && index < 30) {
          setValue(content)
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

  return <div style={{ display: "none" }}></div>
}
