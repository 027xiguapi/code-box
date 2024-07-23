import { useStorage } from "@plasmohq/storage/dist/hook"

import Cnblogs from "./cnblogs"
import Csdn from "./csdn"
import Custom from "./custom"
import Jb51 from "./jb51"
import Jianshu from "./jianshu"
import Zhihu from "./zhihu"
import React from "react"

const itemMap = {
  csdn: <Csdn />,
  zhihu: <Zhihu />,
  jianshu: <Jianshu />,
  jb51: <Jb51 />,
  cnblogs: <Cnblogs />,
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
