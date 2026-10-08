/**
 * 平台适配器导出与注册清单
 *
 * 参考 wechatsync/Wechatsync 的适配器体系移植：
 * - 主流自媒体：微信公众号、知乎、微博、小红书、抖音图文
 * - 技术社区：掘金、CSDN、51CTO、慕课网、开源中国、SegmentFault、博客园、语雀
 * - 通用平台：简书、头条号、百家号、搜狐号、豆瓣、B站、大鱼号、一点号、网易号、什么值得买
 * - 财经/产品/房产：雪球、东方财富、人人都是产品经理、搜狐焦点
 * - 海外：X (Twitter)
 * - 建站/CMS：Hexo/Hugo（Markdown 打包下载）
 */
import { WeixinAdapter } from './weixin'
import { ZhihuAdapter } from './zhihu'
import { WeiboAdapter } from './weibo'
import { XiaohongshuAdapter } from './xiaohongshu'
import { DouyinAdapter } from './douyin'
import { JuejinAdapter } from './juejin'
import { CSDNAdapter } from './csdn'
import { Cto51Adapter } from './cto51'
import { ImoocAdapter } from './imooc'
import { OschinaAdapter } from './oschina'
import { SegmentfaultAdapter } from './segmentfault'
import { CnblogsAdapter } from './cnblogs'
import { YuqueAdapter } from './yuque'
import { JianshuAdapter } from './jianshu'
import { ToutiaoAdapter } from './toutiao'
import { BaijiahaoAdapter } from './baijiahao'
import { SohuAdapter } from './sohu'
import { DoubanAdapter } from './douban'
import { DaYuAdapter } from './dayu'
import { YidianAdapter } from './yidian'
import { NeteaseAdapter } from './netease'
import { SmzdmAdapter } from './smzdm'
import { XueqiuAdapter } from './xueqiu'
import { EastmoneyAdapter } from './eastmoney'
import { WoshipmAdapter } from './woshipm'
import { SohufocusAdapter } from './sohufocus'
import { XAdapter } from './x'
import { BilibiliAdapter } from './bilibili'
import { ZipDownloadAdapter } from './zip-download'
import type { PlatformAdapter } from '../types'

export {
  WeixinAdapter,
  ZhihuAdapter,
  WeiboAdapter,
  XiaohongshuAdapter,
  DouyinAdapter,
  JuejinAdapter,
  CSDNAdapter,
  Cto51Adapter,
  ImoocAdapter,
  OschinaAdapter,
  SegmentfaultAdapter,
  CnblogsAdapter,
  YuqueAdapter,
  JianshuAdapter,
  ToutiaoAdapter,
  BaijiahaoAdapter,
  SohuAdapter,
  DoubanAdapter,
  DaYuAdapter,
  YidianAdapter,
  NeteaseAdapter,
  SmzdmAdapter,
  XueqiuAdapter,
  EastmoneyAdapter,
  WoshipmAdapter,
  SohufocusAdapter,
  XAdapter,
  BilibiliAdapter,
  ZipDownloadAdapter
}

export type AdapterConstructor = new () => PlatformAdapter

/**
 * 全部平台适配器构造函数（注册顺序即面板默认展示顺序）
 */
export const ALL_ADAPTERS: AdapterConstructor[] = [
  // 主流自媒体
  WeixinAdapter,
  ZhihuAdapter,
  WeiboAdapter,
  XiaohongshuAdapter,
  DouyinAdapter,
  // 技术社区
  JuejinAdapter,
  CSDNAdapter,
  Cto51Adapter,
  ImoocAdapter,
  OschinaAdapter,
  SegmentfaultAdapter,
  CnblogsAdapter,
  YuqueAdapter,
  // 通用平台
  JianshuAdapter,
  ToutiaoAdapter,
  BaijiahaoAdapter,
  SohuAdapter,
  DoubanAdapter,
  BilibiliAdapter,
  DaYuAdapter,
  YidianAdapter,
  NeteaseAdapter,
  SmzdmAdapter,
  // 财经 / 产品 / 房产
  XueqiuAdapter,
  EastmoneyAdapter,
  WoshipmAdapter,
  SohufocusAdapter,
  // 海外
  XAdapter,
  // 建站 / CMS
  ZipDownloadAdapter
]
