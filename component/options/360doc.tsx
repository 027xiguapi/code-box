import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import DownloadPdf from "~component/items/downloadPdf"
import EditMarkdown from "~component/items/editMarkdown"
import ShowTag from "~component/items/showTag"
import { i18n } from "~tools"

export default function Doc360() {
  return (
    <fieldset>
      <legend>{i18n("360docConfig")}</legend>
      <CssCode name="360doc"></CssCode>
      <ShowTag name="360doc"></ShowTag>
      <EditMarkdown name="360doc"></EditMarkdown>
      <DownloadMarkdown name="360doc"></DownloadMarkdown>
      <DownloadHtml name="360doc"></DownloadHtml>
      <DownloadPdf name="360doc"></DownloadPdf>
    </fieldset>
  )
}
