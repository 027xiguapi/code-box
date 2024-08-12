import { ThemeProvider } from "~theme"

import Content from "./component/content"

import "./index.css"

export default function IndexPopup() {
  return (
    <ThemeProvider>
      <div className="App popup">
        <div className="App-header">
          <h2 className="title">CodeBox 🎉</h2>
          <p className="desc">{chrome.i18n.getMessage("popupDescription")}</p>
        </div>
        <div className="App-body">
          <Content />
        </div>
        <div className="App-link">
          <div className="item">
            <a
              className="btn"
              href="/tabs/history.html"
              target="_blank"
              rel="noreferrer">
              {chrome.i18n.getMessage("history")}🕮
            </a>
          </div>
          <div className="item">
            <a
              className="btn"
              href="/options.html"
              target="_blank"
              rel="noreferrer">
              {chrome.i18n.getMessage("more")}⚙️
            </a>
          </div>
          <div>
            <a
              className="btn"
              href="https://github.com/027xiguapi/code-box"
              target="_blank"
              rel="noreferrer">
              {chrome.i18n.getMessage("support")}👍
            </a>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
