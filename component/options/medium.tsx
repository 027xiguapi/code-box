import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import EditMarkdown from "~component/items/editMarkdown"
import ShowTag from "~component/items/showTag"
import { i18n } from "~tools"

export default function Medium() {
  return (
    <fieldset>
      <legend>{i18n("mediumConfig")}</legend>
      <CssCode name="medium"></CssCode>
      <ShowTag name="medium"></ShowTag>
      <EditMarkdown name="medium"></EditMarkdown>
      <DownloadMarkdown name="medium"></DownloadMarkdown>
      <DownloadHtml name="medium"></DownloadHtml>
    </fieldset>
  )
}
