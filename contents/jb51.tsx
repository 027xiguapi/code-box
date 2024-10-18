import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

import { addCss, saveHtml, saveMarkdown, setIcon } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://*.jb51.net/*"]
}

const turndownService = Turndown()
const articleTitle = document.querySelector<HTMLElement>("head title").innerText

export default function jb51() {
  const [cssCode, runCss] = useCssCodeHook("jb51")
  const [closeAds] = useStorage<boolean>("jb51-closeAds")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [closeLog] = useStorage("config-closeLog", true)
  const [content, setContent] = useContent()

  useEffect(() => {
    closeLog || console.log("jb51 status", { closeAds })
    closeAds && closeAdsFunc()
    setIcon(closeAds)
  }, [closeAds])

  useMessage(async (req, res) => {
    if (req.name == "jb51-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "jb51-editMarkdown") {
      setContent("#article")
    }
    if (req.name == "jb51-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "jb51-downloadHtml") {
      downloadHtml()
    }
  })

  // 关闭广告
  function closeAdsFunc() {
    addCss(`
    .tipsa_ds,
    #txtlink,
    #r1gg,
    #idctu,
    #rbbd {
      display:none !important;
    }`)
  }

  function downloadMarkdown() {
    const html = document.querySelector("#article")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector("#article")
    saveHtml(dom, articleTitle)
  }

  return <div style={{ display: "none" }}></div>
}
