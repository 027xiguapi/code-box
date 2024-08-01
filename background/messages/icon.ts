import type { PlasmoMessaging } from "@plasmohq/messaging"
import activeUrl from "raw:~/assets/logo.png"
import defaultUrl from "raw:~/assets/icon.png"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const [tab] = await chrome.tabs.query({ currentWindow: true, active: true })
  const { active } = req.body

  console.log(tab)
  if (active) {
    chrome.action.setIcon({ tabId: tab.id, path: activeUrl }, () => {
      console.log("set icon activeUrl")
    })
  } else {
    chrome.action.setIcon({ tabId: tab.id, path: defaultUrl }, () => {
      console.log("set icon defaultUrl")
    })
  }
}

export default handler