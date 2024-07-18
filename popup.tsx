import Cnblogs from "./component/cnblogs"
import Csdn from "./component/csdn"
import Jb51 from "./component/jb51"
import Jianshu from "./component/jianshu"
import Zhihu from "./component/zhihu"

import "./index.css"

function IndexPopup() {
  return (
    <div className="App">
      <div className="App-header">
        <h2 className="title">CodeBox 🎉</h2>
        <p className="desc">更方便操作网页代码</p>
      </div>
      <div className="App-body">
        <Csdn />
        <Zhihu />
        <Jianshu />
        <Jb51 />
        <Cnblogs />
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

export default IndexPopup
