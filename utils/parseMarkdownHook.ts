import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/dist/hook"

import Turndown from "~utils/turndown"

export function useParseMarkdown(option?) {
  const turndownService = Turndown(option)

  const [aiContent, setAiContent] = useStorage({
    key: "ai-content",
    instance: new Storage({
      area: "local"
    })
  })

  const [aiType, setAiType] = useStorage("app-aiType")

  const handleSetContent = (selectorDom, type?) => {
    let markdown = turndownService.turndown(selectorDom)
    markdown = `${markdown}
    将上面的文字,翻译成中文并生成markdown`

    setAiContent(markdown)
    type = type || aiType

    switch (type) {
      case "kimi":
        window.open("https://kimi.moonshot.cn/", "_blank")
        break
      case "chatgpt":
        window.open("https://chatgpt.com", "_blank")
        break
      case "deepseek":
        window.open("https://chat.deepseek.com/", "_blank")
        break
    }
  }

  return [aiContent, handleSetContent]
}
