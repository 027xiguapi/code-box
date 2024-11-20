import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import CssCode from "~component/items/cssCode"
import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Custom() {
  return (
    <fieldset>
      <legend>{i18n("customConfig")}</legend>
      <CssCode name="custom"></CssCode>
      <EditMarkdown name="custom"></EditMarkdown>
      <DownloadMarkdown name="custom"></DownloadMarkdown>
      <DownloadHtml name="custom"></DownloadHtml>
    </fieldset>
  )
}
