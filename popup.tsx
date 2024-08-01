import { ThemeProvider } from "~theme"

import Content from "./component/content"

import "./index.css"

export default function IndexPopup() {
  return (
    <ThemeProvider>
      <div className="App popup">
        <div className="App-header">
          <h2 className="title">CodeBox 🎉</h2>
          <p className="desc">更方便操作网页代码</p>
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
              历史记录🕮
            </a>
          </div>
          <div className="item">
            <a
              className="btn"
              href="/options.html"
              target="_blank"
              rel="noreferrer">
              更多设置⚙️
            </a>
          </div>
          <div>
            <a
              className="btn"
              href="https://github.com/027xiguapi/code-box"
              target="_blank"
              rel="noreferrer">
              支持作者更新👍
            </a>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
