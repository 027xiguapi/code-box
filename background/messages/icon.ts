import type { PlasmoMessaging } from "@plasmohq/messaging"
import activeUrl from "raw:~/assets/logo.png"
import defaultUrl from "raw:~/assets/icon.png"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { active } = req.body

  if (active) {
    chrome.action.setIcon({ path: activeUrl }, () => {
      console.log("set icon activeUrl")
    })
  } else {
    chrome.action.setIcon({ path: defaultUrl }, () => {
      console.log("set icon defaultUrl")
    })
  }
}

export default handler