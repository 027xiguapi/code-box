import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Segmentfault() {
  return (
    <fieldset>
      <legend>{i18n("segmentfaultConfig")}</legend>
      <EditMarkdown name="segmentfault"></EditMarkdown>
      <DownloadMarkdown name="segmentfault"></DownloadMarkdown>
      <DownloadHtml name="segmentfault"></DownloadHtml>
    </fieldset>
  )
}
