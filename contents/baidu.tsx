import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { addCss } from "~tools"

export const config: PlasmoCSConfig = {
  matches: ["https://*.baidu.com/*"]
}

export default function Custom() {
  const [closeAIBox] = useStorage<boolean>("baidu-closeAIBox")

  useEffect(() => {
    console.log("baidu", { closeAIBox })
    closeAIBox && closeAIBoxFunc()
  }, [closeAIBox])

  /* 删除百度AI对话框 */
  function closeAIBoxFunc() {
    addCss(`.wd-ai-index-pc{
      display:none !important;
    }`)
  }

  return <div style={{ display: "none" }}></div>
}
