import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/dist/hook"

import Turndown from "~utils/turndown"

const turndownService = Turndown()

export function useContent() {
  const [content, setContent] = useStorage({
    key: "md-content",
    instance: new Storage({
      area: "local"
    })
  })

  const handleSetContent = (selectors: string) => {
    const html = document.querySelector(selectors)
    const markdown = turndownService.turndown(html)
    setContent(markdown)
    window.open("https://md.randbox.top", "_blank")
  }

  return [content, handleSetContent]
}
