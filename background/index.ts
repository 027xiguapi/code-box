export {}

import "@plasmohq/messaging/background"

chrome.runtime.onInstalled.addListener(function(object) {
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: chrome.runtime.getURL("options.html") })
  }
})
