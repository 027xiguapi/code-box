import { saveAs } from "file-saver"
import JSZip from "jszip"
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchor,
  PlasmoGetShadowHostId,
  PlasmoGetStyle
} from "plasmo"
import qrcodeUrl from "raw:~/public/wx/qrcode_wx.jpg"
import React, { useEffect, useState, type FC } from "react"

import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/dist/hook"

import { saveHtml, saveMarkdown } from "~tools"
import useCssCodeHook from "~utils/cssCodeHook"
import { useEditMarkdown } from "~utils/editMarkdownHook"
import makerQRPost from "~utils/makerQRPost"
import { useParseMarkdown } from "~utils/parseMarkdownHook"
import { Print } from "~utils/print"
import Turndown from "~utils/turndown"

export const config: PlasmoCSConfig = {
  matches: ["https://mp.weixin.qq.com/s/*", "https://mp.weixin.qq.com/s?src=*"]
}

const turndownService = Turndown()
const articleTitle = document
  .querySelector<HTMLMetaElement>('meta[property="og:title"]')
  .content.trim()

const HOST_ID = "codebox-weixin"
export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector("#activity-detail")

const formatLimit = 5
const formatList = new WeakMap()
const urlReg =
  /\b((?:https?:\/\/)?(?![\d-]+\.[\d-]+)([\w-]+(\.[\w-]+)+[\S^\"\'\[\]\{\}\>\<]*))/gi
const ignoreTags = [
  "SCRIPT",
  "STYLE",
  "A",
  "TEXTAREA",
  "NOSCRIPT",
  "CODE",
  "TITLE"
]
const formatLinks = (target: Node, nodes: NodeList) => {
  if (
    !(target instanceof HTMLElement) ||
    ignoreTags.includes(target.nodeName) ||
    target.translate === false
  )
    return

  const formatTimes = formatList.get(target) || 0
  if (formatTimes > formatLimit) return

  let modified = false
  nodes.forEach((node: any) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.match(urlReg)) {
      const newContent = node.textContent.replace(
        urlReg,
        (match) =>
          `<a href="${match.startsWith("http") ? match : "http://" + match}" 
             target="_blank" 
             style="color: #576b95; text-decoration: none;">
            ${match}
          </a>`
      )
      const wrapper = document.createElement("span")
      wrapper.innerHTML = newContent
      node.replaceWith(wrapper)
      modified = true
    }
  })

  if (modified) {
    formatList.set(target, formatTimes + 1)
  }
}

const queryChildElements = (element: Node) => {
  if (element instanceof Element) {
    ;[...element.querySelectorAll("*")].forEach((child) =>
      formatLinks(child, child.childNodes)
    )
  }
}

const createLinkObserver = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      formatLinks(mutation.target, mutation.addedNodes)
      mutation.addedNodes.forEach((node) => queryChildElements(node))
    })
  })

  return observer
}

const observer = createLinkObserver()
observer.observe(document, {
  subtree: true,
  childList: true,
  characterData: true
})

queryChildElements(document.documentElement)

const style = {
  box: {
    position: "fixed" as const,
    border: "1px solid #D9DADC",
    left: "25px",
    top: "25px",
    width: "140px",
    padding: "16px",
    cursor: "pointer"
  },
  close: {
    position: "absolute" as const,
    top: "-5px",
    right: "0px",
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "0.5rem"
  },
  img: {
    width: "100%"
  },
  item: {
    color: "#000000"
  }
}

const PlasmoOverlay: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [parseContent, setParseContent] = useParseMarkdown()
  const [showTag, setShowTag] = useStorage<boolean>("weixin-showTag", true)
  const [cssCode, runCss] = useCssCodeHook("weixin")
  const [history, setHistory] = useStorage<any[]>("codebox-history")
  const [content, setContent] = useEditMarkdown()
  const [isShow, setIsShow] = useState(true)

  useMessage(async (req: any, res: any) => {
    if (req.name == "weixin-isShow") {
      res.send({ isShow: true })
    }
    if (req.name == "weixin-editMarkdown") {
      editMarkdown()
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
    if (req.name == "weixin-downloadImages") {
      await downloadImages(req.body?.onProgress)
    }
    if (req.name == "weixin-getThumbMedia") {
      getThumbMedia()
    }
  })

  function getThumbMedia() {
    const thumbMediaUrl = document.querySelector<HTMLMetaElement>(
      'meta[property="og:image"]'
    ).content
    thumbMediaUrl && window.open(thumbMediaUrl)
  }

  function getDescription() {
    const summary = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    ).content
    summary && prompt("文章摘要：", summary)
  }

  async function downloadImages(
    onProgress?: (current: number, total: number) => void
  ) {
    const article = document.querySelector("#js_content")
    if (!article) return

    const images = Array.from(article.getElementsByTagName("img"))
    const imageUrls = images
      .map((img) => img.dataset.src || img.src)
      .filter((url) => url)
      .map((url) =>
        url.replace(
          "//res.wx.qq.com/mmbizwap",
          "https://res.wx.qq.com/mmbizwap"
        )
      )

    const zip = new JSZip()
    const title = document.title.trim()
    const total = imageUrls.length

    for (let i = 0; i < imageUrls.length; i++) {
      try {
        const response = await fetch(imageUrls[i])
        const blob = await response.blob()

        let ext = ".jpg"
        if (
          imageUrls[i].includes("wx_fmt=gif") ||
          imageUrls[i].includes("mmbiz_gif")
        ) {
          ext = ".gif"
        } else if (
          imageUrls[i].includes("wx_fmt=png") ||
          imageUrls[i].includes("mmbiz_png")
        ) {
          ext = ".png"
        } else if (
          imageUrls[i].includes("wx_fmt=bmp") ||
          imageUrls[i].includes("mmbiz_bmp")
        ) {
          ext = ".bmp"
        }

        zip.file(`${title}-${i}${ext}`, blob)

        if (onProgress) {
          onProgress(i + 1, total)
        }
      } catch (error) {
        console.error(`Failed to download image ${i}:`, error)
      }
    }

    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, `${title}-images.zip`)
  }

  function downloadPdf() {
    const article = document.querySelector<HTMLElement>("#img-content")
    if (article) {
      Print.print(article, { title: articleTitle })
        .then(() => console.log("Printing complete"))
        .catch((error) => console.error("Printing failed:", error))
    }
  }

  function editMarkdown() {
    const dom = document.querySelector("#img-content")
    setContent(dom, articleTitle)
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

  function parseMarkdown() {
    const dom = document.querySelector("#img-content")
    setParseContent(dom)
  }

  function onClose() {
    setIsShow(false)
  }

  return showTag && isShow ? (
    <div id="ws_cmbm" className="ws_cmbmc" style={style.box}>
      <button style={style.close} onClick={onClose} aria-label="Close">
        ×
      </button>
      <img src={qrcodeUrl} alt="qrcodeUrl" style={style.img} />
      <div style={style.item}>
        <a onClick={getThumbMedia}>文章封面</a>
      </div>
      <div style={style.item}>
        <a onClick={getDescription}>文章摘要</a>
      </div>
      <div style={style.item}>
        <a
          style={{ color: "#000" }}
          href="javascript:(function(){const rules={'mp.weixin.qq.com':{testReg:/^http(?:s)?:\/\/mp\.weixin\.qq\.com\/s\?.*$/i,query:['__biz','idx','mid','sn','src','timestamp','ver','signature']},other:{testReg:/^(http(?:s)?:\/\/[^?#]*)[?#].*$/i,query:['id','tid','uid','q','wd','query','keyword','keywords']}};const pureUrl=function(url=window.location.href){const hash=url.replace(/^[^#]*(#.*)?$/,'$1'),base=url.replace(/(\?|#).*$/,'');let pureUrl=url;const getQueryString=function(key){let ret=url.match(new RegExp('(?:\\?|&amp;)('+key+'=[^?#&amp;]*)','i'));return null===ret?'':ret[1]},methods={decodeUrl:function(url){return decodeURIComponent(url)}};for(let i in rules){let rule=rules[i],reg=rule.testReg,replace=rule.replace;if(reg.test(url)){let newQuerys='';void 0!==rule.query&amp;&amp;rule.query.length>0&amp;&amp;rule.query.map(query=>{const ret=getQueryString(query);''!==ret&amp;&amp;(newQuerys+=(newQuerys.length?'&amp;':'?')+ret)}),newQuerys+=void 0!==rule.hash&amp;&amp;rule.hash?hash:'',pureUrl=(void 0===replace?base:url.replace(reg,replace))+newQuerys,void 0!==rule.methods&amp;&amp;rule.methods.length>0&amp;&amp;rule.methods.map(methodName=>{pureUrl=methods[methodName](pureUrl)});break}}return pureUrl}();let newnode=document.createElement('input');newnode.id='pure-url-for-copy',newnode.value=pureUrl,document.body.appendChild(newnode);let copyinput=document.getElementById('pure-url-for-copy');copyinput.select();try{document.execCommand('copy');window.location.href===pureUrl?window.location.reload():window.location.href=pureUrl}catch(err){null!=prompt('%E5%87%80%E5%8C%96%E5%90%8E%E7%9A%84%E7%BD%91%E5%9D%80%E6%98%AF%EF%BC%9A',pureUrl)&amp;&amp;(window.location.href=pureUrl)}document.body.removeChild(copyinput)})();">
          净化链接
        </a>
      </div>
      <div style={style.item}>
        <a
          style={{ color: "#000" }}
          href="javascript:(function(){prompt( '原始链接：', 'https://mp.weixin.qq.com/s?__biz='+biz+'&amp;idx=1&amp;mid='+mid+'&amp;sn='+sn)})();">
          原始链接
        </a>
      </div>
      <div style={style.item}>
        <a onClick={editMarkdown}>编辑markdown</a>
      </div>
      <div style={style.item}>
        <a onClick={downloadMarkdown}>下载markdown</a>
      </div>
      <div style={style.item}>
        <a onClick={downloadPdf}>下载PDF</a>
      </div>
      <div style={style.item}>
        <a onClick={parseMarkdown}>解析markdown</a>
      </div>
      <div style={style.item}>
        <a onClick={() => downloadImages()}>下载所有图片</a>
      </div>
      <div style={style.item}>
        <a onClick={() => makerQRPost()}>生成海报</a>
      </div>
      <a style={style.item} href="https://www.code-box.fun" target="_blank">
        帮助
      </a>
    </div>
  ) : (
    <></>
  )
}

export default PlasmoOverlay
