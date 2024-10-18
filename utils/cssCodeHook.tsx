import { useEffect } from "react"

import { useStorage } from "@plasmohq/storage/dist/hook"

import { addCss, removeCss } from "~tools"

export default function useCssCodeHook(name) {
  const [cssCode] = useStorage<string>(`${name}-cssCode`)
  const [runCss] = useStorage<boolean>(`${name}-runCss`)
  const [closeLog] = useStorage("config-closeLog", true)

  useEffect(() => {
    runCssFunc(runCss)
  }, [runCss])

  /* 插入自定义css代码 */
  function runCssFunc(runCss) {
    const id = `${name}-css`
    closeLog || console.log(`${name} 插入自定义css代码`, { cssCode, runCss })
    runCss ? addCss(cssCode, id) : removeCss(id)
  }

  return [cssCode, runCss]
}
