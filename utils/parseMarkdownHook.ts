import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/dist/hook"

import Turndown from "~utils/turndown"

export function useParseMarkdown(option?) {
  const turndownService = Turndown(option)
  // let aiType = null

  const [kimiContent, setKimiContent] = useStorage({
    key: "kimi-content",
    instance: new Storage({
      area: "local"
    })
  })

  const [chatgptContent, setChatgptContent] = useStorage({
    key: "chatgpt-content",
    instance: new Storage({
      area: "local"
    })
  })

  const [aiType, setAiType] = useStorage("app-aiType")

  const handleSetContent = (selectorDom, type?) => {
    let markdown = turndownService.turndown(selectorDom)
    markdown = `${markdown}
    将上面的文字,翻译成中文并生成markdown`

    type = type || aiType
    if (type == "kimi") {
      setKimiContent(markdown)
      window.open("https://kimi.moonshot.cn/", "_blank")
    } else {
      setChatgptContent(markdown)
      window.open("https://chatgpt.com", "_blank")
    }
  }

  return [aiType == "kimi" ? kimiContent : chatgptContent, handleSetContent]
}
