import { StyleProvider } from "@ant-design/cssinjs"
import antdResetCssText from "data-text:antd/dist/reset.css"
import type {
  PlasmoCSConfig,
  PlasmoGetShadowHostId,
  PlasmoGetStyle
} from "plasmo"

import CustomDomSelector from "~component/customDomSelector"
import { ThemeProvider } from "~theme"

const HOST_ID = "codebox-csui"

export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")

  style.textContent = antdResetCssText
  return style
}

export default function CustomOverlay() {
  return (
    <ThemeProvider>
      <StyleProvider container={document.getElementById(HOST_ID).shadowRoot}>
        <CustomDomSelector />
      </StyleProvider>
    </ThemeProvider>
  )
}
