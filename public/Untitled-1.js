// ==UserScript==
// @name         博客转PDF(网页局部区域打印)-适用于知乎、CSDN、掘金、博客园、开源中国、简书、思否
// @namespace    https://greasyfork.org/zh-CN/scripts/428697
// @homepageURL  https://greasyfork.org/zh-CN/scripts/428697
// @home-url1    https://github.com/dossweet/sweet-WebJS
// @version      10.13
// @description  把知乎、CSDN、简书、博客园、开源中国、掘金、思否七大主流博客网站的文章部分另存为PDF，便于本地进行编辑。兼容chrome,firefox,edge浏览器，其余未测试
// @author       dossweet
// @include       https://zhuanlan.zhihu.com/p/*
// @include       https://www.zhihu.com/question/*/answer/*
// @include      https://www.zhihu.com/question/*
// @include      https://blog.csdn.net/*/article/details/*
// @include      https://*.blog.csdn.net/article/details/*
// @match        https://www.jianshu.com/p/*
// @include      https://www.cnblogs.com/*
// @include      https://juejin.cn/post/*
// @include      https://my.oschina.net/*/blog/*
// @include      https://my.oschina.net/*/*/blog/*
// @include      https://www.oschina.net/question/*
// @include      https://segmentfault.com/a/*
// @run-at      document-idle
// @icon        https://cdn.jsdelivr.net/gh/dossweet/sweet-WebJS@master/image/sweet.jpg
// @require     https://cdn.staticfile.org/jquery/1.9.1/jquery.min.js
// @require     https://cdn.jsdelivr.net/npm/jQuery.print@1.5.1/jQuery.print.min.js
// @require     https://code.jquery.com/jquery-migrate-1.2.1.min.js
// @note        v10.13 优化知乎中公式重复出现问题逻辑
// @note        v10.12 修复知乎中公式重复出现的问题
// @note        v10.11 代码升级，采用更规范的写法 & 修复知乎公式打印失败的问题(较复杂) 1024程序员节快乐呀
// @note        v10.10 修复博客园长图片打印失败的问题
// @note        v10.9 修复掘金和思否图标添加失败的问题
// @note        v10.8 修复知乎平台公式图片加载失败问题
// @note        v10.7 修复由于知乎平台的代码优化导致的公式打印失败问题
// @note        v10.6 修复由于掘金改版导致的打印失效的问题&&修复知乎讨论页打印失败的问题&&恢复保留所有平台的作者信息
// @note        v10.5 修改脚本名称
// @note        v10.4 修复由于知乎改版带来的新bug以及question推荐页面强制跳转的bug
// @note        v10.3 删除许可证
// @note        v10.2 修复csdn页面打印不全的bug
// @note        v10.1 修复csdn个别页面失效问题
// @note        v10.0 整合了思否
// @note        v9.0 整合了开源中国
// @note        v8.0 整合了掘金
// @note        v7.0 整合了博客园
// @note        v6.0 整合了简书
// @note        v5.0 整合了csdn
// @note        v4.0 整合了知乎
// @note        v1.0 实现知乎网页打印功能
// ==/UserScript==
;(function () {
  "use strict"
  let page2pdfClick = false
  let listItemNumber = 0
  let buttonClickCount = 0
  let opeArray = []
  let hasAddStyle = false

  let pageConfigure = {
    parentDiv: "",
    firstChild: "",
    lastChild: "",
    index: 0,
    pageHref: "",
    ifNeedPageRedirect: false,
    currentPage: 0
  }
  let pageHref = window.location.href //获取网址
  if (
    pageHref.indexOf("www.zhihu.com/question/") != -1 &&
    pageHref.indexOf("/answer/") != -1
  ) {
    //表示是讨论回答,推荐回答页面
    pageConfigure.pageHref = pageHref
    pageConfigure.parentDiv = "QuestionButtonGroup"
    pageConfigure.firstChild = "FollowButton"
    $(document).ready(function () {
      let readMoreBtn = document.querySelectorAll(".ContentItem-expandButton")
      // 自动点击页面上所有回答的阅读全文
      for (let i = 0; i < readMoreBtn.length; i++) {
        readMoreBtn[i].click()
      }
    })

    let readAllAnswer = $(".ViewAll-QuestionMainAction")
    for (let i = 0; i < readAllAnswer.length; i++) {
      readAllAnswer[i].setAttribute("href", "javascript:void(0)")
      readAllAnswer[i].addEventListener("click", () => {
        toAllAnswerPage()
      })
    }
    pageConfigure.currentPage = 0 //表示是知乎的讨论页
  } else if (pageHref.indexOf("zhuanlan.zhihu.com/p") != -1) {
    //表示是文章页
    pageConfigure.pageHref = pageHref
    pageConfigure.parentDiv = "ColumnPageHeader-Button"
    pageConfigure.firstChild = "ColumnPageHeader-WriteButton"
    pageConfigure.currentPage = 0 //表示是知乎
  } else if (pageHref.indexOf("www.zhihu.com/question/") != -1) {
    //知乎讨论回答，包含所有回答
    pageConfigure.pageHref = pageHref
    pageConfigure.parentDiv = "QuestionButtonGroup"
    pageConfigure.firstChild = "FollowButton"
    //给所有讨论的父节点添加className,便于后续监听页面懒加载
    let listParentDiv = $(".List-item")[0].parentElement
    listParentDiv.className = "listParent"
    pageConfigure.currentPage = 0 //表示是知乎
  } else if (pageHref.indexOf("csdn") != -1) {
    //表示是csdn文章页
    pageConfigure.pageHref = pageHref
    pageConfigure.parentDiv = "onlyUser"
    pageConfigure.lastChild = "toolbar-btn-write"
    pageConfigure.firstChild = "toolbar-btn-vip"
    pageConfigure.currentPage = 1 //表示是csdn
  } else if (pageHref.indexOf("jianshu") != -1) {
    //表示是简书文章页
    pageConfigure.pageHref = pageHref
    pageConfigure.parentDiv = "_26qd_C"
    pageConfigure.currentPage = 2 //表示是简书
  } else if (pageHref.indexOf("cnblogs") != -1) {
    //表示是博客园
    pageConfigure.pageHref = pageHref
    pageConfigure.parentDiv = "navList"
    pageConfigure.currentPage = 3 //表示是博客园
  } else if (pageHref.indexOf("juejin") != -1) {
    //表示是掘金文章页
    pageConfigure.pageHref = pageHref
    pageConfigure.currentPage = 4 //表示是掘金
  } else if (pageHref.indexOf("oschina") != -1) {
    //表示是开源中国
    pageConfigure.pageHref = pageHref
    if (pageHref.indexOf("blog") != -1) {
      pageConfigure.parentDiv = "action-box"
    }
    pageConfigure.currentPage = 5 //表示是开源中国
  } else if (pageHref.indexOf("segmentfault") != -1) {
    //表示是思否
    pageConfigure.pageHref = pageHref
    pageConfigure.currentPage = 6 //表示是思否
  }

  if (pageConfigure.ifNeedPageRedirect == true) {
    window.location.replace(pageConfigure.pageHref)
  }

  function toAllAnswerPage() {
    let index = pageConfigure.pageHref.indexOf("answer")
    let pageHref = pageConfigure.pageHref.substring(0, index - 1)
    window.location.replace(pageHref)
  }

  // 关闭登录框
  function closeLogin() {
    if (pageConfigure.currentPage == 0) {
      let removeLoginModal = (e) => {
        if (
          e.target.innerHTML &&
          e.target.getElementsByClassName("Modal-wrapper").length > 0
        ) {
          if (
            e.target
              .getElementsByClassName("Modal-wrapper")[0]
              .querySelector(".signFlowModal")
          ) {
            let button = e.target.getElementsByClassName(
              "Button Modal-closeButton Button--plain"
            )[0]
            if (button) button.click()
          }
        }
      }
      document.addEventListener("DOMNodeInserted", removeLoginModal)
    }
  }

  closeLogin()

  let parentDiv = ""
  let firstChild = ""
  // 1代表csdn，4代表掘金，5代表开源中国，6代表思否
  // 在本脚本中，0-知乎，1-csdn，2-简书，3-博客园，4-掘金，5-开源中国，6-思否
  let div = ""
  let div1 = ""
  let div4 = ""
  let div5 = ""
  let div6 = ""

  switch (pageConfigure.currentPage) {
    case 0:
    case 1:
      if (pageConfigure.currentPage == 0) {
        firstChild = document.querySelector("." + pageConfigure.firstChild)
      }
      parentDiv = document.querySelector("." + pageConfigure.parentDiv)
      div = document.createElement("div")
      div.innerHTML =
        '<button type="button" class="printButton">\n' +
        '        <img id="printLogo" src="https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/printLogo.png">\n' +
        "        <p>文章转PDF</p>\n" +
        "    </button>"
      div.className = "pagePrint"
      break
    case 2:
      parentDiv = document.querySelector("." + pageConfigure.parentDiv)
      div = document.createElement("button")
      div.innerHTML = "文章转PDF"
      div.className = "_1OyPqC _3Mi9q9 _1YbC5u printButton"
      div.type = "button"
      break
    case 3:
      parentDiv = document.querySelector("#" + pageConfigure.parentDiv)
      if (!parentDiv) {
        //博客园特殊的一个网页模板
        parentDiv = document.getElementById("leftmenu").children[1]
      }
      div = document.createElement("li")
      div.innerHTML =
        '<a id="printButton" class="menu" href="javascript:void(0);">\n' +
        "        文章转PDF" +
        "    </a>"
      div.id = "pagePrint"
      break
    case 4:
      div = document.createElement("div")
      div.innerHTML =
        '        <div class="pagePrint panel-btn">\n' +
        '        <div class="tooltip">\n' +
        '        <img id="printLogo" src="https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/printLogo-jj.png">\n' +
        "        </div>\n" +
        "        </div>\n"
      div.className = "printButton"
      div4 = document.createElement("div")
      div4.innerHTML =
        '<div class="tooltip-one"></div>\n' +
        '    <div class="tooltip-two">文章转PDF</div>'
      div4.className = "tooltips"
      break
    case 5:
      if (pageConfigure.parentDiv.length > 0) {
        parentDiv = document.querySelectorAll("." + pageConfigure.parentDiv)[1]
        div = document.createElement("div")
        div.innerHTML =
          '        <div class="action-item__button">\n' +
          '        <img id="printLogo" src="https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/printLogo04.png">\n' +
          "        </div>\n" +
          '        <div class="action-item__text">\n' +
          "        <p>转PDF</p>" +
          "        </div>\n"
        div.className = "action-item printButton"
      } else {
        div1 = document.createElement("div")
        div1.innerHTML =
          '        <img id="printLogo" src="https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/printLogo04.png">\n'
        div1.className = "printButton"
        div5 = document.createElement("div")
        div5.innerHTML =
          '<div class="tooltip-one"></div>\n' +
          '    <div class="tooltip-two">文章转PDF</div>'
        div5.className = "tooltips"
      }
      break
    case 6:
      div = document.createElement("div")
      div.innerHTML =
        '        <div class="pagePrint panel-btn">\n' +
        "        <div>\n" +
        '        <img id="printLogo" src="https://cdn.jsdelivr.net/gh/doublesweet01/BS_script@master/image/printLogo05.png">\n' +
        "        </div>\n" +
        "        </div>\n"
      div.className = "printButton"
      div6 = document.createElement("div")
      div6.innerHTML =
        '<div class="tooltip-one"></div>\n' +
        '    <div class="tooltip-two">文章转PDF</div>'
      div6.className = "tooltips"
      break
    default:
      break
  }

  let cssStyle = ""
  let object = ""
  let objectIcon = ""
  let pos = ""
  let btnTop = ""
  let tipTop = ""
  let btnWidth = ""
  let btnLeft = ""
  let tipLeft = ""
  let scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  let scrollLeft =
    document.documentElement.scrollLeft || document.body.scrollLeft

  switch (pageConfigure.currentPage) {
    case 0:
      parentDiv.insertBefore(div, firstChild)
      cssStyle =
        ".printButton {\n" +
        "        background-color: #056de8;\n" +
        "        color: white;\n" +
        "        padding: 0 12px;\n" +
        "        border-radius: 3px;\n" +
        "        margin-right: 5px;\n" +
        "        font-size: 14px;\n" +
        "        line-height: 34.5px;\n" +
        "        border: none;\n" +
        "        text-align: center;\n" +
        "        display: inline-flex;\n" +
        "    }\n" +
        "    #printLogo{\n" +
        "        width: 24px;\n" +
        "        height: 24px;\n" +
        "        margin-top: 5.25px;\n" +
        "    }\n" +
        "    .QuestionButtonGroup{\n" +
        "        display: -webkit-inline-box;\n" +
        "    }"
      break
    case 1:
      parentDiv.appendChild(div)
      cssStyle =
        ".printButton {\n" +
        "        background-color: #ff4d4d;\n" +
        "        color: white;\n" +
        "        border-radius: 3px;\n" +
        "        padding-right: 5px !important;\n" +
        "        margin-top: 8px !important;\n" +
        "        margin-left: 5px !important;\n" +
        "        font-size: 14px;\n" +
        "        line-height: 32px;\n" +
        "        border: none;\n" +
        "        text-align: center;\n" +
        "        display: inline-flex;\n" +
        "    }\n" +
        "    #printLogo{\n" +
        "        width: 24px;\n" +
        "        height: 24px;\n" +
        "        margin-top: 5.25px;\n" +
        "    }\n" +
        "    .pagePrint{\n" +
        "        display: -webkit-inline-box;\n" +
        "    }"
      break
    case 2:
      parentDiv.appendChild(div)
      cssStyle = ""
      break
    case 3:
      parentDiv.appendChild(div)
      cssStyle =
        ".printButton {\n" +
        "        background-color: #ff4d4d;\n" +
        "        color: white;\n" +
        "        border-radius: 3px;\n" +
        "        padding-right: 5px !important;\n" +
        "        margin-top: 8px !important;\n" +
        "        margin-left: 5px !important;\n" +
        "        font-size: 14px;\n" +
        "        line-height: 32px;\n" +
        "        border: none;\n" +
        "        text-align: center;\n" +
        "        display: inline-flex;\n" +
        "    }\n" +
        "    #printLogo{\n" +
        "        width: 24px;\n" +
        "        height: 24px;\n" +
        "        margin-top: 5.25px;\n" +
        "    }\n" +
        "    .pagePrint{\n" +
        "        display: -webkit-inline-box;\n" +
        "    }"
      break
    case 4:
      document.body.appendChild(div)
      document.body.appendChild(div4)
      object = document.getElementsByClassName("panel-btn")[0]
      if (object) {
        pos = object.getBoundingClientRect() //参考坐标
        btnLeft = pos.left
        btnTop = pos.top + pos.height * 9
        tipTop = btnTop + pos.height
        tipLeft = btnLeft - 5
      } else {
        //当前浏览器不支持该方法
        let actualLeft = getElementLeft(object)
        let actualTop = getElementTop(object)
        btnLeft = actualLeft - scrollLeft
        btnTop = actualTop - scrollTop + object.offsetWidth * 1.25
        tipTop = btnTop + object.offsetHeight
        tipLeft = btnLeft - 5
      }

      cssStyle =
        ".pagePrint{\n" +
        "        background-color: white;\n" +
        "        border-radius: 50%;\n" +
        "        text-align: center;\n" +
        "        height: 4rem;\n" +
        "        width: 4rem;\n" +
        "        position: fixed;\n" +
        "        top: " +
        btnTop +
        "px;\n" +
        "        left: " +
        btnLeft +
        "px;\n" +
        "        z-index: 1000;\n" +
        "    }\n" +
        "    #printLogo{\n" +
        "        width:2rem;\n" +
        "        height:2rem;\n" +
        "        margin-top:1rem;\n" +
        "    }\n" +
        "    .tooltips{\n" +
        "        display: none;\n" +
        "        align-items: center;\n" +
        "        position: fixed;\n" +
        "        top: " +
        tipTop +
        "px;\n" +
        "        left: " +
        tipLeft +
        "px;\n" +
        "    }\n" +
        "    .tooltip-one {\n" +
        "        width: 0;\n" +
        "        height: 0;\n" +
        "        border-left: 6px solid transparent;\n" +
        "        border-right: 6px solid transparent;\n" +
        "        border-bottom: 12px solid black;\n" +
        "        margin-left: 20px;\n" +
        "    }\n" +
        "    .tooltip-two{\n" +
        "        background-color: black;\n" +
        "        color: white;\n" +
        "        font-size: 12px;\n" +
        "        width: 75px;\n" +
        "        height: 25px;\n" +
        "        text-align: center;\n" +
        "        border-radius: 5px;\n" +
        "        padding-top: 6px;\n" +
        "        margin-top: -5px;\n" +
        "    }"
      break
    case 5:
      if (pageConfigure.pageHref.indexOf("question") != -1) {
        document.body.appendChild(div1)
        document.body.appendChild(div5)
        object = document.getElementsByClassName("codeBlock")[0]
        objectIcon = document.getElementsByClassName("codeIcon")[0]
        if (object) {
          pos = object.getBoundingClientRect() //参考坐标
          btnLeft = pos.left
          btnTop = pos.top - pos.height - 3
          btnWidth = pos.width * 0.935
          tipTop = btnTop
          tipLeft = btnLeft - btnWidth
        } else {
          //当前浏览器不支持该方法
          let actualLeft = getElementLeft(object)
          let actualTop = getElementTop(object)
          btnLeft = actualLeft - scrollLeft
          btnTop = actualTop - scrollTop + object.offsetWidth * 1.25
          btnWidth = object.offsetWidth * 0.93
          tipTop = btnTop
          tipLeft = btnLeft - btnWidth
        }
        let margin = (btnWidth - objectIcon.offsetWidth) / 2
        cssStyle =
          "    .printButton{\n" +
          "        position:fixed;\n" +
          "        top:" +
          btnTop +
          "px;\n" +
          "        left:" +
          btnLeft +
          "px;\n" +
          "        width:" +
          btnWidth +
          "px;\n" +
          "        height:" +
          btnWidth +
          "px;\n" +
          "        z-index:2;\n" +
          "        border: 1px solid #ddd;\n" +
          "        background: #f5f5f5;\n" +
          "        box-sizing: content-box;\n" +
          "    }\n" +
          "    #printLogo{\n" +
          "        width:" +
          objectIcon.offsetWidth +
          "px;\n" +
          "        height:" +
          objectIcon.offsetWidth +
          "px;\n" +
          "        margin:" +
          margin +
          "px;\n" +
          "    }\n" +
          "    .tooltips{\n" +
          "        display: none;\n" +
          "        align-items: center;\n" +
          "        position: fixed;\n" +
          "        z-index: 3;\n" +
          "        top: " +
          tipTop +
          "px;\n" +
          "        left: " +
          tipLeft +
          "px;\n" +
          "    }\n" +
          "    .tooltip-one {\n" +
          "        width: 0;\n" +
          "        height: 0;\n" +
          "        border-top: 5px solid transparent;\n" +
          "        border-left: 10px solid black;\n" +
          "        border-bottom: 5px solid transparent;\n" +
          "        margin-left: 25px;\n" +
          "        margin-top: 5px;\n" +
          "    }\n" +
          "    .tooltip-two{\n" +
          "        background-color: black;\n" +
          "        color: white;\n" +
          "        font-size: 13px;\n" +
          "        width: 30px;\n" +
          "        height: 90px;\n" +
          "        text-align: center;\n" +
          "        border-radius: 5px;\n" +
          "        padding: 6px;\n" +
          "        margin-top: -15px;\n" +
          "    }"
      } else {
        parentDiv.appendChild(div)
        cssStyle =
          "    #printLogo{\n" +
          "        width:1.1em;\n" +
          "        height:1.1em;\n" +
          "    }\n"
      }
      break
    case 6:
      document.body.appendChild(div)
      document.body.appendChild(div6)
      object = document.getElementsByClassName("dropdown")[2]
      if (object) {
        pos = object.getBoundingClientRect() //参考坐标
        btnLeft = pos.left
        btnTop = pos.top + pos.height * 1
        tipTop = btnTop + pos.height
        tipLeft = btnLeft - 5
      } else {
        object = document.getElementsByClassName("dropdown")[1]
        //当前浏览器不支持该方法
        let actualLeft = getElementLeft(object)
        let actualTop = getElementTop(object)
        btnLeft = actualLeft - scrollLeft
        btnTop = actualTop - scrollTop + object.offsetWidth * 1.25
        tipTop = btnTop + object.offsetHeight
        tipLeft = btnLeft - 5
      }

      cssStyle =
        ".pagePrint{\n" +
        "        background-color: white;\n" +
        "        border-radius: 50%;\n" +
        "        text-align: center;\n" +
        "        height: 2em;\n" +
        "        width: 2em;\n" +
        "        position: fixed;\n" +
        "        top: " +
        btnTop +
        "px;\n" +
        "        left: " +
        btnLeft +
        "px;\n" +
        "        z-index: 1000;\n" +
        "    }\n" +
        "#printLogo{\n" +
        "        width:1.2em;\n" +
        "        height:1.2em;\n" +
        "        margin-top:0.4em;\n" +
        "    }\n" +
        "    .tooltips{\n" +
        "        display: none;\n" +
        "        align-items: center;\n" +
        "        position: fixed;\n" +
        "        top: " +
        tipTop +
        "px;\n" +
        "        left: " +
        tipLeft +
        "px;\n" +
        "    }\n" +
        "    .tooltip-one {\n" +
        "        width: 0;\n" +
        "        height: 0;\n" +
        "        border-left: 6px solid transparent;\n" +
        "        border-right: 6px solid transparent;\n" +
        "        border-bottom: 12px solid black;\n" +
        "        margin-left: 20px;\n" +
        "    }\n" +
        "    .tooltip-two{\n" +
        "        background-color: black;\n" +
        "        color: white;\n" +
        "        font-size: 12px;\n" +
        "        width: 75px;\n" +
        "        height: 25px;\n" +
        "        text-align: center;\n" +
        "        border-radius: 5px;\n" +
        "        padding-top: 6px;\n" +
        "        margin-top: -5px;\n" +
        "    }"
      break
  }

  let cssNode = document.createElement("style")
  cssNode.id = "THT_Style"
  cssNode.setAttribute("type", "text/css")
  cssNode.innerHTML = cssStyle
  document.body.appendChild(cssNode)

  switch (pageConfigure.currentPage) {
    case 3:
      $("#printButton").click(function () {
        Promise.all([updateStyle()]).then(transformPDF)
      })
      setTimeout(() => {
        removeImgLazyLoading("#mainContent", 0)
      }, 1000)
      break
    default:
      $(".printButton").click(function () {
        if (pageConfigure.currentPage == 0) {
          if (pageConfigure.pageHref.indexOf("/p") != -1) {
            let isFirefoxEnv = getBrowserUserAgent()
            switch (isFirefoxEnv) {
              case true:
                //先隐藏部分元素，然后打印。在打印完毕后再展示
                Promise.all([
                  removeImgLazyLoading(".Post-Main", 0),
                  updateStyle()
                ]).then(transformPDF)
                break
              case false:
                let el = document.getElementsByTagName("article")[0]
                specialPrint(el, "article")
                break
            }
          } else {
            //表示是知乎讨论，知乎的讨论是采用懒加载的形式，每次增加五个
            if (page2pdfClick == false) {
              //第一次点击时所有讨论都加上文章转PDF的文字
              if (buttonClickCount > 0) {
                removeStyle()
                buttonClickCount--
              }
              page2pdfClick = true
              addPrintText()
              $(".printButton").text("取消转换")
            } else {
              let cssStyle =
                "    .pageButtons{\n" + "        display:none;\n" + "    }"
              addStyle(cssStyle)
              page2pdfClick = false
              if (pageConfigure.pageHref.indexOf("/question") != -1) {
                $(".printButton").text("文章转PDF")
              }
              buttonClickCount++
            }
          }
        } else if (
          pageConfigure.currentPage == 1 ||
          pageConfigure.currentPage == 4 ||
          pageConfigure.currentPage == 5 ||
          pageConfigure.currentPage == 6
        ) {
          Promise.all([updateStyle()]).then(transformPDF)
        } else if (pageConfigure.currentPage == 2) {
          createParentEle(".ouvJEz", 0)
          Promise.all([updateStyle()]).then(transformPDF)
        }
      })
      break
  }

  function updateStyle() {
    switch (pageConfigure.currentPage) {
      case 0:
        let parentDiv = $(".is-bottom")[0].parentElement
        parentDiv.className = "articleComment"
        addStyle(".Post-Author{width:100%;}")
        addStyle(
          ".FollowButton,.Reward,.Post-topicsAndReviewer,.RichContent-action,.articleComment,.RichContent-actions,.ContentItem-actions,.LabelContainer-wrapper,.css-d5ulu0-CatalogContainer{display:none !important;}"
        )
        break
      case 1:
        addStyle(
          ".article-type-img,.blog-tags-box,.slide-content-box,.operating,#blog_detail_zk_collection,.article-heard-img,.read-count,#csdn-shop-window-top,#blogColumnPayAdvert{display:none !important;}\n"
        )
        addStyle(".article-header-box,.baidu_pl{width:90% !important;}")
        break
      case 2:
        addStyle(
          "._3tCVn5,._1kCBjS,._19DgIp,._13lIbp,.d0hShY{display:none !important;}"
        )
        addStyle(".rEsl9f{margin-bottom:5px;}")
        break
      case 3:
        addStyle(
          ".postDesc,#blog_post_info_block,#comment_form{display:none !important;}"
        )
        break
      case 4:
        addStyle(
          ".tag-list-box,.extension-banner,.follow-button{display:none !important;}"
        )
        addStyle(".author-info-block{margin-bottom:0rem !important;}")
        break
      case 5:
        if (pageConfigure.pageHref.indexOf("blog") != -1) {
          addStyle(
            ".article-box__group,.tags-box,.copyright-box,.action-box,.recommend-box,.comment-box{display:none !important;}"
          )
          addStyle(".article-box__meta,.item-list{display:inline-flex;}")
          addStyle(".item{margin-right:1rem;}")
        } else if (pageConfigure.pageHref.indexOf("question") != -1) {
          addStyle(
            ".tags,.poll-wrap,.additional-remarks,.segment{display:none !important;}"
          )
        }
        break
      case 6:
        addStyle(
          ".functional-area-bottom,.flex-sm-row,.pt-4 align-items-center row{display:none !important;}"
        )
        break
      default:
        break
    }
  }

  function removeImgLazyLoading(parentDom, index) {
    let parentDiv = document.querySelectorAll(parentDom)[index]
    let img = parentDiv.getElementsByTagName("img")
    for (let i = 0; i < img.length; i++) {
      img[i].removeAttribute("loading")
      img[i].removeAttribute("data-lazy-status")
    }
  }

  // 文章转pdf
  function transformPDF() {
    switch (pageConfigure.currentPage) {
      case 0:
        $(".Post-Main").print({
          debug: false,
          importCSS: true,
          printContainer: true,
          operaSupport: true
        })
        break
      case 1:
        $(".blog-content-box").print({
          debug: false,
          importCSS: true,
          printContainer: true,
          operaSupport: true
        })
        break
      case 2:
        $("#jsPrint").print({
          debug: false,
          importCSS: true,
          printContainer: true,
          operaSupport: true
        })
        break
      case 3:
        $("#post_detail").print({
          debug: false,
          importCSS: true,
          printContainer: true,
          operaSupport: true
        })
        break
      case 4:
        $(".article").print({
          debug: false,
          importCSS: true,
          printContainer: true,
          operaSupport: true
        })
        break
      case 5:
        if (pageConfigure.pageHref.indexOf("blog") != -1) {
          $(".article-box").print({
            debug: false,
            importCSS: true,
            printContainer: true,
            operaSupport: true
          })
        } else if (pageConfigure.pageHref.indexOf("question") != -1) {
          $(".article-detail").print({
            debug: false,
            importCSS: true,
            printContainer: true,
            operaSupport: true
          })
        }
        break
      case 6:
        $(".card-body").print({
          debug: false,
          importCSS: true,
          printContainer: true,
          operaSupport: true
        })
        break
    }

    if (
      pageConfigure.currentPage == 0 ||
      pageConfigure.currentPage == 1 ||
      pageConfigure.currentPage == 2 ||
      pageConfigure.currentPage == 4
    ) {
      //csdn特殊处理，需要两次removeStyle
      removeStyle()
      removeStyle()
    } else if (
      pageConfigure.currentPage == 5 &&
      pageConfigure.pageHref.indexOf("blog") != -1
    ) {
      removeStyle()
      removeStyle()
      removeStyle()
    } else if (hasAddStyle == true) {
      removeStyle()
    }
    safeWaitFunctionTT()
  }

  // 新增样式，去除局部打印区域中不要的元素
  function addStyle(style) {
    let newStyle = document.getElementById("THT_Style")
    newStyle.appendChild(document.createTextNode(style))
    hasAddStyle = true
  }

  // 恢复样式
  function removeStyle() {
    let newStyle = document.getElementById("THT_Style")
    newStyle.removeChild(newStyle.lastChild)
    hasAddStyle = false
  }

  //为现有节点添加新的父元素，便于操作当前节点
  function createParentEle(currentNode, newParentIndex) {
    let printDiv = $(currentNode)[newParentIndex]
    let parentNew = document.createElement("div")
    let parentID = ""
    if (pageConfigure.currentPage == 0) {
      parentID = "newParentIndex" + newParentIndex
    } else if (pageConfigure.currentPage == 2) {
      parentID = "jsPrint"
    }
    parentNew.id = parentID
    printDiv.parentNode.replaceChild(parentNew, printDiv)
    parentNew.appendChild(printDiv)
  }

  //需要使用offsetLeft，offsetTop方法。需要明确的是这两个方法都是当前元素相对于其父元素的位置，所以要得到相对于页面的距离需要循环计算。
  function getElementLeft(ele) {
    let actualLeft = ele.offsetLeft
    let current = ele.offsetParent
    while (current !== null) {
      actualLeft += current.offsetLeft
      current = current.offsetParent
    }
    return actualLeft
  }

  function getElementTop(ele) {
    let actualTop = ele.offsetTop
    let current = ele.offsetParent
    while (current !== null) {
      actualTop += current.offsetTop
      current = current.offsetParent
    }
    return actualTop
  }

  function hoverEvent() {
    if (pageConfigure.currentPage == 4 || pageConfigure.currentPage == 6) {
      $(".printButton").hover(
        function () {
          $(".tooltips").show(100)
        },
        function () {
          $(".tooltips").hide(100)
        }
      )
    } else if (pageConfigure.pageHref.indexOf("question") != -1) {
      $(".printButton").hover(
        function () {
          $(".tooltips").show(100)
        },
        function () {
          $(".tooltips").hide(100)
        }
      )
    }
  }

  function eventListener() {
    //归纳所有的事件监听到一个函数
    switch (pageConfigure.currentPage) {
      case 0:
        document.addEventListener("DOMNodeInserted", function () {
          //添加监听事件，检测是否发生懒加载
          let listItemLength =
            document.getElementsByClassName("List-item").length
          if (
            opeArray.length == 0 ||
            opeArray.includes(listItemLength) == false
          ) {
            opeArray.push(listItemLength)
            if (page2pdfClick == true) {
              addPrintText()
            }
          }
        })
        break
    }
  }

  function addPrintText() {
    //给每个讨论都加上打印的按钮，然后再打印
    let parentDiv = document.querySelectorAll(".AnswerItem-authorInfo")
    let temp = listItemNumber
    for (let newIndex = temp; newIndex < parentDiv.length; newIndex++) {
      let div = document.createElement("div")
      let divId = "printButton" + newIndex
      let behindDom = document
        .getElementsByClassName("AnswerItem-authorInfo")
        [newIndex].getElementsByTagName("button")[0]
      div.innerHTML =
        '<p id="' +
        divId +
        '"color:#4e6ef2;font-size: 14px;">\n' +
        "        转\n" +
        "    </p>"
      div.className = "pageButtons"
      div.setAttribute(
        "style",
        "width: 34px; line-height:34px;text-align: center; border-radius: 50%; border: 1px solid #e6f0fd; margin-left: 10px; margin-right: 10px;cursor:pointer;"
      )
      parentDiv[newIndex].insertBefore(div, behindDom)
      let className = "printButton" + newIndex

      $(document).on("click", "#" + className, function () {
        let newParentId = "newParentIndex" + newIndex
        createParentEle(".AnswerItem", newIndex)
        let cssStyle2 =
          "\n" +
          "#" +
          newParentId +
          ",.ModalExp-content,.LabelContainer-wrapper,.css-1k5dpte,.ContentItem-actions,.Reward{display:none;}" +
          "\n"
        addStyle(cssStyle2)
        // let buttonIndex = document.getElementById(className1).parentElement.parentElement.parentElement.parentElement.getAttribute('data-za-index');
        let buttonIndex = className.substring(11)
        transformAnswerPDF(buttonIndex)
      })
    }
    listItemNumber = parentDiv.length
  }

  // 文章转pdf--讨论--知乎专用
  function transformAnswerPDF(buttonIndex) {
    let printDiv = $(".AnswerItem")[buttonIndex]
    let parentNew = document.createElement("div")
    let parentID = "printDiv" + buttonIndex
    parentNew.id = parentID
    printDiv.parentNode.replaceChild(parentNew, printDiv)
    parentNew.appendChild(printDiv)
    removeImgLazyLoading(".AnswerItem", buttonIndex)
    let isFirefoxEnv = getBrowserUserAgent()
    switch (isFirefoxEnv) {
      case true:
        $("#" + parentID).print({
          debug: false,
          importCSS: true,
          printContainer: true,
          operaSupport: true
        })
        break
      case false:
        // 等待DOM节点挂载成功后，再执行打印操作
        Promise.resolve().then(() => {
          let el = document.getElementById(parentID)
          specialPrint(el, "answer")
        })
        break
    }
    removeStyle()
  }

  // 特殊打印，针对知乎文章里公式打印失败的问题
  function specialPrint(el, pageType) {
    // 创建iframe
    let iframe = document.createElement("iframe")
    // 设置iframe样式
    iframe.setAttribute("id", "print-box")
    iframe.setAttribute(
      "style",
      "position:absolute;width:800px;height:500px;left:-500px;top:-500px;"
    )
    document.body.appendChild(iframe)
    // 获取iframe内的html
    let doc = iframe.contentWindow.document
    // load iframe page resource
    loadIframePageHead(doc)
    // 将需要打印的DOM插入iframe
    let printMain = document.createElement("div")
    printMain.setAttribute("id", "print-box")
    printMain.innerHTML = el.innerHTML
    doc.body.appendChild(printMain)
    // remove MathJax
    removeMathJax(doc, "span[id^='MathJax-']")
    // load iframe page resource
    loadIframePageScript(doc)
    let allImg = doc.getElementsByTagName("img")
    // add iframe style
    addIframeStyle(doc, pageType)
    loadImgWithoutLazyLoading(doc, allImg)
    allImg[allImg.length - 1].onload = function () {
      setTimeout(() => {
        // remove same dom
        removeSameDom(doc, "span[id^='MathJax-']")
        // 关闭iframe
        doc.close()
        // 使iframe失去焦点
        iframe.contentWindow.focus()
        // 调用iframe的打印方法
        iframe.contentWindow.print()
        // 移除iframe
        document.body.removeChild(iframe)
      }, 3000)
    }
  }

  function loadIframePageHead(doc) {
    // 当前页面样式
    let headDom = document.getElementsByTagName("head")

    // 设置iframe内的header，添加样式文件
    for (let i = 0; i < headDom.length; i++) {
      doc.getElementsByTagName("head")[i].innerHTML = headDom[i].innerHTML
    }

    let mathJax_Message = document.getElementById("MathJax_Message")
    if (mathJax_Message) {
      mathJax_Message.setAttribute("style", "display:none;")
    }
  }

  function loadIframePageScript(doc) {
    let scriptDom = document.getElementsByTagName("script")

    // 添加内联script
    let js_clientConfig_script = document.getElementById("js-clientConfig")
    let js_initialData_script = document.getElementById("js-initialData")
    if (js_clientConfig_script) {
      js_clientConfig_script.setAttribute("nonce", "")
      doc.body.append(js_clientConfig_script)
    }
    if (js_initialData_script) {
      js_initialData_script.setAttribute("nonce", "")
      doc.body.append(js_initialData_script)
    }

    // 在iframe中插入script
    for (let i = 0; i < scriptDom.length; i++) {
      if (!scriptDom[i].src && !scriptDom[i].type) continue
      let mathJax = document.createElement("script")
      if (scriptDom[i].id) {
        mathJax.id = scriptDom[i].id
      }

      if (scriptDom[i].src) {
        mathJax.setAttribute("crossorigin", "")
        mathJax.src = scriptDom[i].src
      }

      if (scriptDom[i].type) {
        mathJax.type = scriptDom[i].type
      }
      doc.body.appendChild(mathJax)
    }
  }

  function addIframeStyle(doc, pageType) {
    let domStyle = document.createElement("style")
    domStyle.type = "text/css"
    switch (pageType) {
      case "answer":
        domStyle.innerHTML =
          ".css-1vse7nz{display:flex;}\n .ContentItem-actions,.RichText-ADLinkCardContainer,.RichText-MCNLinkCardContainer,.Reward{display: none;}"
        break
      case "article":
        domStyle.innerHTML =
          "h1{font-size: 25px; font-weight: bold;}\n .Post-Author{width:100%;}\n .FollowButton,.Reward,.Post-topicsAndReviewer,.RichContent-action,.articleComment,.RichContent-actions,.ContentItem-actions,.LabelContainer-wrapper,.css-d5ulu0-CatalogContainer{display:none !important;}"
        break
    }
    doc.getElementsByTagName("head")[0].appendChild(domStyle)
  }

  function loadImgWithoutLazyLoading(iframeDocument, allImg) {
    for (let i = 0; i < allImg.length; i++) {
      allImg[i].removeAttribute("loading")
      allImg[i].removeAttribute("data-lazy-status")
      let dataSrc = allImg[i].getAttribute("data-actualsrc")
      if (dataSrc) {
        allImg[i].src = dataSrc
      }
    }
  }

  function removeMathJax(document, dom) {
    let mathJaxs = document.querySelectorAll(dom)
    for (let i = 0; i < mathJaxs.length; i++) {
      mathJaxs[i].parentNode.removeChild(mathJaxs[i])
    }
  }

  function removeSameDom(document, dom) {
    let mathJaxs = document.querySelectorAll(dom)
    for (let i = 1; i < mathJaxs.length; i++) {
      if (mathJaxs[i].id === mathJaxs[i - 1].id) {
        mathJaxs[i].parentNode.removeChild(mathJaxs[i])
      }
    }
  }

  //修改博客园导航栏的宽度
  function updateNavWidth() {
    if (pageConfigure.currentPage == 3) {
      let a = document.getElementById("pagePrint")
      let width = getComputedStyle(a).width.replace("px", "")
      let fontSize = getComputedStyle(a).fontSize.replace("px", "")
      if (fontSize >= 14 && fontSize * 6 > width) {
        let newCss =
          "\n#pagePrint{width:" + fontSize * 7.5 + "px !important;}\n"
        addStyle(newCss)
      }
    }
  }

  // 判断浏览器的环境
  function getBrowserUserAgent() {
    let userAgent = navigator.userAgent
    // 代表是火狐
    if (/firefox/i.test(userAgent)) {
      return true
    }
    return false
  }

  //写一个周期函数，检测文章转pdf的按钮有没有加上
  function safeWaitFunctionTT() {
    setInterval(function () {
      let a = document.getElementsByClassName("printButton")
      if (a.length == 0) {
        switch (pageConfigure.currentPage) {
          case 0:
            parentDiv.insertBefore(div, firstChild)
            break
          case 1:
          case 2:
          case 3:
            parentDiv.appendChild(div)
            break
          case 4:
            document.body.appendChild(div4)
            break
          case 5:
            if (pageConfigure.pageHref.indexOf("blog") != -1) {
              document.body.appendChild(div)
            } else if (pageConfigure.pageHref.indexOf("question") != -1) {
              document.body.appendChild(div1)
              document.body.appendChild(div5)
            }
            break
          case 6:
            document.body.appendChild(div6)
            break
        }
        clearInterval()
      }
    }, 500)
  }

  eventListener()
  updateNavWidth()
  safeWaitFunctionTT()
  hoverEvent()
})()
