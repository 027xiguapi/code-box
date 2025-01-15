import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import DownloadPdf from "~component/items/downloadPdf"
import EditMarkdown from "~component/items/editMarkdown"
import ParseMarkdown from "~component/items/parseMarkdown"
import { i18n } from "~tools"

export default function Custom() {
  return (
    <fieldset>
      <legend>{i18n("customConfig")}</legend>
      <CssCode name="custom"></CssCode>
      <ParseMarkdown name="custom" />
      <EditMarkdown name="custom" />
      <DownloadMarkdown name="custom" />
      <DownloadHtml name="custom" />
      <DownloadPdf name="custom" />
    </fieldset>
  )
}
