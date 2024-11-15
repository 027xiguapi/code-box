import React, { useRef, useState } from "react"

import { ThemeProvider } from "~theme"
import { i18n } from "~tools"

import "~index.css"

import Cto51 from "~component/options/51cto"
import Baidu from "~component/options/baidu"
import Cnblogs from "~component/options/cnblogs"
import Config from "~component/options/config"
import Csdn from "~component/options/csdn"
import Custom from "~component/options/custom"
import Jb51 from "~component/options/jb51"
import Jianshu from "~component/options/jianshu"
import Juejin from "~component/options/juejin"
import Medium from "~component/options/medium"
import Oschina from "~component/options/oschina"
import Php from "~component/options/php"
import Segmentfault from "~component/options/segmentfault"
import Weixin from "~component/options/weixin"
import Zhihu from "~component/options/zhihu"

import styles from "./index.module.scss"

export default function IndexOptions() {
  const csdnRef = useRef<any>()
  const zhihuRef = useRef<any>()
  const baiduRef = useRef<any>()
  const juejinRef = useRef<any>()
  const oschinaRef = useRef<any>()
  const jianshuRef = useRef<any>()
  const jb51Ref = useRef<any>()
  const cnblogsRef = useRef<any>()
  const cto51Ref = useRef<any>()
  const phpRef = useRef<any>()
  const segmentfaultRef = useRef<any>()
  const weixinRef = useRef<any>()
  const customRef = useRef<any>()
  const appRef = useRef<any>()

  function handleReset() {
    if (confirm("确认重置配置？")) {
      csdnRef.current && csdnRef.current.handleReset()
      zhihuRef.current && zhihuRef.current.handleReset()
      baiduRef.current && baiduRef.current.handleReset()
      jianshuRef.current && jianshuRef.current.handleReset()
      jb51Ref.current && jb51Ref.current.handleReset()
      cnblogsRef.current && cnblogsRef.current.handleReset()
      cto51Ref.current && cto51Ref.current.handleReset()
      phpRef.current && phpRef.current.handleReset()
      appRef.current && appRef.current.handleReset()
    }
  }

  return (
    <ThemeProvider>
      <div className={`App ${styles.options}`}>
        <div className="App-header">
          <h2 className="title">CodeBox 🎉</h2>
          <p className="desc">{i18n("popupDescription")}</p>
        </div>
        <div className="App-body">
          <Csdn forwardRef={csdnRef} />
          <Zhihu forwardRef={zhihuRef} />
          <Baidu forwardRef={baiduRef} />
          <Jianshu forwardRef={jianshuRef} />
          <Jb51 forwardRef={jb51Ref} />
          <Cnblogs forwardRef={cnblogsRef} />
          <Cto51 forwardRef={cto51Ref} />
          <Juejin />
          <Php forwardRef={phpRef} />
          <Oschina />
          <Segmentfault />
          <Weixin />
          <Medium />
          <Custom />
          <Config forwardRef={appRef} />
        </div>
        <div className="App-link">
          <div className="item">
            {i18n("version")}：{chrome.runtime.getManifest().version}
          </div>
          <div className="item">
            <button className="reset" onClick={handleReset}>
              {i18n("reset")}
            </button>
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
              href="https://027xiguapi.github.io/code-box/privacy-policy.html"
              target="_blank"
              rel="noreferrer">
              {i18n("privacy")}📄
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
