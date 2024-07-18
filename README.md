## code-box

## 代码

https://github.com/027xiguapi/code-box

## 介绍

博客网站在未登录状态下无法复制代码，使用这个插件，无需登录可以一键复制代码。

还支持解除`关注博主即可阅读全文`的提示，隐藏登陆弹窗。

完整分析：[谷歌插件：无需登录一键复制 CSDN 代码](https://lwebapp.com/zh/post/copy-csdn)

## 安装

### 安装方式一：插件商店《推荐》

直接下载安装：
1. 进入应用商店
   - [Chrome网上应用商店](https://chrome.google.com/webstore/category/extensions?hl=zh-CN)
   - [Firefox网上应用商店](https://addons.mozilla.org/zh-CN/firefox/)
   - [Edge网上应用商店](https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home?hl=zh-CN)
2. 搜索：`codebox`

   ![img](https://raw.githubusercontent.com/027xiguapi/code-box/main/public/img.png)


### 安装方式二：源码安装

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

## 完成
### CSDN

1. 打开任意一个`CSDN`博客即可开始复制代码
2. 未登录`CSDN`状态下，支持选中代码
3. 未登录`CSDN`状态下，代码右上角按钮一键复制
4. 未登录`CSDN`状态下，不会再出现强制登陆弹窗
5. 未关注博主状态下，不再提示关注博主即可阅读全文，且完整展示文章
6. 自动展开代码块
7. 移动端屏蔽跳转APP

### 脚本之家

1. 打开任意一个`脚本之家`博客即可开始复制代码
2. 未登录`脚本之家`状态下，支持选中代码
3. 屏蔽广告
4. 移动端一键复制

### 博客园

1. 一键复制代码

### 知乎

1. 一键复制代码
2. 未登录`知乎`状态下，不再提示展开阅读全文，且完整展示文章
3. 未登录`知乎`状态下，不会再出现强制登陆弹窗

## 计划

### 51CTO博客

### php中文网

## 参考

1. [copy-csdn](https://github.com/openHacking/copy-csdn)
2. [plasmo](https://github.com/PlasmoHQ/plasmo)