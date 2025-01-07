export default function TagBtnStyle() {
  const style = document.createElement("style")
  style.textContent = `
  .codebox-tagBtn {
    height: 28px;
    display: flex;
    cursor: pointer;
    align-items: center;
    color: #1e80ff;
    width: 100px;
    background: #fff;
    border-radius: 5px;
    justify-content: space-between;
    padding: 0 8px;
    margin-top: -20px;
    font-size: 14px;
  }
  .codebox-tagBtn .btn:hover {
    color: #fff;
    background: #1e80ff;
    border-radius: 3px;
  }
  `
  return style
}
