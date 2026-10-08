import type { PlatformAdapter, AdapterRegistryEntry, PreprocessConfig } from './types'
import { DEFAULT_PREPROCESS_CONFIG } from './types'
import type { RuntimeInterface } from '../runtime/interface'
import type { PlatformMeta } from '../types'

/**
 * 适配器注册中心
 * 管理所有平台适配器的注册和获取
 */
class AdapterRegistry {
  private adapters: Map<string, AdapterRegistryEntry> = new Map()
  private instances: Map<string, PlatformAdapter> = new Map()
  private runtime?: RuntimeInterface

  /**
   * 设置运行时
   */
  setRuntime(runtime: RuntimeInterface): void {
    this.runtime = runtime
    // 清空已有实例，等待重新初始化
    this.instances.clear()
  }

  /**
   * 注册适配器
   */
  register(entry: AdapterRegistryEntry): void {
    this.adapters.set(entry.meta.id, entry)
  }

  /**
   * 批量注册
   */
  registerAll(entries: AdapterRegistryEntry[]): void {
    entries.forEach(entry => this.register(entry))
  }

  /**
   * 获取适配器实例
   */
  async get(platformId: string): Promise<PlatformAdapter | null> {
    // 检查缓存
    if (this.instances.has(platformId)) {
      return this.instances.get(platformId)!
    }

    // 查找注册项
    const entry = this.adapters.get(platformId)
    if (!entry) {
      return null
    }

    if (!this.runtime) {
      throw new Error('Runtime not set. Call setRuntime() first.')
    }

    // 创建并初始化实例
    const adapter = entry.factory(this.runtime)
    await adapter.init(this.runtime)
    this.instances.set(platformId, adapter)

    return adapter
  }

  /**
   * 获取所有平台元信息
   */
  getAllMeta(): PlatformMeta[] {
    return Array.from(this.adapters.values()).map(entry => entry.meta)
  }

  /**
   * 检查平台是否已注册
   */
  has(platformId: string): boolean {
    return this.adapters.has(platformId)
  }

  /**
   * 获取已注册的平台 ID 列表
   */
  getRegisteredIds(): string[] {
    return Array.from(this.adapters.keys())
  }

  /**
   * 清空注册
   */
  clear(): void {
    this.adapters.clear()
    this.instances.clear()
  }

  /**
   * 获取平台的预处理配置
   */
  getPreprocessConfig(platformId: string): PreprocessConfig {
    const entry = this.adapters.get(platformId)
    return {
      ...DEFAULT_PREPROCESS_CONFIG,
      ...(entry?.preprocessConfig || {}),
    }
  }

  /**
   * 获取多个平台的预处理配置
   */
  getPreprocessConfigs(platformIds: string[]): Record<string, PreprocessConfig> {
    const configs: Record<string, PreprocessConfig> = {}
    for (const id of platformIds) {
      configs[id] = this.getPreprocessConfig(id)
    }
    return configs
  }
}

/**
 * 全局适配器注册中心实例
 */
export const adapterRegistry = new AdapterRegistry()

/**
 * 注册适配器的便捷函数
 */
export function registerAdapter(entry: AdapterRegistryEntry): void {
  adapterRegistry.register(entry)
}

/**
 * 获取适配器的便捷函数
 */
export async function getAdapter(platformId: string): Promise<PlatformAdapter | null> {
  return adapterRegistry.get(platformId)
}

/**
 * 获取平台的预处理配置
 */
export function getPreprocessConfig(platformId: string): PreprocessConfig {
  return adapterRegistry.getPreprocessConfig(platformId)
}

/**
 * 获取多个平台的预处理配置
 */
export function getPreprocessConfigs(platformIds: string[]): Record<string, PreprocessConfig> {
  return adapterRegistry.getPreprocessConfigs(platformIds)
}
