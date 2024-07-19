import Content from "./component/content"

import "./index.css"

export default function IndexOptions() {
  return (
    <div className="App options">
      <div className="App-header">
        <h2 className="title">CodeBox 🎉</h2>
        <p className="desc">更方便操作网页代码</p>
      </div>
      <div className="App-body">
        <Content />
      </div>
      <div className="App-link">
        <a
          className="btn"
          href="https://github.com/027xiguapi/code-box"
          target="_blank"
          rel="noreferrer">
          支持作者更新👍
        </a>
      </div>
    </div>
  )
}
