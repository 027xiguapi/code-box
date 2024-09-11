import Content from "~component/options/content"
import { ThemeProvider } from "~theme"
import { i18n } from "~tools"

import "~index.css"

export default function IndexPopup() {
  return (
    <ThemeProvider>
      <div className="App popup">
        <div className="App-header">
          <h2 className="title">CodeBox 🎉</h2>
          <p className="desc">{i18n("popupDescription")}</p>
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
              href="/tabs/feed.html"
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
