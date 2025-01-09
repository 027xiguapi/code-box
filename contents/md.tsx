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
      const posts = JSON.parse(window.localStorage.getItem("MD__posts")) || []
      const post = posts[0]

      if (post.content != content) {
        post.content = content
        window.localStorage.setItem("MD__posts", JSON.stringify(posts))
        location.reload()
      }
    }
  }, [content])

  return <div style={{ display: "none" }}></div>
}
