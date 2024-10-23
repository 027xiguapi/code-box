import React, { useEffect, useState } from "react"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/dist/hook"

import Cto51 from "~component/options/51cto"
import Baidu from "~component/options/baidu"
import Cnblogs from "~component/options/cnblogs"
import Config from "~component/options/config"
import Csdn from "~component/options/csdn"
import Custom from "~component/options/custom"
import Jb51 from "~component/options/jb51"
import Jianshu from "~component/options/jianshu"
import Juejin from "~component/options/juejin"
import Oschina from "~component/options/oschina"
import Php from "~component/options/php"
import Segmentfault from "~component/options/segmentfault"
import Weixin from "~component/options/weixin"
import Zhihu from "~component/options/zhihu"

export default function Content() {
  const [closeLog] = useStorage("config-closeLog", true)
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

  useEffect(() => {
    getIsShow("csdn")
    getIsShow("zhihu")
    getIsShow("baidu")
    getIsShow("jianshu")
    getIsShow("jb51")
    getIsShow("cnblogs")
    getIsShow("51cto")
    getIsShow("juejin")
    getIsShow("php")
    getIsShow("oschina")
    getIsShow("segmentfault")
    getIsShow("weixin")
  }, [])

  const setIsShowMap = {
    csdn: setCsdnIsShow,
    zhihu: setZhihuIsShow,
    baidu: setBaiduIsShow,
    jianshu: setJianshuIsShow,
    jb51: setJb51IsShow,
    cnblogs: setCnblogsShow,
    "51cto": set51ctoIsShow,
    php: setPhpIsShow,
    juejin: setJuejinIsShow,
    oschina: setOschinaIsShow,
    segmentfault: setSegmentfaultIsShow,
    weixin: setWeixinIsShow
  }

  function getIsShow(type) {
    sendToContentScript({ name: `${type}-isShow` })
      .then((res) => {
        res?.isShow && setIsShowMap[type] && setIsShowMap[type](res.isShow)
      })
      .catch((err) => {
        closeLog || console.log("getIsShow", err)
      })
  }

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
      <Custom />
      <Config />
    </div>
  )
}
