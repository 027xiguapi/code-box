import dayjs from "dayjs"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default class Dom2Pdf {
  _rootDom = null
  _title = "codebox-pdf"
  _a4Width = 595.266
  _a4Height = 841.89
  _pageBackground = "rgba(255,255,255)"
  _hex = [0xff, 0xff, 0xff]

  constructor(rootDom, title, color = [255, 255, 255]) {
    this._rootDom = rootDom
    this._title = title
    this._pageBackground = `rgb(${color[0]},${color[1]},${color[2]})`
    this._hex = color
  }

  async savePdf() {
    const a4Width = this._a4Width
    const a4Height = this._a4Height
    const hex = this._hex

    return new Promise(async (resolve, reject) => {
      try {
        const canvas = await html2canvas(this._rootDom, {
          useCORS: true,
          allowTaint: true,
          scale: 0.8,
          backgroundColor: this._pageBackground
        })
        const pdf = new jsPDF("p", "pt", "a4")
        let index = 1,
          canvas1 = document.createElement("canvas"),
          height
        let leftHeight = canvas.height

        let a4HeightRef = Math.floor((canvas.width / a4Width) * a4Height)
        let position = 0
        let pageData = canvas.toDataURL("image/jpeg", 0.7)
        pdf.setDisplayMode("fullwidth", "continuous", "FullScreen")

        function createImpl(canvas) {
          if (leftHeight > 0) {
            index++
            let checkCount = 0
            if (leftHeight > a4HeightRef) {
              let i = position + a4HeightRef
              for (i = position + a4HeightRef; i >= position; i--) {
                let isWrite = true
                for (let j = 0; j < canvas.width; j++) {
                  let c = canvas.getContext("2d").getImageData(j, i, 1, 1).data
                  if (c[0] !== hex[0] || c[1] !== hex[1] || c[2] !== hex[2]) {
                    isWrite = false
                    break
                  }
                }
                if (isWrite) {
                  checkCount++
                  if (checkCount >= 10) {
                    break
                  }
                } else {
                  checkCount = 0
                }
              }
              height =
                Math.round(i - position) || Math.min(leftHeight, a4HeightRef)
              if (height <= 0) {
                height = a4HeightRef
              }
            } else {
              height = leftHeight
            }
            canvas1.width = canvas.width
            canvas1.height = height
            let ctx = canvas1.getContext("2d")
            ctx.drawImage(
              canvas,
              0,
              position,
              canvas.width,
              height,
              0,
              0,
              canvas.width,
              height
            )
            if (position !== 0) {
              pdf.addPage()
            }
            pdf.setFillColor(hex[0], hex[1], hex[2])
            pdf.rect(0, 0, a4Width, a4Height, "F")
            pdf.addImage(
              canvas1.toDataURL("image/jpeg", 1.0),
              "JPEG",
              0,
              0,
              a4Width,
              (a4Width / canvas1.width) * height
            )
            leftHeight -= height
            position += height
            if (leftHeight > 0) {
              setTimeout(createImpl, 500, canvas)
            } else {
              resolve(pdf)
            }
          }
        }

        if (leftHeight < a4HeightRef) {
          pdf.setFillColor(hex[0], hex[1], hex[2])
          pdf.rect(0, 0, a4Width, a4Height, "F")
          pdf.addImage(
            pageData,
            "JPEG",
            0,
            0,
            a4Width,
            (a4Width / canvas.width) * leftHeight
          )
          resolve(pdf)
        } else {
          try {
            pdf.deletePage(0)
            setTimeout(createImpl, 500, canvas)
          } catch (err) {
            reject(err)
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  async downloadPdf() {
    const newPdf = (await this.savePdf()) as jsPDF
    const title = `${this._title}-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.pdf`
    newPdf.save(title)
  }

  async printPdf() {
    const newPdf = (await this.savePdf()) as jsPDF
    const pdfBlob = newPdf.output("blob")
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl)
  }
}
