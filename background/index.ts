import "@plasmohq/messaging/background"

export {}

// 初始化设置
chrome.runtime.onInstalled.addListener(function (object) {
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: chrome.runtime.getURL("options.html") })
  }
})

// 检查更新
chrome.runtime.requestUpdateCheck(function (status, details) {
  if (status === "update_available") {
    console.log("有更新可用！版本" + details.version)
    chrome.action.setBadgeBackgroundColor({ color: "#fc5430" })
    chrome.action.setBadgeText({
      text: "升级"
    })
    chrome.runtime.reload()
  } else if (status === "no_update") {
    console.log("没有可用更新。")
  } else if (status === "throttled") {
    console.log("更新检查被限流。")
  }
})

chrome.tabs.onUpdated.addListener((tabId, _, tab) => {
  // console.log(tabId, _, tab)
  // if (!("sidePanel" in chrome)) {
  //   return
  // }
  //
  // void (async () => {
  //   if (!tab.url) {
  //     return
  //   }
  //   // const url = new URL(tab.url)
  //   // if (
  //   //   url.origin === ""
  //   // ) {
  //   //   await chrome.sidePanel.setOptions({
  //   //     tabId,
  //   //     // path: "pages/options.html",
  //   //     enabled: true
  //   //   })
  //   // } else {
  //   // await chrome.sidePanel.setOptions({
  //   //   tabId,
  //   //   enabled: false
  //   // })
  //   // }
  // })()
})
