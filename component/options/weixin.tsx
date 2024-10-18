import { useStorage } from "@plasmohq/storage/dist/hook"

import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Weixin() {
  return (
    <fieldset>
      <legend>{i18n("weixinConfig")}</legend>
      <EditMarkdown name="weixin"></EditMarkdown>
      <DownloadMarkdown name="weixin"></DownloadMarkdown>
      <DownloadHtml name="weixin"></DownloadHtml>
    </fieldset>
  )
}
