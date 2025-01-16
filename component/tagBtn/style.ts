export default function TagBtnStyle() {
  const style = document.createElement("style")
  style.textContent = `
  .codebox-tagBtn .btn:hover {
    color: #fff;
    background: #1e80ff;
    border-radius: 3px;
  }
  `
  return style
}
