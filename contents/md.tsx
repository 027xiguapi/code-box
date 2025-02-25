import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/dist/hook"

export const config: PlasmoCSConfig = {
  matches: ["https://md.randbox.top/*", "https://md.code-box.fun/*"]
}

export default function Markdown() {
  const [post, setPost] = useStorage({
    key: "md-post",
    instance: new Storage({
      area: "local"
    })
  })

  useEffect(() => {
    if (post) {
      const posts = JSON.parse(window.localStorage.getItem("MD__posts")) || []
      const _post = JSON.parse(post)

      if (posts[0] && _post.content != posts[0].content) {
        posts.unshift({
          content: _post.content,
          title: _post.title || "文章1"
        })
        window.localStorage.setItem("MD__posts", JSON.stringify(posts))
        setPost("")
        location.reload()
      }
    }
  }, [post])

  return <div style={{ display: "none" }}></div>
}
