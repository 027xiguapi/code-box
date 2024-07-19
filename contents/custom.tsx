import { useEffect } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { addCss } from "~tools"

export default function Custom() {
  const [runCss] = useStorage<boolean>("custom-runCss")
  const [cssCode] = useStorage<string>("custom-cssCode")

  useEffect(() => {
    runCss && runCssFunc()
  }, [runCss])

  /* 插入自定义css代码 */
  function runCssFunc() {
    console.log("插入自定义css代码", cssCode)
    addCss(cssCode)
  }

  return <div style={{ display: "none" }}></div>
}
