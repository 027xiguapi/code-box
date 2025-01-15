import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log(req)
  if (req.body === "openPopup") {
    chrome.windows.create({
      url: "popup.html",
      type: "popup",
      width: 300,
      height: 200
    })
  }
}

export default handler
