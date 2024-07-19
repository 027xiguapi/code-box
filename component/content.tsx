import Cnblogs from "./cnblogs"
import Csdn from "./csdn"
import Custom from "./custom"
import Jb51 from "./jb51"
import Jianshu from "./jianshu"
import Zhihu from "./zhihu"

export default function Content() {
  return (
    <>
      <Csdn />
      <Zhihu />
      <Jianshu />
      <Jb51 />
      <Cnblogs />
      <Custom />
    </>
  )
}
