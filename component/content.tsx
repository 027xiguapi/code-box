import { useStorage } from "@plasmohq/storage/dist/hook"
import React from "react"

import Csdn from "~component/csdn"
import Zhihu from "~component/zhihu"
import Jianshu from "~component/jianshu"
import Jb51 from "~component/jb51"
import Cnblogs from "~component/cnblogs"
import Cto51 from "~component/51cto"
import Custom from "~component/custom"

const itemMap = {
  csdn: <Csdn />,
  zhihu: <Zhihu />,
  jianshu: <Jianshu />,
  jb51: <Jb51 />,
  cnblogs: <Cnblogs />,
  "51cto": <Cto51 />,
  custom: <Custom />,
}

export default function Content() {
  const [items] = useStorage("app-items", [
    {
      id: "1",
      value: "csdn",
      label: "csdn",
      isShow: true,
    },
    {
      id: "2",
      value: "zhihu",
      label: "知乎",
      isShow: true,
    },
    {
      id: "3",
      value: "jianshu",
      label: "简书",
      isShow: true,
    },
    {
      id: "4",
      value: "jb51",
      label: "脚本之家",
      isShow: true,
    },
    {
      id: "5",
      value: "cnblogs",
      label: "博客园",
      isShow: true,
    },
    {
      id: "6",
      value: "51cto",
      label: "51CTO",
      isShow: true,
    },
    {
      id: "7",
      value: "custom",
      label: "自定义",
      isShow: true,
    }
  ])

  return (
    <>
      {items.map((item, index) => (
        item.isShow ? itemMap[item.value] : <></>
      ))}
    </>
  )
}
