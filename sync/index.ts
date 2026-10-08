/**
 * 文章同步模块（移植自 wechatsync/Wechatsync 核心）
 *
 * 目录结构说明：
 * - types.ts          公共类型（Article / SyncResult / PlatformMeta ...）
 * - runtime/          运行时抽象 + Chrome 扩展实现
 * - lib/              HTML 转 Markdown、图片解析、AWS4 签名、日志等工具
 * - adapters/         平台适配器（含 registry 注册中心）
 * - extension/        Content Script 侧的内容预处理、提取与同步引擎
 */
// 公共类型
export * from './types'

// 运行时抽象
export * from './runtime/interface'

// 适配器（含 registry / code-adapter / 全平台）
export * from './adapters'

// 工具库
export * from './lib'

// 版本号
export const SYNC_VERSION = '2.0.9'
