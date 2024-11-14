import React, { useEffect, useState } from "react"

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

export default function Content() {
  const [csdnIsShow, setCsdnIsShow] = useState<boolean>(false)
  const [zhihuIsShow, setZhihuIsShow] = useState<boolean>(false)
  const [baiduIsShow, setBaiduIsShow] = useState<boolean>(false)
  const [jianshuIsShow, setJianshuIsShow] = useState<boolean>(false)
  const [jb51IsShow, setJb51IsShow] = useState<boolean>(false)
  const [cnblogsIsShow, setCnblogsShow] = useState<boolean>(false)
  const [ctoIsShow, set51ctoIsShow] = useState<boolean>(false)
  const [juejinIsShow, setJuejinIsShow] = useState<boolean>(false)
  const [phpIsShow, setPhpIsShow] = useState<boolean>(false)
  const [oschinaIsShow, setOschinaIsShow] = useState<boolean>(false)
  const [segmentfaultIsShow, setSegmentfaultIsShow] = useState<boolean>(false)
  const [weixinIsShow, setWeixinIsShow] = useState<boolean>(false)
  const [mediumIsShow, setMediumIsShow] = useState<boolean>(false)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0]
      if (currentTab) {
        const url = new URL(currentTab.url)
        const hostname = url.hostname

        hostname.includes("csdn") && setCsdnIsShow(true)
        hostname.includes("zhihu") && setZhihuIsShow(true)
        hostname.includes("baidu") && setBaiduIsShow(true)
        hostname.includes("jianshu") && setJianshuIsShow(true)
        hostname.includes("jb51") && setJb51IsShow(true)
        hostname.includes("cnblogs") && setCnblogsShow(true)
        hostname.includes("51cto") && set51ctoIsShow(true)
        hostname.includes("juejin") && setJuejinIsShow(true)
        hostname.includes("php") && setPhpIsShow(true)
        hostname.includes("oschina") && setOschinaIsShow(true)
        hostname.includes("segmentfault") && setSegmentfaultIsShow(true)
        hostname.includes("weixin") && setWeixinIsShow(true)
        hostname.includes("medium") && setMediumIsShow(true)
      }
    })
  }, [])

  return (
    <div className="content">
      {csdnIsShow ? <Csdn /> : <></>}
      {zhihuIsShow ? <Zhihu /> : <></>}
      {baiduIsShow ? <Baidu /> : <></>}
      {jianshuIsShow ? <Jianshu /> : <></>}
      {jb51IsShow ? <Jb51 /> : <></>}
      {cnblogsIsShow ? <Cnblogs /> : <></>}
      {ctoIsShow ? <Cto51 /> : <></>}
      {juejinIsShow ? <Juejin /> : <></>}
      {phpIsShow ? <Php /> : <></>}
      {oschinaIsShow ? <Oschina /> : <></>}
      {segmentfaultIsShow ? <Segmentfault /> : <></>}
      {weixinIsShow ? <Weixin /> : <></>}
      {mediumIsShow ? <Medium /> : <></>}
      <Custom />
      <Config />
    </div>
  )
}
