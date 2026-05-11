import React from "react"

import { i18n } from "~tools"

import qrcodeUrl from "raw:~/public/wx/gzh.jpg"

const styles = {
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

export default function WeixinPanel(props: {
  onGetThumbMedia: () => void
  onGetDescription: () => void
  onEditMarkdown: () => void
  onDownloadMarkdown: () => void
  onParseMarkdown: () => void
  onDownloadMarkdownWithImages: () => void
  onDownloadPdf: () => void
  onDownloadWord: () => void
  onDownloadImages: () => void
  onMakerQRPost: () => void
  onClose: () => void
}) {
  const {
    onGetThumbMedia,
    onGetDescription,
    onEditMarkdown,
    onDownloadMarkdown,
    onParseMarkdown,
    onDownloadMarkdownWithImages,
    onDownloadPdf,
    onDownloadWord,
    onDownloadImages,
    onMakerQRPost,
    onClose
  } = props

  function getPureLink() {
    const rules = {
      "mp.weixin.qq.com": {
        testReg: /^http(?:s)?:\/\/mp\.weixin\.qq\.com\/s\?.*$/i,
        query: ["__biz", "idx", "mid", "sn", "src", "timestamp", "ver", "signature"]
      },
      other: {
        testReg: /^(http(?:s)?:\/\/[^?#]*)[?#].*$/i,
        query: ["id", "tid", "uid", "q", "wd", "query", "keyword", "keywords"]
      }
    }
    const pureUrl = (function (url = window.location.href) {
      const hash = url.replace(/^[^#]*(#.*)?$/, "$1"),
        base = url.replace(/(\?|#).*$/, "")
      let pureUrl = url
      const getQueryString = function (key: string) {
        let ret = url.match(new RegExp("(?:\\?|&)(" + key + "=[^&#]*)", "i"))
        return null === ret ? "" : ret[1]
      }
      for (const i in rules) {
        const rule = rules[i as keyof typeof rules]
        if (rule.testReg.test(url)) {
          let newQuerys = ""
          if (rule.query && rule.query.length > 0) {
            rule.query.forEach((query: string) => {
              const ret = getQueryString(query)
              if (ret !== "") {
                newQuerys += (newQuerys.length ? "&" : "?") + ret
              }
            })
          }
          newQuerys += hash
          pureUrl = base + newQuerys
          break
        }
      }
      return pureUrl
    })()

    const newnode = document.createElement("input")
    newnode.id = "pure-url-for-copy"
    newnode.value = pureUrl
    document.body.appendChild(newnode)
    const copyinput = document.getElementById("pure-url-for-copy") as HTMLInputElement
    copyinput.select()
    try {
      document.execCommand("copy")
      if (window.location.href === pureUrl) {
        window.location.reload()
      } else {
        window.location.href = pureUrl
      }
    } catch (err) {
      const result = prompt("净化后的网址是：", pureUrl)
      if (result !== null) {
        window.location.href = pureUrl
      }
    }
    document.body.removeChild(copyinput)
  }

  function getOriginalLink() {
    const biz = ""
    const mid = ""
    const sn = ""
    prompt("原始链接：", "https://mp.weixin.qq.com/s?__biz=" + biz + "&idx=1&mid=" + mid + "&sn=" + sn)
  }

  return (
    <div id="ws_cmbm" className="ws_cmbmc" style={styles.box}>
      <button style={styles.close} onClick={onClose} aria-label="Close">
        ×
      </button>
      <img src={qrcodeUrl} alt="qrcodeUrl" style={styles.img} />
      <div style={styles.item}>
        <a onClick={onGetThumbMedia}>{i18n("getThumbMedia")}</a>
      </div>
      <div style={styles.item}>
        <a onClick={onGetDescription}>{i18n("getDescription")}</a>
      </div>
      <div style={styles.item}>
        <a onClick={getPureLink}>{i18n("pureLink")}</a>
      </div>
      <div style={styles.item}>
        <a onClick={getOriginalLink}>{i18n("originalLink")}</a>
      </div>
      <div style={styles.item}>
        <a onClick={onEditMarkdown}>{i18n("editMarkdown")}</a>
      </div>
      <div style={styles.item}>
        <a onClick={onDownloadMarkdown}>{i18n("downloadMarkdown")}</a>
      </div>
      <div style={styles.item}>
        <a onClick={onParseMarkdown}>{i18n("parseMarkdown")}</a>
      </div>
      <div style={styles.item}>
        <a onClick={onDownloadMarkdownWithImages}>{i18n("downloadMDImages")}</a>
      </div>
      <div style={styles.item}>
        <a onClick={onDownloadPdf}>{i18n("downloadPdf")}</a>
      </div>
      <div style={styles.item}>
        <a onClick={onDownloadWord}>{i18n("downloadWord")}</a>
      </div>
      <div style={styles.item}>
        <a onClick={onDownloadImages}>{i18n("downloadAllImages")}</a>
      </div>
      <div style={styles.item}>
        <a onClick={onMakerQRPost}>{i18n("makerQRPost")}</a>
      </div>
      <a style={styles.item} href="https://www.code-box.fun" target="_blank">
        {i18n("help")}
      </a>
    </div>
  )
}
