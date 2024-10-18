import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Cnblogs() {
  return (
    <fieldset>
      <legend>{i18n("cnblogsConfig")}</legend>
      <EditMarkdown name="cnblogs"></EditMarkdown>
      <DownloadMarkdown name="cnblogs"></DownloadMarkdown>
      <DownloadHtml name="cnblogs"></DownloadHtml>
      <CssCode name="cnblogs"></CssCode>
    </fieldset>
  )
}
