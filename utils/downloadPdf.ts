import dayjs from "dayjs"
import html2pdf from "html2pdf.js"

export function savePdf(article: Element, filename?: string) {
  if (article) {
    var style = document.createElement("style")
    style.innerHTML = `
        .rich_media_content img {
          page-break-inside: avoid;
          break-inside: avoid;
          max-width: 100%;
          height: auto;
        }
        .rich_media_content p, .rich_media_content div {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      `
    document.head.appendChild(style)

    // 确保所有图片加载完成
    let images = article.querySelectorAll("img")
    let imagePromises = []

    images.forEach(function (img) {
      // 处理懒加载的图片，确保图片的真实 URL 被加载
      if (img.dataset && img.dataset.src) {
        img.src = img.dataset.src
      }

      // 通过跨域获取图片，并将图片转换为 base64 格式
      imagePromises.push(
        new Promise(function (resolve) {
          const imgElement = new Image()
          imgElement.crossOrigin = "Anonymous"
          imgElement.src = img.src
          imgElement.onload = function () {
            var canvas = document.createElement("canvas")
            canvas.width = imgElement.width
            canvas.height = imgElement.height
            var ctx = canvas.getContext("2d")
            ctx.drawImage(imgElement, 0, 0)
            img.src = canvas.toDataURL("image/jpeg") // 使用JPEG格式并压缩质量到70%
            resolve(`成功加载:${img.src}`)
          }
          imgElement.onerror = resolve // 即使图片加载失败，继续处理
        })
      )
    })

    // 确保图片加载完成后再导出PDF
    Promise.all(imagePromises)
      .then(function () {
        // 使用文章标题作为文件名
        filename = filename || "CodeBox-page"
        var fileName = `${filename}-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.pdf`

        var opt = {
          margin: 0.5,
          filename: fileName,
          image: {
            type: "jpeg",
            quality: 1 // 降低图片质量以减小PDF体积
          },
          html2canvas: {
            scale: 1.5, // 降低渲染比例以减小PDF体积
            useCORS: true, // 允许跨域图片
            logging: false // 关闭日志
            // 可以根据需要添加其他html2canvas选项
          },
          jsPDF: {
            unit: "in",
            format: "a4", // 使用A4格式，比letter更常用且体积可能更小
            orientation: "portrait"
          },
          pagebreak: {
            mode: ["avoid-all", "css", "legacy"]
          } // 遵循CSS中的page-break规则
        }

        html2pdf()
          .from(article)
          .set(opt)
          .save()
          .then(function () {})
          .catch(function (error) {
            alert("导出过程中出现问题: " + error.message)
            console.log(error)
          })
      })
      .catch(function (error) {
        console.log("处理图片时出现问题: " + error.message)
      })
  } else {
    alert("未找到文章内容")
  }
}
