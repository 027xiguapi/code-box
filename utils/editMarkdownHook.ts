import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/dist/hook"

import Turndown from "~utils/turndown"

export function useContent(option?) {
  const turndownService = Turndown(option)

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
