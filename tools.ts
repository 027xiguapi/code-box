export function addCss(html) {
  const style = document.createElement("style")
  const css = document.createTextNode(html)
  style.appendChild(css)
  document.head.appendChild(style)
}
