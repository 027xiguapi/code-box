import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import DownloadPdf from "~component/items/downloadPdf"
import EditMarkdown from "~component/items/editMarkdown"
import ShowTag from "~component/items/showTag"
import { i18n } from "~tools"

export default function Paywallbuster() {
  return (
    <fieldset>
      <legend>{i18n("paywallbusterConfig")}</legend>
      <CssCode name="paywallbuster"></CssCode>
      <ShowTag name="paywallbuster"></ShowTag>
      <EditMarkdown name="paywallbuster"></EditMarkdown>
      <DownloadMarkdown name="paywallbuster"></DownloadMarkdown>
      <DownloadHtml name="paywallbuster"></DownloadHtml>
      <DownloadPdf name="paywallbuster"></DownloadPdf>
    </fieldset>
  )
}
