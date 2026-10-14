# codebox-一键复制代码/下载文章

[中文](README.md) | [English](README_EN.md)

## 网站
1. 官网
https://www.code-box.fun/
2. 文档
https://code-box.fun/docs

## 介绍

本浏览器插件可以用于CSDN/知乎/脚本之家/博客园/博客园/51CTO博客/php中文网/掘金/微信等网站,一键下载文章成html或markdown文件;实现无需登录一键复制代码;支持选中代码;或者代码右上角按钮的一键复制;解除关注博主即可阅读全文提示;去除登录弹窗;去除跳转APP弹窗。

同时支持**文章同步**：一键把当前文章同步到微信公众号、知乎、微博、小红书、掘金、CSDN、头条号等 29+ 主流平台（默认保存为草稿），支持 WordPress、Typecho 等自建站。

## 安装

### 安装方式一：插件商店(推荐)

直接下载安装：
1. 进入应用商店
   - [Chrome应用商店](https://chrome.google.com/webstore/category/extensions?hl=zh-CN)
   - [Edge应用商店](https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home?hl=zh-CN)
   - [360浏览器应用商店](https://ext.se.360.cn/#/extension-detail?id=acnnhjllgegbndgknlliobjlekgilbdf)
   - [Firefox应用商店](https://addons.mozilla.org/zh-CN/firefox/)
   
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

![img](https://github.com/027xiguapi/code-box/blob/main/public/wx/gzh.jpg)

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

### 文章同步（29+ 主流平台）🆕

参考 [Wechatsync 文章同步助手](https://github.com/wechatsync/Wechatsync) 的适配器体系实现，一键把当前页面文章**同步到 29+ 主流平台**，默认保存为草稿，确认无误后再发布。

#### 特点

- **用自己的登录态**：直接使用浏览器中已登录的 Cookie，无需额外授权，无需输入密码
- **调用平台官方接口**：与你在网页编辑器里手动发布完全等价
- **数据不离开浏览器**：所有请求从你的浏览器直接发往各平台，没有中间服务器
- **草稿优先**：默认只保存草稿，不会自动发布
- **图片自动转存**：正文图片自动上传到目标平台
- **按平台适配内容**：不同平台对 HTML 结构要求不同（是否保留链接、标签是否压缩、代码块格式等），同步前会为每个平台分别预处理
- **自建站支持**：WordPress、Typecho、MetaWeblog

#### 使用方式

1. 打开任意文章页面（微信公众号文章、知乎、掘金、CSDN、博客园等都可以）
2. 三个入口任选其一：
   - 点击扩展图标 → `文章同步`
   - 文章页左侧悬浮面板 → `文章同步`
   - 微信公众号文章页左侧面板 → `文章同步`
3. 在同步面板中确认提取到的文章 → 勾选目标平台（面板会显示各平台登录状态）→ `开始同步`
4. 同步完成后可在面板中查看每个平台的状态、草稿链接和同步历史

#### 支持平台

| 平台 | ID | 类型 | 同步方式 |
|-----|-----|-----|-----|
| 微信公众号 | weixin | 主流自媒体 | 接口（草稿） |
| 知乎 | zhihu | 主流自媒体 | 接口（草稿） |
| 微博 | weibo | 主流自媒体 | 接口（草稿） |
| 小红书 | xiaohongshu | 主流自媒体 | 编辑器辅助（实验） |
| 掘金 | juejin | 技术社区 | 接口（草稿） |
| CSDN | csdn | 技术社区 | 接口（草稿） |
| 简书 | jianshu | 通用 | 接口（草稿） |
| 头条号 | toutiao | 通用 | 接口（草稿） |
| 抖音图文 | douyin | 主流自媒体 | 编辑器辅助（实验） |
| B站专栏 | bilibili | 通用 | 接口（草稿） |
| 百家号 | baijiahao | 通用 | 接口（草稿） |
| 语雀 | yuque | 技术社区 | 接口（草稿） |
| 豆瓣 | douban | 通用 | 接口（草稿） |
| 搜狐号 | sohu | 通用 | 接口（草稿） |
| 雪球 | xueqiu | 财经 | 接口（草稿） |
| 人人都是产品经理 | woshipm | 产品 | 接口（草稿） |
| 大鱼号 | dayu | 通用 | 接口（草稿） |
| 一点号 | yidian | 通用 | 接口（草稿） |
| 51CTO | 51cto | 技术社区 | 接口（草稿） |
| 慕课网 | imooc | 技术社区 | 接口（草稿） |
| 开源中国 | oschina | 技术社区 | 接口（草稿） |
| SegmentFault | segmentfault | 技术社区 | 接口（草稿） |
| 博客园 | cnblogs | 技术社区 | 接口（草稿） |
| 搜狐焦点 | sohufocus | 房产 | 接口（草稿） |
| X (Twitter) | x | 海外 | 编辑器辅助（实验） |
| 东方财富 | eastmoney | 财经 | 接口（草稿） |
| 什么值得买 | smzdm | 通用 | 编辑器辅助（实验） |
| 网易号 | netease | 通用 | 编辑器辅助（实验） |
| WordPress | wordpress | 建站/CMS | 接口（草稿） |
| Typecho | typecho | 建站/CMS | 接口（草稿） |
| Hexo | zip-download | 建站/CMS | 通过 Markdown 打包下载 |
| Hugo | zip-download | 建站/CMS | 通过 Markdown 打包下载 |

> 说明：「编辑器辅助」表示该平台未公开草稿接口（或接口需要浏览器端签名 / 风控校验），扩展会打开该平台的官方编辑器并自动填充标题与正文，你确认后保存草稿或发布即可。

#### 自建站（WordPress / Typecho / MetaWeblog）

在同步面板的「自建站账号」中填写站点地址、用户名和密码（密码仅保存在本地浏览器中），添加后即可作为同步目标。WordPress 建议使用「应用密码」。

#### 代码结构（开发者）

```
sync/
├── types.ts                  # 公共类型（Article / SyncResult / PlatformMeta）
├── lib/                      # HTML→Markdown、图片解析、CSS 内联、AWS4 签名、日志
├── runtime/                  # 运行时抽象 + Chrome 扩展实现（fetch / cookies / headerRules）
├── adapters/
│   ├── code-adapter.ts       # 适配器基类（请求、图片上传、Header 规则、HTML 清理）
│   ├── editor-assist.ts      # 编辑器辅助基类（半自动同步）
│   ├── registry.ts           # 适配器注册中心
│   ├── platforms/            # 29 个平台适配器
│   └── cms/                  # WordPress / MetaWeblog(Typecho)
└── extension/                # 文章提取器、平台内容预处理、同步引擎
contents/sync.ts              # 内容脚本：文章提取 + 按平台预处理
tabs/sync.tsx                 # 文章同步面板界面
```

新增平台：在 `sync/adapters/platforms/` 下实现 `CodeAdapter` 子类（需要浏览器操作的平台继承 `EditorAssistAdapter`），然后在 `sync/adapters/platforms/index.ts` 的 `ALL_ADAPTERS` 中注册即可。


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
- 一键下载所有图片
- 一键下载图片消息(图文)：原图打包、Markdown+图片打包，支持 `mp.weixin.qq.com/s/xxx` 与 `mp.weixin.qq.com/s?__biz=...` 两种链接形态

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
6. [微信公众号推文图片一键下载](https://greasyfork.org/zh-CN/scripts/40583-%E5%BE%AE%E4%BF%A1%E5%85%AC%E4%BC%97%E5%8F%B7%E6%8E%A8%E6%96%87%E5%9B%BE%E7%89%87%E4%B8%80%E9%94%AE%E4%B8%8B%E8%BD%BD/code)
7. [Wechatsync 文章同步助手](https://github.com/wechatsync/Wechatsync)（文章同步适配器体系参考）

## 隐私政策

[网页](https://027xiguapi.github.io/code-box/privacy-policy.html)

## 友链

- https://www.metrolinehub.com/zh
- https://routerpark.com/zh
- http://aitubestats.com/zh
