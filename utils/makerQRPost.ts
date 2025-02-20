import { saveAs } from "file-saver"
import QRCode from "qrcode"

interface Position {
  x: number
  y: number
}

export default function makerQRCodeImg() {
  const qrcodepostmaker = document.createElement("canvas")
  qrcodepostmaker.id = "qrcodepostmaker"
  qrcodepostmaker.style.display = "none"
  document.body.appendChild(qrcodepostmaker)

  // 文本换行处理
  const textComputer = (
    text: string,
    style: string,
    width: number,
    ctx: CanvasRenderingContext2D
  ): string[] => {
    if (text.replace(/\s/g, "").length === 0) {
      return []
    }
    ctx.font = style
    let temp = 0
    const row: string[] = []
    for (let i = 0; i <= text.length; i++) {
      if (ctx.measureText(text.substring(temp, i)).width >= width) {
        row.push(text.substring(temp, i - 1))
        temp = i - 1
      } else if (i === text.length) {
        row.push(text.substring(temp, i))
      }
    }
    return row
  }

  // 绘制文本
  const textWriter = (
    textArr: string[],
    Style: string,
    align: CanvasTextAlign,
    color: string,
    borderColor: string,
    fontSize: number,
    lineHeight: number,
    pos: Position,
    ctx: CanvasRenderingContext2D
  ): Position => {
    ctx.font = Style
    ctx.textAlign = align
    ctx.fillStyle = color
    ctx.strokeStyle = borderColor
    for (const text of textArr) {
      pos.y += fontSize * lineHeight
      ctx.fillText(text, pos.x, pos.y)
    }
    return pos
  }

  // 生成海报
  const makerQRPost = (): void => {
    const canvas = document.querySelector<HTMLCanvasElement>("#qrcodepostmaker")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const QRCodeData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const title = document.title
    const desc = document.head.querySelector('meta[name="description"]')
      ? document.head.querySelector<HTMLMetaElement>(
          'meta[name="description"]'
        )!.content
      : ""
    const cardWidth = 360
    const lineHeight = 1.6
    const margin = 36
    const titleStyle = 'Bold 18px "Microsoft YaHei"'
    const descStyle = '16px "Microsoft YaHei"'

    const titleArray = textComputer(
      title,
      titleStyle,
      cardWidth - margin * 2,
      ctx
    )
    const descArray = textComputer(desc, descStyle, cardWidth - margin * 2, ctx)

    const cardHeight =
      margin * 2.5 +
      18 * titleArray.length * lineHeight +
      16 * descArray.length * lineHeight +
      (descArray.length ? margin / 2 : 0) +
      300

    canvas.width = cardWidth
    canvas.height = cardHeight

    const myGradient = ctx.createLinearGradient(0, 0, 0, cardHeight)
    myGradient.addColorStop(0, "#2980B9")
    myGradient.addColorStop(0.5, "#6DD5FA")
    myGradient.addColorStop(1, "#FFFFFF")

    ctx.fillStyle = myGradient
    ctx.fillRect(0, 0, cardWidth, cardHeight)
    ctx.fillStyle = "#FFFFFF"

    ctx.beginPath()
    ctx.arc(margin * 0.4, cardHeight - margin * 5, margin, 0, Math.PI * 2, true)
    ctx.arc(
      cardWidth - margin * 0.4,
      cardHeight - margin * 3,
      margin * 0.8,
      0,
      Math.PI * 2,
      true
    )
    ctx.fillRect(0, cardHeight - margin * 5, cardWidth / 2, margin * 5)
    ctx.fillRect(
      cardWidth / 2,
      cardHeight - margin * 3,
      cardWidth / 2,
      margin * 3
    )
    ctx.fill()

    const titleEnd = textWriter(
      titleArray,
      titleStyle,
      "center",
      "black",
      "rgba(255, 255, 255, 0.6)",
      18,
      lineHeight,
      { x: cardWidth / 2, y: margin },
      ctx
    )
    const descEnd = textWriter(
      descArray,
      descStyle,
      "left",
      "black",
      "rgba(255, 255, 255, 0.6)",
      16,
      lineHeight,
      { x: margin, y: titleEnd.y + margin / 2 },
      ctx
    )

    ctx.fillStyle = "white"
    ctx.fillRect((cardWidth - 288) / 2, descEnd.y + margin - 24, 288, 288)
    ctx.putImageData(QRCodeData, (cardWidth - 256) / 2, descEnd.y + margin)

    textWriter(
      ["（长按识别二维码进行访问）"],
      descStyle,
      "center",
      "rgba(0, 0, 0, 0.6)",
      "rgba(255, 255, 255, 0.6)",
      16,
      lineHeight,
      { x: cardWidth / 2, y: descEnd.y + margin + 256 },
      ctx
    )
    textWriter(
      ["codebox-一键复制代码/下载文章"],
      descStyle,
      "center",
      "rgba(0, 0, 0, 0.6)",
      "rgba(255, 255, 255, 0.6)",
      16,
      lineHeight,
      { x: cardWidth / 2, y: descEnd.y + margin + 280 },
      ctx
    )

    saveAs(canvas.toDataURL("image/png"), title + ".png")
    qrcodepostmaker.parentNode?.removeChild(qrcodepostmaker)
  }

  let tryTimes = 30
  const makeQRCode = window.setInterval(() => {
    try {
      QRCode.toCanvas(
        document.getElementById("qrcodepostmaker"),
        window.location.href,
        { width: 260, errorCorrectionLevel: "Q" },
        (error) => {
          if (error) {
            console.log(error)
            return
          }
          makerQRPost()
        }
      )
      window.clearInterval(makeQRCode)
    } catch (error) {
      console.log(error)
      tryTimes--
      if (!tryTimes) {
        window.clearInterval(makeQRCode)
        alert("没能成功载入功能库，请刷新重试~")
      }
    }
  }, 200)
}
