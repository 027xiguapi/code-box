import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import DownloadPdf from "~component/items/downloadPdf"
import EditMarkdown from "~component/items/editMarkdown"
import ShowTag from "~component/items/showTag"
import { i18n } from "~tools"

export default function Weixin() {
  return (
    <fieldset>
      <legend>{i18n("weixinConfig")}</legend>
      <CssCode name="weixin"></CssCode>
      <ShowTag name="weixin"></ShowTag>
      <EditMarkdown name="weixin"></EditMarkdown>
      <DownloadMarkdown name="weixin"></DownloadMarkdown>
      <DownloadHtml name="weixin"></DownloadHtml>
      <DownloadPdf name="weixin"></DownloadPdf>
    </fieldset>
  )
}
