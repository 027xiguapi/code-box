import { Input } from "antd"

import { useStorage } from "@plasmohq/storage/dist/hook"

import { i18n } from "~tools"

export default function CssCode(props) {
  let { name } = props

  const [runCss, setRunCss] = useStorage(`${name}-runCss`, (v) =>
    v === undefined ? false : v
  )
  const [cssCode, setCssCode, { setRenderValue, setStoreValue, remove }] =
    useStorage(`${name}-cssCode`)

  return (
    <>
      <div className="item">
        <span>{i18n("customCssCode")}</span>
        <input
          type="checkbox"
          id={`${name}-runCss`}
          name={`${name}-runCss`}
          className="codebox-offscreen"
          checked={runCss}
          onChange={(e) => setRunCss(e.target.checked)}
        />
        <label className="codebox-switch" htmlFor={`${name}-runCss`}></label>
      </div>
      <div className={`item ${runCss ? "" : "hide"}`}>
        <Input.TextArea
          name={`${name}-cssCode`}
          value={cssCode}
          onChange={(e) => setRenderValue(e.target.value)}
          onBlur={(e) => setStoreValue()}></Input.TextArea>
      </div>
    </>
  )
}
