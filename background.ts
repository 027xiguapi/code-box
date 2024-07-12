export {}

chrome.runtime.onInstalled.addListener(function (object) {
  let externalUrl = "https://github.com/027xiguapi/code-box"

  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: externalUrl })
  }
})
