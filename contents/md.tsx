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
    if (content) {
      if (window.localStorage.getItem("__editor_content") != content) {
        window.localStorage.setItem("__editor_content", content)
        location.reload()
      }
    }
  }, [content])

  return <div style={{ display: "none" }}></div>
}
