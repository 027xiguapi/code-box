/**
 * 打开「文章同步」页面
 *
 * 内容脚本没有 tabs 权限，这里通过后台脚本打开同步页并带上当前标签页 ID，
 * 同步页会自动提取当前页面的文章内容。
 */
export function openSyncPage() {
  try {
    chrome.runtime.sendMessage({ action: "openSyncPage", url: location.href })
  } catch (error) {
    // 兜底：直接打开同步页（同步页会自动选择最近访问的文章页）
    window.open(chrome.runtime.getURL("tabs/sync.html"))
  }
}
