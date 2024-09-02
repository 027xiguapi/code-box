import React, { useEffect, useState } from "react"

import { sendToContentScript } from "@plasmohq/messaging"

import Cto51 from "~component/51cto"
import Baidu from "~component/baidu"
import Cnblogs from "~component/cnblogs"
import Config from "~component/config"
import Csdn from "~component/csdn"
import Custom from "~component/custom"
import Jb51 from "~component/jb51"
import Jianshu from "~component/jianshu"
import Juejin from "~component/juejin"
import Oschina from "~component/oschina"
import Php from "~component/php"
import Zhihu from "~component/zhihu"

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
  const [customIsShow, setCustomIsShow] = useState<boolean>(false)

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
    getIsShow("custom")
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
    custom: setCustomIsShow
  }

  async function getIsShow(type) {
    const res = await sendToContentScript({ name: `${type}-isShow` })
    res?.isShow && setIsShowMap[type] && setIsShowMap[type](res.isShow)
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
      {customIsShow ? <Custom /> : <></>}
      <Config />
    </div>
  )
}
