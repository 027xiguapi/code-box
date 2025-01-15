import fetch from "node-fetch"

class WechatSender {
  constructor() {
    this.appid = process.env.WECHAT_APPID
    this.secret = process.env.WECHAT_SECRET

    if (!this.appid || !this.secret) {
      const errorMessage =
        "Error: WECHAT_APPID or WECHAT_SECRET is not set in the environment variables"
      console.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  async getAccessToken() {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appid}&secret=${this.secret}`
    const response = await fetch(url)
    const data = await response.json()
    if (data.errcode) {
      throw new Error(`Failed to get access token: ${data.errmsg}`)
    }
    return data.access_token
  }

  async addDraft(accessToken, event) {
    const url = `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        articles: [
          {
            title: event.title, // 标题
            author: event.author, // 作者
            digest: event.digest, // 图文消息的摘要，仅有单图文消息才有摘要，多图文此处为空。如果本字段为没有填写，则默认抓取正文前54个字。
            content: event.content, // 图文消息的具体内容，支持HTML标签，必须少于2万字符，小于1M，且此处会去除JS,涉及图片url必须来源 "上传图文消息内的图片获取URL"接口获取。外部图片url将被过滤。
            content_source_url: event.content_source_url, //图文消息的原文地址，即点击“阅读原文”后的URL
            thumb_media_id: event.thumb_media_id, // 图文消息的封面图片素材id（必须是永久MediaID）
            need_open_comment: event.need_open_comment, // Uint32 是否打开评论，0不打开(默认)，1打开
            only_fans_can_comment: event.only_fans_can_comment, // Uint32 是否粉丝才可评论，0所有人可评论(默认)，1粉丝才可评论
            pic_crop_235_1: event.pic_crop_235_1, // 封面裁剪为2.35:1规格的坐标字段。
            pic_crop_1_1: event.pic_crop_1_1 // 封面裁剪为1:1规格的坐标字段，裁剪原理同pic_crop_235_1，裁剪后的图片必须符合规格要求。
          }
        ]
      })
    })
    const data = await response.json()
    if (data.errcode) {
      throw new Error(`Failed to add draft: ${data.errmsg}`)
    }
    return data.media_id
  }

  async publishArticle(accessToken, mediaId) {
    const url = `https://api.weixin.qq.com/cgi-bin/freepublish/submit?access_token=${accessToken}`
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        media_id: mediaId
      })
    })
    const data = await response.json()
    if (data.errcode) {
      throw new Error(`Failed to publish article: ${data.errmsg}`)
    }
    return data.publish_id
  }

  async send(event) {
    try {
      const accessToken = await this.getAccessToken()
      const mediaId = await this.addDraft(accessToken, event)
      const articleId = await this.publishArticle(accessToken, mediaId)
      console.log(`Article published successfully. Article ID: ${articleId}`)
      return articleId
    } catch (error) {
      console.error("Error in WechatSender:", error.message)
      throw error
    }
  }
}

export default WechatSender
