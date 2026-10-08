import { CloudUploadOutlined } from "@ant-design/icons"
import { Button } from "antd"

import Content from "~component/options/content"
import BatchDownload from "~component/items/batchDownload"
import { ThemeProvider } from "~theme"
import { i18n } from "~tools"

import "~index.css"

import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

export default function IndexPopup() {
  const [sidePanel, setSidePanel] = useState(false)

  useEffect(() => {
    hanleOpenSidePanel(sidePanel)
  }, [sidePanel])

  function hanleOpenSidePanel(active) {
    sendToBackground({
      name: "sidepanel",
      body: {
        active: active
      }
    })
  }

  // 打开文章同步页面，并带上当前标签页 ID
  async function openSyncPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      const query = tab?.id ? `?tabId=${tab.id}` : ""
      chrome.tabs.create({ url: chrome.runtime.getURL(`tabs/sync.html${query}`) })
      window.close()
    } catch (error) {
      console.error("打开文章同步页面失败", error)
    }
  }

  return (
    <ThemeProvider>
      <div className="App popup">
        <div className="App-header">
          <h2 className="title">CodeBox 🎉</h2>
          <p className="desc">{i18n("popupDescription")}</p>
        </div>
        <div className="App-body">
          <Button
            type="primary"
            block
            icon={<CloudUploadOutlined />}
            style={{ marginBottom: 8 }}
            onClick={openSyncPage}>
            {i18n("syncArticle") || "文章同步"}
          </Button>
          <BatchDownload />
          <Content />
        </div>
        <div className="App-link">
          <div className="item">
            <span>{i18n("sidePanel")}</span>
            <input
              type="checkbox"
              id="sidePanel"
              name="sidePanel"
              className="codebox-offscreen"
              checked={sidePanel}
              onChange={(e) => setSidePanel(e.target.checked)}
            />
            <label htmlFor="sidePanel" className="codebox-switch"></label>
          </div>
          <div className="item">
            <a
              className="btn"
              href="/tabs/history.html"
              target="_blank"
              rel="noreferrer">
              {i18n("history")}🕮
            </a>
          </div>
          <div className="item">
            <a
              className="btn"
              href="/options.html"
              target="_blank"
              rel="noreferrer">
              {i18n("more")}⚙️
            </a>
          </div>
          <div>
            <a
              className="btn"
              href="https://mp.weixin.qq.com/s/UrnGRks6R-JJ4oZTdt0Xrw"
              target="_blank"
              rel="noreferrer">
              {i18n("support")}👍
            </a>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
