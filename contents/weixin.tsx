import html2pdf from "html2pdf.js"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchor,
  PlasmoGetShadowHostId,
  PlasmoGetStyle
} from "plasmo"
import { useEffect, type FC } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/dist/hook"

import { i18n, saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useContent } from "~utils/editMarkdownHook"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://mp.weixin.qq.com/s/*"]
}

const turndownService = Turndown()
const articleTitle = document.querySelector<HTMLElement>("head title").innerText

const HOST_ID = "codebox-weixin"
export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector("#img-content .rich_media_title")

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
  .codebox-tagBtn {
    height: 28px;
    display: flex;
    cursor: pointer;
    align-items: center;
    color: #1e80ff;
    width: 66px;
    background: transparent;
    border-radius: 5px;
    justify-content: space-between;
    padding: 0 8px;
    margin-top: -20px;
    font-size: 14px;
  }
  `
  return style
}

const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [showTag, setShowTag] = useStorage<boolean>("weixin-showTag")
  const [cssCode, runCss] = useCssCodeHook("weixin")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [content, setContent] = useContent()

  useMessage(async (req, res) => {
    if (req.name == "weixin-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "weixin-editMarkdown") {
      setContent("#img-content")
    }
    if (req.name == "weixin-downloadMarkdown") {
      downloadMarkdown()
    }
    if (req.name == "weixin-downloadHtml") {
      downloadHtml()
    }
    if (req.name == "weixin-downloadPdf") {
      downloadPdf()
    }
  })

  console.log(777, html2pdf)

  function downloadPdf() {
    // 获取文章内容和标题、作者、时间等元信息
    var article = document.querySelector<HTMLElement>(".rich_media_content")
    var title = document.querySelector<HTMLElement>(".rich_media_title")
    var author = document.querySelector<HTMLElement>(".weui-wa-hotarea") // 文章作者
    var publishTime = document.querySelector<HTMLElement>("#publish_time") // 文章时间

    if (article) {
      // 创建一个容器用于添加元信息
      var metaInfoDiv = document.createElement("div")
      metaInfoDiv.style.marginBottom = "20px"
      metaInfoDiv.style.borderBottom = "1px solid #eee"
      metaInfoDiv.style.paddingBottom = "15px"

      // 标题
      var titleElement = document.createElement("h1")
      titleElement.innerText = title ? title?.innerText.trim() : "未命名文章"
      titleElement.style.fontSize = "24px"
      titleElement.style.marginBottom = "10px"
      metaInfoDiv.appendChild(titleElement)

      // 作者
      if (author) {
        var authorElement = document.createElement("p")
        authorElement.innerText = "作者: " + author.innerText.trim()
        authorElement.style.fontSize = "14px"
        authorElement.style.margin = "5px 0"
        metaInfoDiv.appendChild(authorElement)
      }

      // 时间
      if (publishTime) {
        var timeElement = document.createElement("p")
        timeElement.innerText = "发布时间: " + publishTime.innerText.trim()
        timeElement.style.fontSize = "14px"
        timeElement.style.margin = "5px 0"
        metaInfoDiv.appendChild(timeElement)
      }

      // 将元信息插入到文章内容的顶部
      article.insertBefore(metaInfoDiv, article.firstChild)

      // 添加防止图片分页的CSS样式
      var style = document.createElement("style")
      style.innerHTML = `
        .rich_media_content img {
          page-break-inside: avoid;
          break-inside: avoid;
          max-width: 100%;
          height: auto;
        }
        .rich_media_content p, .rich_media_content div {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      `
      document.head.appendChild(style)

      // 确保所有图片加载完成
      let images = article.querySelectorAll("img")
      let imagePromises = []

      images.forEach(function (img) {
        // 处理懒加载的图片，确保图片的真实 URL 被加载
        if (img.dataset && img.dataset.src) {
          img.src = img.dataset.src
        }

        // 通过跨域获取图片，并将图片转换为 base64 格式
        imagePromises.push(
          new Promise(function (resolve) {
            var imgElement = new Image()
            imgElement.crossOrigin = "Anonymous"
            imgElement.src = img.src
            imgElement.onload = function () {
              var canvas = document.createElement("canvas")
              canvas.width = imgElement.width
              canvas.height = imgElement.height
              var ctx = canvas.getContext("2d")
              ctx.drawImage(imgElement, 0, 0)
              img.src = canvas.toDataURL("image/jpeg") // 使用JPEG格式并压缩质量到70%
              resolve()
            }
            imgElement.onerror = resolve // 即使图片加载失败，继续处理
          })
        )
      })

      // 确保图片加载完成后再导出PDF
      Promise.all(imagePromises)
        .then(function () {
          // 使用文章标题作为文件名
          var fileName = title
            ? title.innerText.trim() + ".pdf"
            : "WeChat_Article.pdf"

          var opt = {
            margin: 0.5,
            filename: fileName,
            image: {
              type: "jpeg",
              quality: 1 // 降低图片质量以减小PDF体积
            },
            html2canvas: {
              scale: 1.5, // 降低渲染比例以减小PDF体积
              useCORS: true, // 允许跨域图片
              logging: false // 关闭日志
              // 可以根据需要添加其他html2canvas选项
            },
            jsPDF: {
              unit: "in",
              format: "a4", // 使用A4格式，比letter更常用且体积可能更小
              orientation: "portrait"
            },
            pagebreak: {
              mode: ["avoid-all", "css", "legacy"]
            } // 遵循CSS中的page-break规则
          }

          // 使用 html2pdf 将文章内容导出为 PDF
          html2pdf()
            .from(article)
            .set(opt)
            .save()
            .then(function () {})
            .catch(function (error) {
              alert("导出过程中出现问题: " + error.message)
              console.log(error)
            })
        })
        .catch(function (error) {
          alert("处理图片时出现问题: " + error.message)
          console.log(error)
        })
    } else {
      alert("未找到文章内容")
    }
  }

  function downloadMarkdown() {
    const html = document.querySelector("#img-content")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function downloadHtml() {
    const dom = document.querySelector("#img-content")
    saveHtml(dom, articleTitle)
  }

  function handleEdit() {
    setContent("#img-content")
  }

  function handleDownload() {
    const html = document.querySelector("#img-content")
    const markdown = turndownService.turndown(html)
    saveMarkdown(markdown, articleTitle)
  }

  function closeTag() {
    setShowTag(false)
  }

  return showTag ? (
    <div className="codebox-tagBtn">
      <div onClick={handleEdit}>{i18n("edit")}</div>
      <div onClick={handleDownload}>{i18n("download")}</div>
    </div>
  ) : (
    <></>
  )
}

export default PlasmoOverlay
