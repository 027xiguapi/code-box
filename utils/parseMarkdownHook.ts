import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/dist/hook"

import Turndown from "~utils/turndown"

export function useParseMarkdown(option?) {
  const turndownService = Turndown(option)

  const [content, setContent] = useStorage({
    // key: "chatgpt-content",sss
    key: "kimi-content",
    instance: new Storage({
      area: "local"
    })
  })

  const handleSetContent = (selectorDom) => {
    let markdown = turndownService.turndown(selectorDom)
    setContent(markdown)
    markdown = `${markdown}
    将上面的文字,翻译成中文并生成markdown`
    setContent(markdown)
    // window.open("https://chatgpt.com", "_blank")
    window.open("https://kimi.moonshot.cn/", "_blank")
  }

  return [content, handleSetContent]
}
