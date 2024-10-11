import { DownloadOutlined, StarTwoTone } from "@ant-design/icons"

import { sendToContentScript } from "@plasmohq/messaging"

import DownloadHtml from "~component/items/downloadHtml"
import DownloadMarkdown from "~component/items/downloadMarkdown"
import EditMarkdown from "~component/items/editMarkdown"
import { i18n } from "~tools"

export default function Segmentfault() {
  function downloadMarkdown() {
    sendToContentScript({
      name: "segmentfault-downloadMarkdown"
    })
  }

  function downloadHtml() {
    sendToContentScript({
      name: "segmentfault-downloadHtml"
    })
  }

  return (
    <fieldset>
      <legend>{i18n("segmentfaultConfig")}</legend>
      <EditMarkdown name="segmentfault"></EditMarkdown>
      <DownloadMarkdown name="segmentfault"></DownloadMarkdown>
      <DownloadHtml name="segmentfault"></DownloadHtml>
    </fieldset>
  )
}
