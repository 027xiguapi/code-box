// import { Button } from "antd"
// import type {
//   PlasmoCSUIProps,
//   PlasmoGetInlineAnchor,
//   PlasmoGetInlineAnchorList,
//   PlasmoGetOverlayAnchorList,
//   PlasmoGetShadowHostId,
//   PlasmoGetStyle
// } from "plasmo"
// import { useEffect, useState } from "react"
// import type { FC } from "react"
//
// import { useStorage } from "@plasmohq/storage/dist/hook"
//
// export const getStyle: PlasmoGetStyle = () => {
//   const style = document.createElement("style")
//   style.textContent = `
//   .codebox-copyCodeHeader {
//     height: 28px;
//     display: flex;
//     justify-content: space-between;
//     width: 100%;
//     background: #ebf5fd;
//   }
//   .codebox-copyCodeBtn {
//     margin-right: 3px;
//     border: 0;
//     cursor: pointer;
//   }`
//   return style
// }
//
// const HOST_ID = "codebox-copycode"
// export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID
//
// // export const getOverlayAnchorList: PlasmoGetOverlayAnchorList = async () =>
// //   document.querySelectorAll("pre")
//
// export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
//   const isShow = !(
//     location.host.includes("baidu.com") || location.host.includes("juejin.cn")
//   )
//   const preList = isShow ? document.querySelectorAll("pre") : []
//
//   const anchors = []
//   Array.from(preList).map((pre) => {
//     const classList = pre.classList
//     if (pre.textContent && !classList.contains("CodeMirror-line"))
//       anchors.push(pre)
//   })
//
//   return anchors.map((element) => ({
//     element,
//     insertPosition: "afterbegin"
//     // insertPosition: "beforebegin"
//   }))
// }
//
// const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
//   const [copyCode] = useStorage("config-copyCode", true)
//   const [isCopy, setIsCopy] = useState(false)
//
//   const element = anchor.element
//   const style = window.getComputedStyle(element)
//   const marginTop = style.getPropertyValue("margin-top")
//
//   const onCopy = async () => {
//     try {
//       const target = anchor.element as HTMLElement
//       const preBlock = target.closest("pre")
//       const codeBlock = target.querySelector("code")
//       let textContent = ""
//
//       if (codeBlock) {
//         textContent = codeBlock.textContent
//       } else {
//         textContent = preBlock && preBlock.textContent
//       }
//
//       navigator.clipboard.writeText(textContent)
//
//       setIsCopy(true)
//       setTimeout(() => {
//         setIsCopy(false)
//       }, 1000)
//     } catch (error) {
//       console.log(error)
//     }
//   }
//
//   return (
//     <>
//       {copyCode ? (
//         <div
//           className="codebox-copyCodeHeader"
//           style={{ marginBottom: "-" + marginTop }}>
//           <span className="codebox-copyCodeLogo"></span>
//           <Button
//             color="primary"
//             variant="filled"
//             onClick={onCopy}
//             className="codebox-copyCodeBtn">
//             {isCopy ? "复制成功" : "复制"}
//           </Button>
//         </div>
//       ) : (
//         <></>
//       )}
//     </>
//   )
// }
//
// export default PlasmoOverlay
