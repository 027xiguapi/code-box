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
