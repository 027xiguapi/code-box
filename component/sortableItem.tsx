import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import React from "react"

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
import Segmentfault from "~component/segmentfault"
import Weixin from "~component/weixin"
import Zhihu from "~component/zhihu"

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
