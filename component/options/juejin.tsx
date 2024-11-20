import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import DownloadPdf from "~component/items/downloadPdf"
import EditMarkdown from "~component/items/editMarkdown"
import ShowTag from "~component/items/showTag"
import { i18n } from "~tools"

export default function Juejin() {
  return (
    <fieldset>
      <legend>{i18n("juejinConfig")}</legend>
      <CssCode name="juejin"></CssCode>
      <ShowTag name="juejin"></ShowTag>
      <EditMarkdown name="juejin"></EditMarkdown>
      <DownloadMarkdown name="juejin"></DownloadMarkdown>
      <DownloadHtml name="juejin"></DownloadHtml>
      <DownloadPdf name="juejin"></DownloadPdf>
    </fieldset>
  )
}
