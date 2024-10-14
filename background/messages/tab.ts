import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { url } = req.body

  chrome.tabs.create({ url: `/tabs/${url}` })
}

export default handler
