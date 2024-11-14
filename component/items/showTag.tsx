import { StarTwoTone, TagOutlined } from "@ant-design/icons"

import { useStorage } from "@plasmohq/storage/dist/hook"

import { i18n } from "~tools"

export default function ShowTag(props) {
  let { name } = props

  const [showTag, setShowTag] = useStorage(`${name}-showTag`, (v) =>
    v === undefined ? true : v
  )

  return (
    <div className="item">
      <span>
        <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
        {i18n("showTag")}
      </span>
      <input
        type="checkbox"
        id={`${name}-showTag`}
        name={`${name}-showTag`}
        className="codebox-offscreen"
        checked={showTag}
        onChange={(e) => setShowTag(e.target.checked)}
      />
      <label className="codebox-switch" htmlFor={`${name}-showTag`}></label>
    </div>
  )
}
