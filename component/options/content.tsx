import React, { useEffect, useRef, useState } from "react"

import Cto51 from "~component/options/51cto"
import Doc360 from "~component/options/360doc"
import Baidu from "~component/options/baidu"
import Cnblogs from "~component/options/cnblogs"
import Config from "~component/options/config"
import Csdn from "~component/options/csdn"
import Custom from "~component/options/custom"
import Jb51 from "~component/options/jb51"
import Jianshu from "~component/options/jianshu"
import Juejin from "~component/options/juejin"
import Medium from "~component/options/medium"
import Mp from "~component/options/mp"
import Oschina from "~component/options/oschina"
import Paywallbuster from "~component/options/paywallbuster"
import Php from "~component/options/php"
import Segmentfault from "~component/options/segmentfault"
import Weixin from "~component/options/weixin"
import Zhihu from "~component/options/zhihu"

let csdnIsShow = false
let zhihuIsShow = false
let baiduIsShow = false
let jianshuIsShow = false
let jb51IsShow = false
let cnblogsIsShow = false
let ctoIsShow = false
let juejinIsShow = false
let phpIsShow = false
let oschinaIsShow = false
let segmentfaultIsShow = false
let mediumIsShow = false
let paywallbusterIsShow = false
let doc360IsShow = false
let mpIsShow = false
let weixinIsShow = false

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentTab = tabs[0]
  if (currentTab) {
    const url = new URL(currentTab.url)
    const { hostname, pathname } = url
    csdnIsShow = hostname.includes("csdn")
    zhihuIsShow = hostname.includes("zhihu")
    baiduIsShow = hostname.includes("baidu")
    jianshuIsShow = hostname.includes("jianshu")
    jb51IsShow = hostname.includes("jb51")
    cnblogsIsShow = hostname.includes("cnblogs")
    ctoIsShow = hostname.includes("51cto")
    juejinIsShow = hostname.includes("juejin")
    phpIsShow = hostname.includes("php")
    oschinaIsShow = hostname.includes("oschina")
    segmentfaultIsShow = hostname.includes("segmentfault")
    mediumIsShow = hostname.includes("medium")
    paywallbusterIsShow = hostname.includes("paywallbuster")
    doc360IsShow = hostname.includes("360doc")
    csdnIsShow = hostname.includes("cgi-bin")

    if (hostname.includes("weixin")) {
      if (pathname.includes("cgi-bin")) {
        mpIsShow = true
      } else {
        weixinIsShow = true
      }
    }
  }
})

export default function Content() {
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

  return (
    <div className="content">
      {csdnIsShow ? <Csdn forwardRef={csdnRef} /> : <></>}
      {zhihuIsShow ? <Zhihu forwardRef={zhihuRef} /> : <></>}
      {baiduIsShow ? <Baidu forwardRef={baiduRef} /> : <></>}
      {jianshuIsShow ? <Jianshu forwardRef={jianshuRef} /> : <></>}
      {jb51IsShow ? <Jb51 forwardRef={jb51Ref} /> : <></>}
      {cnblogsIsShow ? <Cnblogs forwardRef={cnblogsRef} /> : <></>}
      {ctoIsShow ? <Cto51 forwardRef={cto51Ref} /> : <></>}
      {juejinIsShow ? <Juejin /> : <></>}
      {phpIsShow ? <Php forwardRef={phpRef} /> : <></>}
      {oschinaIsShow ? <Oschina /> : <></>}
      {segmentfaultIsShow ? <Segmentfault /> : <></>}
      {weixinIsShow ? <Weixin /> : <></>}
      {mediumIsShow ? <Medium /> : <></>}
      {mpIsShow ? <Mp /> : <></>}
      {paywallbusterIsShow ? <Paywallbuster /> : <></>}
      {doc360IsShow ? <Doc360 /> : <></>}
      <Custom />
      <Config forwardRef={customRef} />
    </div>
  )
}
