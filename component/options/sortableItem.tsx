import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import React from "react"

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

const itemMap = {
  csdn: <Csdn />,
  zhihu: <Zhihu />,
  baidu: <Baidu />,
  juejin: <Juejin />,
  oschina: <Oschina />,
  jianshu: <Jianshu />,
  jb51: <Jb51 />,
  cnblogs: <Cnblogs />,
  "51cto": <Cto51 />,
  php: <Php />,
  segmentfault: <Segmentfault />,
  weixin: <Weixin />,
  custom: <Custom />,
  app: <Config />
}

export default function SortableItem(props) {
  const { item } = props

  return <div className="sortableItem">{itemMap[item.value]}</div>
}
