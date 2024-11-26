## codebox-一键复制代码/下载文章

## 代码

https://github.com/027xiguapi/code-box

## 介绍

本浏览器插件可以用于CSDN/知乎/脚本之家/博客园/博客园/51CTO博客/php中文网/掘金/微信等网站,一键下载文章成html或markdown文件;实现无需登录一键复制代码;支持选中代码;或者代码右上角按钮的一键复制;解除关注博主即可阅读全文提示;去除登录弹窗;去除跳转APP弹窗.

## 安装

### 安装方式一：插件商店(推荐)

直接下载安装：
1. 进入应用商店
   - [Chrome网上应用商店](https://chrome.google.com/webstore/category/extensions?hl=zh-CN)
   - [Edge网上应用商店](https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home?hl=zh-CN)
   - [360浏览器应用商店](https://ext.se.360.cn/#/extension-detail?id=acnnhjllgegbndgknlliobjlekgilbdf)
   - [Firefox网上应用商店](https://addons.mozilla.org/zh-CN/firefox/)
   
2. 搜索：`codebox`

![0f8137ce6861f2a387095aef446fe60](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/webstore/0f8137ce6861f2a387095aef446fe60.png)
![img](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/webstore/img.png)
![1724640161752](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/webstore/1724640161752.jpg)

### 安装方式二：直接安装

1. 安装地址： 
   - [前往 Chrome 扩展商店](https://chrome.google.com/webstore/detail/acnnhjllgegbndgknlliobjlekgilbdf)
   - [前往 360浏览器 扩展商店](https://ext.se.360.cn/#/extension-detail?id=acnnhjllgegbndgknlliobjlekgilbdf)
   - [前往 火狐 扩展商店](https://addons.mozilla.org/zh-CN/firefox/addon/code-box/)
   - [前往 Edge 扩展商店](https://microsoftedge.microsoft.com/addons/detail/code-box/cfpdbfmncaampihkmejogihjkenkonbn)

### 安装方式三：公众号下载
1. 关注公众号

![img](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/wx/qrcode_wx.jpg)

2. 点击 `软件下载`

![img](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/wx/download.jpg)

### 安装方式三：源码安装

1. clone源码
   ```sh
   git clone https://github.com/027xiguapi/code-box.git
   ```
2. 安装和打包
   ```sh
   pnpm install
   pnpm dev
   pnpm build
   ```
3. 谷歌浏览器，从右上角菜单->更多工具->扩展程序可以进入插件管理页面，也可以直接在地址栏输入 chrome://extensions 访问
4. 勾选开发者模式，即可以文件夹的形式直接加载插件




## 功能

![img-1](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/config.jpg)

### 自定义

- 插入自定义样式(css代码)
- 下载所有图片
- 自定义选择下载html
- 自定义选择下载markdown
- 自定义选择下载pdf


### 微信
- 插入自定义样式(css代码)
- 一键下载文章html
- 一键下载文章markdown
- 一键下载文章pdf

### 掘金
- 插入自定义样式(css代码)
- 一键下载文章html
- 一键下载文章markdown
- 一键下载文章pdf

### CSDN

- 一键下载文章html、pdf或markdown文件
- 打开任意一个`CSDN`博客即可开始复制代码
- 未登录`CSDN`状态下，支持选中代码
- 未登录`CSDN`状态下，代码右上角按钮一键复制
- 未登录`CSDN`状态下，不会再出现强制登录弹窗
- 未关注博主状态下，不再提示关注博主即可阅读全文，且完整展示文章
- 自动展开代码块
- 移动端屏蔽跳转APP
- 非vip用户，不再提示vip观看，且完整展示文章
- 插入自定义样式(css代码)

### 知乎

- 一键下载文章html、pdf或markdown文件
- 一键复制代码
- 未登录`知乎`状态下，不再提示展开阅读全文，且完整展示文章
- 未登录`知乎`状态下，不会再出现强制登录弹窗
- 插入自定义样式(css代码)

### 百度

- 一键下载对话框html、pdf或markdown文件
-  关闭AI对话框

### 简书

- 一键下载文章html、pdf或markdown文件
- 移动端，一键复制代码
- 不再提示展开阅读全文，且完整展示文章
- 不会再出现强制登录弹窗
- 插入自定义样式(css代码)

### 脚本之家

- 一键下载文章html、pdf或markdown文件
- 打开任意一个`脚本之家`博客即可开始复制代码
- 未登录`脚本之家`状态下，支持选中代码
- 屏蔽广告
- 移动端未登录`脚本之家`状态下，代码右上角按钮一键复制
- 插入自定义样式(css代码)

### 博客园

- 一键下载文章html、pdf或markdown文件
-  一键复制代码
- 插入自定义样式(css代码)

### 51CTO博客

- 一键下载文章html、pdf或markdown文件
- 未登录`51CTO博客`状态下，支持选中代码
- 未登录`51CTO博客`状态下，代码右上角按钮一键复制
- 未登录`51CTO博客`状态下，不会再出现强制登录弹窗
- 移动端未登录`51CTO博客`状态下，代码右上角按钮一键复制
- 插入自定义样式(css代码)

### php中文网

- 一键下载文章html、pdf或markdown文件
- 未登录`php中文网`状态下，支持选中代码
- 未登录`php中文网`状态下，代码右上角按钮一键复制
- 未登录`php中文网`状态下，不会再出现强制登录弹窗
- 未登录`php中文网`状态下，移动端代码右上角按钮一键复制
- 插入自定义样式(css代码)

![img](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/8.png)
![img](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/1.jpg)
![img](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/2.png)
![img](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/3.jpg)
![img](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/4.jpg)
![img](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/5.jpg)
![img](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/6.jpg)
![img](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/7.jpg)
![img](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/1723096379951.jpg)


## 参考

1. [copy-csdn](https://github.com/openHacking/copy-csdn)
2. [plasmo](https://github.com/PlasmoHQ/plasmo)
3. [Chrome 应用商店一站式支持](https://support.google.com/chrome_webstore/contact/one_stop_support)
4. [开箱即用的web打印和下载](https://juejin.cn/post/7412672713376497727)
5. [导出微信公众号文章为PDF](https://greasyfork.org/en/scripts/510683-%E5%AF%BC%E5%87%BA%E5%BE%AE%E4%BF%A1%E5%85%AC%E4%BC%97%E5%8F%B7%E6%96%87%E7%AB%A0%E4%B8%BApdf/code)

## 隐私政策

[网页](https://027xiguapi.github.io/code-box/privacy-policy.html)

## 支持

![img](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/wx/qrcode_wx.jpg)
