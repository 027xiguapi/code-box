import Csdn from "./component/csdn"
import Jb51 from "./component/jb51"

function IndexOptions() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <Csdn />
      <Jb51 />
    </div>
  )
}

export default IndexOptions
