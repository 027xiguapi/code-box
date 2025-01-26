import { type PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      const { active } = req.body

      if (active) {
        chrome.sidePanel.open({ tabId: tab.id })
      }
    })
  } catch (error) {
    console.error("Error toggling side panel:", error)
  }
}

export default handler
