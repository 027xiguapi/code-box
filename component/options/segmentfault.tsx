import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import DownloadPdf from "~component/items/downloadPdf"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Segmentfault() {
  return (
    <fieldset>
      <legend>{i18n("segmentfaultConfig")}</legend>
      <CssCode name="segmentfault"></CssCode>
      <EditMarkdown name="segmentfault"></EditMarkdown>
      <DownloadMarkdown name="segmentfault"></DownloadMarkdown>
      <DownloadHtml name="segmentfault"></DownloadHtml>
      <DownloadPdf name="segmentfault"></DownloadPdf>
    </fieldset>
  )
}
