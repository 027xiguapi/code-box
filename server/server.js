import dotenv from "dotenv"
import express from "express"

import WechatSender from "./WechatSender.js"

dotenv.config()

const app = express()
app.use(express.json())

const wechatSender = new WechatSender()

app.post("/api/article/send", async (req, res) => {
  try {
    const article = req.body
    const articleId = await wechatSender.send({ ...article })
    res.json({ success: true, articleId })
  } catch (error) {
    console.error("Error sending article:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post("/api/article/submit", async (req, res) => {
  try {
    const article = req.body
    const accessToken = await wechatSender.getAccessToken()
    const mediaId = await wechatSender.addDraft(accessToken, {
      ...article
    })
    res.json({ success: true, mediaId })
  } catch (error) {
    console.error("Error submitting article:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
