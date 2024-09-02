import React, { useState } from "react"

import SortableItem from "~component/sortableItem"
import { ThemeProvider } from "~theme"
import { i18n } from "~tools"

import "~index.css"

import styles from "./index.module.scss"

export default function IndexOptions() {
  const items = [
    {
      id: "1",
      value: "csdn",
      label: "csdn",
      isShow: true
    },
    {
      id: "2",
      value: "zhihu",
      label: "知乎",
      isShow: true
    },
    {
      id: "3",
      value: "baidu",
      label: "百度",
      isShow: true
    },
    {
      id: "4",
      value: "jianshu",
      label: "简书",
      isShow: true
    },
    {
      id: "5",
      value: "jb51",
      label: "脚本之家",
      isShow: true
    },
    {
      id: "6",
      value: "cnblogs",
      label: "博客园",
      isShow: true
    },
    {
      id: "7",
      value: "51cto",
      label: "51CTO",
      isShow: true
    },
    {
      id: "8",
      value: "juejin",
      label: "掘金",
      isShow: true
    },
    {
      id: "9",
      value: "oschina",
      label: "oschina",
      isShow: true
    },
    {
      id: "10",
      value: "segmentfault",
      label: "思否",
      isShow: true
    },
    {
      id: "11",
      value: "weixin",
      label: "微信",
      isShow: true
    },
    {
      id: "12",
      value: "custom",
      label: "自定义",
      isShow: true
    },
    {
      id: "13",
      value: "app",
      label: "app",
      isShow: true
    }
  ]

  return (
    <ThemeProvider>
      <div className={`App ${styles.options}`}>
        <div className="App-header">
          <h2 className="title">CodeBox 🎉</h2>
          <p className="desc">{i18n("popupDescription")}</p>
        </div>
        <div className="App-body">
          {items.map((item, index) => (
            <SortableItem key={item.id} index={index} item={item} />
          ))}
        </div>
        <div className="App-link">
          <div className="item">
            {i18n("version")}：{chrome.runtime.getManifest().version}
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
