/**
 * 通用日志接口 - 不依赖浏览器 API
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface Logger {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}

export interface LoggerConfig {
  enabled: boolean
  level: LogLevel
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// 默认配置：只输出 warn / error，避免污染宿主页面控制台
// 需要排查问题时，可在 chrome.storage.local 设置 codebox-sync-log = "debug"
let globalConfig: LoggerConfig = {
  enabled: true,
  level: 'warn',
}

// 启动时读取日志级别设置（扩展环境）
try {
  if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
    chrome.storage.local.get('codebox-sync-log').then((result) => {
      const level = result?.['codebox-sync-log']
      if (level === 'debug' || level === 'info' || level === 'warn' || level === 'error') {
        globalConfig.level = level
      }
    }).catch(() => {
      // 忽略
    })
  }
} catch {
  // 非扩展环境，使用默认配置
}

/**
 * 设置全局日志配置
 */
export function setLoggerConfig(config: Partial<LoggerConfig>) {
  globalConfig = { ...globalConfig, ...config }
}

/**
 * 获取当前配置
 */
export function getLoggerConfig(): LoggerConfig {
  return { ...globalConfig }
}

/**
 * 创建带前缀的 logger
 */
export function createLogger(prefix: string): Logger {
  const shouldLog = (level: LogLevel): boolean => {
    if (!globalConfig.enabled) return false
    return LOG_LEVELS[level] >= LOG_LEVELS[globalConfig.level]
  }

  return {
    debug: (...args: unknown[]) => {
      if (shouldLog('debug')) {
        console.log(`[${prefix}]`, ...args)
      }
    },
    info: (...args: unknown[]) => {
      if (shouldLog('info')) {
        console.log(`[${prefix}]`, ...args)
      }
    },
    warn: (...args: unknown[]) => {
      if (shouldLog('warn')) {
        console.warn(`[${prefix}]`, ...args)
      }
    },
    error: (...args: unknown[]) => {
      if (shouldLog('error')) {
        console.error(`[${prefix}]`, ...args)
      }
    },
  }
}
