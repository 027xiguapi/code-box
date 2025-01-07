import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import DownloadPdf from "~component/items/downloadPdf"
import EditMarkdown from "~component/items/editMarkdown"
import ShowTag from "~component/items/showTag"
import { i18n } from "~tools"

export default function Segmentfault() {
  return (
    <fieldset>
      <legend>{i18n("segmentfaultConfig")}</legend>
      <CssCode name="segmentfault" />
      <ShowTag name="segmentfault" />
      <EditMarkdown name="segmentfault" />
      <DownloadMarkdown name="segmentfault" />
      <DownloadHtml name="segmentfault" />
      <DownloadPdf name="segmentfault" />
    </fieldset>
  )
}
