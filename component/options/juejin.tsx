import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Juejin() {
  return (
    <fieldset>
      <legend>{i18n("juejinConfig")}</legend>
      <EditMarkdown name="juejin"></EditMarkdown>
      <DownloadMarkdown name="juejin"></DownloadMarkdown>
      <DownloadHtml name="juejin"></DownloadHtml>
    </fieldset>
  )
}
