import chromeUrl from "raw:~/public/webstore/1723513894421.jpg"
import githubUrl from "raw:~/public/webstore/1724640034462.jpg"
import edgeUrl from "raw:~/public/webstore/1724640161752.jpg"
import firefoxUrl from "raw:~/public/webstore/img.png"
import qrcodeUrl from "raw:~/public/wx/qrcode_wx.jpg"

import styles from "./feed.module.scss"

export default function FeedPage() {
  return (
    <div className={styles.feed}>
      <div className="item">
        <h1>微信公众号</h1>
        <img src={qrcodeUrl} alt="微信公众号" />
      </div>
      <div className="item">
        <h1>github</h1>
        <a
          className="desc"
          href="https://github.com/027xiguapi/code-box"
          target="_blank">
          <div className="desc">
            网站(https://github.com/027xiguapi/code-box)
          </div>
          <img src={githubUrl} alt="github" />
        </a>
      </div>
      <div className="item">
        <h1>应用商店</h1>
        <a
          href="https://chrome.google.com/webstore/detail/acnnhjllgegbndgknlliobjlekgilbdf"
          target="_blank">
          <div className="desc">Chrome</div>
          <img className="item-img" src={chromeUrl} alt="Chrome" />
        </a>
        <a
          className="desc"
          href="https://addons.mozilla.org/zh-CN/firefox/addon/code-box/"
          target="_blank">
          <div className="desc">Firefox</div>
          <img className="item-img" src={firefoxUrl} alt="Firefox" />
        </a>
        <a
          className="desc"
          href="https://microsoftedge.microsoft.com/addons/detail/code-box/cfpdbfmncaampihkmejogihjkenkonbn"
          target="_blank">
          <div className="desc">Edge</div>
          <img className="item-img" src={edgeUrl} alt="Edge" />
        </a>
      </div>
    </div>
  )
}
