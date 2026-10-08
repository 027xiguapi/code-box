import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/dist/hook"

import Turndown from "~utils/turndown"

export function useEditMarkdown(option?) {
  const turndownService = Turndown(option)

  const [post, setPost] = useStorage({
    key: "md-post",
    instance: new Storage({
      area: "local"
    })
  })

  const handleSetPost = (selectorDom, articleTitle) => {
    const content = turndownService.turndown(selectorDom)
    const post = {
      content: content,
      title: articleTitle
    }
    setPost(JSON.stringify(post))
    window.open("https://md.randbox.top", "_blank")
  }

  return [post, handleSetPost]
}
