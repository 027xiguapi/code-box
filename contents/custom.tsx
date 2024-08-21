import { useEffect } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { addCss } from "~tools"

export default function Custom() {
  const [runCss] = useStorage<boolean>("custom-runCss")
  const [cssCode] = useStorage<string>("custom-cssCode")
  const [closeLog] = useStorage("config-closeLog", true)

  useEffect(() => {
    runCss && runCssFunc()
  }, [runCss])

  /* 插入自定义css代码 */
  function runCssFunc() {
    closeLog || console.log("插入自定义css代码", cssCode)
    addCss(cssCode)
  }

  return <div style={{ display: "none" }}></div>
}
