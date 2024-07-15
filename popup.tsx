import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

function IndexPopup() {
  const [closeAds, setCloseAds] = useStorage("csdn-closeAds", (v) =>
    v === undefined ? true : v
  )
  const [copyCode, setCopyCode] = useStorage("csdn-copyCode", (v) =>
    v === undefined ? true : v
  )
  const [closeFollow, setCloseFollow] = useStorage("csdn-closeFollow", (v) =>
    v === undefined ? true : v
  )
  const [autoOpenCode, setAutoOpenCode] = useStorage(
    "csdn-autoOpenCode",
    (v) => (v === undefined ? true : v)
  )
  const [closeLoginModal, setCloseLoginModal] = useStorage(
    "csdn-closeLoginModal",
    (v) => (v === undefined ? true : v)
  )

  return (
    <div className="App" style={{ width: "160px" }}>
      <div className="App-header">
        <h2 style={{ marginBottom: "0" }}>CodeBox 🎉</h2>
        <p style={{ margin: "5px 0" }}>更方便操作网页代码</p>
      </div>
      <div className="App-body">
        <fieldset>
          <legend>CSDN设置</legend>
          <div>
            <input
              type="checkbox"
              id="closeAds"
              name="closeAds"
              checked={closeAds}
              onChange={(e) => setCloseAds(e.target.checked)}
            />
            <label htmlFor="closeAds">关闭广告</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="copyCode"
              name="copyCode"
              checked={copyCode}
              onChange={(e) => setCopyCode(e.target.checked)}
            />
            <label htmlFor="copyCode">一键复制代码</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="closeFollow"
              name="closeFollow"
              checked={closeFollow}
              onChange={(e) => setCloseFollow(e.target.checked)}
            />
            <label htmlFor="closeFollow">关注阅读全文</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="autoOpenCode"
              name="autoOpenCode"
              checked={autoOpenCode}
              onChange={(e) => setAutoOpenCode(e.target.checked)}
            />
            <label htmlFor="autoOpenCode">自动展开代码块</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="closeLoginModal"
              name="closeLoginModal"
              checked={closeLoginModal}
              onChange={(e) => setCloseLoginModal(e.target.checked)}
            />
            <label htmlFor="closeLoginModal">关闭登陆弹窗</label>
          </div>
        </fieldset>
        {/*<fieldset>*/}
        {/*  <legend>知乎设置:</legend>*/}
        {/*  <div>*/}
        {/*    <input type="checkbox" id="autoOpenCode" name="autoOpenCode" />*/}
        {/*    <label htmlFor="autoOpenCode">自动展开代码块</label>*/}
        {/*  </div>*/}
        {/*</fieldset>*/}
        {/*<fieldset>*/}
        {/*  <legend>掘金设置:</legend>*/}
        {/*  <div>*/}
        {/*    <input type="checkbox" id="autoOpenCode" name="autoOpenCode" />*/}
        {/*    <label htmlFor="autoOpenCode">自动展开代码块</label>*/}
        {/*  </div>*/}
        {/*</fieldset>*/}
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
