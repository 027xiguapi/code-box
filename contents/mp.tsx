import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchorList,
  PlasmoGetShadowHostId
} from "plasmo"
import { type FC } from "react"

import { i18n } from "~tools"

export const config: PlasmoCSConfig = {
  matches: ["https://mp.weixin.qq.com/cgi-bin/*"]
}

const HOST_ID = "codebox-weixin"
export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getOverlayAnchorList: PlasmoGetOverlayAnchorList = async () =>
  document.querySelectorAll(
    ".weui-desktop-img-picker__item .weui-desktop-img-picker__img-title"
  )

const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  function handleCopy() {
    try {
      const item = anchor.element.closest(".weui-desktop-img-picker__item")
      const img = item.querySelector(".weui-desktop-img-picker__img-thumb")
      const computedStyle = window.getComputedStyle(img)
      const backgroundImage = computedStyle.getPropertyValue("background-image")
      const imageUrlMatch = backgroundImage.match(/url\(["']?(.*?)["']?\)/)

      if (imageUrlMatch && imageUrlMatch[1]) {
        const imageUrl = imageUrlMatch[1]

        navigator.clipboard.writeText(imageUrl)
        alert("URL 已复制到剪贴板")
      }
    } catch (error) {
      console.error("复制失败:", error)
      alert("复制失败")
    }
  }

  return <button onClick={handleCopy}>{i18n("copyURL")}</button>
}

export default PlasmoOverlay
