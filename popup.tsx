import Cnblogs from "./component/cnblogs"
import Csdn from "./component/csdn"
import Jb51 from "./component/jb51"

function IndexPopup() {
  return (
    <div className="App" style={{ width: "160px" }}>
      <div className="App-header">
        <h2 style={{ marginBottom: "0" }}>CodeBox 🎉</h2>
        <p style={{ margin: "5px 0" }}>更方便操作网页代码</p>
      </div>
      <div className="App-body">
        <Csdn />
        <Jb51 />
        <Cnblogs />
      </div>
      <div className="App-link" style={{ marginTop: "10px" }}>
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
