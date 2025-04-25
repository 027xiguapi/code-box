import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import DownloadPdf from "~component/items/downloadPdf"
import EditMarkdown from "~component/items/editMarkdown"
import ShowTag from "~component/items/showTag"
import { i18n } from "~tools"

export default function Options(props) {
  let { name } = props

  return (
    <fieldset>
      <legend>{i18n(name + "Config")}</legend>
      <CssCode name={name}></CssCode>
      <ShowTag name={name}></ShowTag>
      <EditMarkdown name={name}></EditMarkdown>
      <DownloadMarkdown name={name}></DownloadMarkdown>
      <DownloadHtml name={name}></DownloadHtml>
      <DownloadPdf name={name}></DownloadPdf>
    </fieldset>
  )
}
