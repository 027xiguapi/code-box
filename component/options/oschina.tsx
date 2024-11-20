import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import DownloadPdf from "~component/items/downloadPdf"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Oschina() {
  return (
    <fieldset>
      <legend>{i18n("oschinaConfig")}</legend>
      <CssCode name="oschina"></CssCode>
      <EditMarkdown name="oschina"></EditMarkdown>
      <DownloadMarkdown name="oschina"></DownloadMarkdown>
      <DownloadHtml name="oschina"></DownloadHtml>
      <DownloadPdf name="oschina"></DownloadPdf>
    </fieldset>
  )
}
