import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import EditMarkdown from "~component/items/editMarkdown"
import ShowTag from "~component/items/showTag"
import { i18n } from "~tools"

export default function Juejin() {
  return (
    <fieldset>
      <legend>{i18n("juejinConfig")}</legend>
      <ShowTag name="juejin"></ShowTag>
      <EditMarkdown name="juejin"></EditMarkdown>
      <DownloadMarkdown name="juejin"></DownloadMarkdown>
      <DownloadHtml name="juejin"></DownloadHtml>
    </fieldset>
  )
}
