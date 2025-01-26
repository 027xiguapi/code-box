import { EditOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/dist/hook"

import { i18n } from "~tools"

export default function SetAiType(props) {
  const [aiType, setAiType] = useStorage("app-aiType", (v) =>
    v === undefined ? "chatgpt" : v
  )

  return (
    <div className="item">
      <span>
        <StarTwoTone twoToneColor="#eb2f96" style={{ marginRight: "5px" }} />
        选择AI
      </span>
      <select
        name="custom-aiType"
        id="custom-aiType"
        value={aiType}
        onChange={(e) => setAiType(e.target.value)}>
        <option value="deepseek">deepseek</option>
        <option value="chatgpt">chatGPT</option>
        <option value="kimi">kimi</option>
      </select>
    </div>
  )
}
