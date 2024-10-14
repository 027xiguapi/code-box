import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const tabs = await chrome.tabs.query({ currentWindow: true, active: true })
  const tab = tabs[0]
  chrome.tabs.captureVisibleTab(
    tab.windowId,
    {
      format: "png"
    },
    (dataUrl) => {
      res.send({
        dataUrl: dataUrl
      })
    }
  )
}

export default handler
