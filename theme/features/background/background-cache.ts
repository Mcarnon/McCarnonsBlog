import type { BackgroundScope, ResolvedBackground } from './types'

/** 已成功显示背景图的模块级 LRU 缓存容量。 */
const LOADED_IMAGE_CACHE_CAPACITY = 64

/**
 * 基于 `Map` 插入顺序实现的最近最少使用缓存。
 *
 * 读取已有条目时会将其刷新为最新使用项；容量不足时淘汰最早使用项。
 */
class LRUCache<K, V> {
  /** 缓存可容纳的最大条目数。 */
  private readonly cap: number

  /** 按最近使用顺序保存条目的映射。 */
  private readonly cache = new Map<K, V>()

  /**
   * 创建指定容量的 LRU 缓存。
   *
   * @param capacity - 最大条目数；负数按零容量处理。
   */
  constructor(capacity: number) {
    this.cap = Math.max(0, capacity)
  }

  /** 当前缓存中的条目数量。 */
  get size() {
    return this.cache.size
  }

  /**
   * 判断缓存中是否存在指定键，不刷新最近使用顺序。
   *
   * @param key - 待检查的键。
   * @returns 存在指定键时返回 `true`。
   */
  has(key: K): boolean {
    return this.cache.has(key)
  }

  /**
   * 读取指定键并将命中条目刷新为最新使用项。
   *
   * @param key - 待读取的键。
   * @returns 命中的值；键不存在时返回 `undefined`。
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined
    }

    const val = this.cache.get(key)!

    this.cache.delete(key)
    this.cache.set(key, val)

    return val
  }

  /**
   * 写入或更新缓存条目，并在达到容量时淘汰最早使用项。
   *
   * @param key - 待写入的键。
   * @param val - 待写入的值。
   */
  set(key: K, val: V): void {
    if (this.cap <= 0)
      return

    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    else if (this.cache.size >= this.cap) {
      const oldestKey = this.cache.keys().next().value as K | undefined
      if (oldestKey !== undefined)
        this.cache.delete(oldestKey)
    }

    this.cache.set(key, val)
  }

  /**
   * 删除指定缓存条目。
   *
   * @param key - 待删除的键。
   * @returns 条目原本存在并成功删除时返回 `true`。
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  /** 清空全部缓存条目。 */
  clear(): void {
    this.cache.clear()
  }
}

/** 跨背景运行时实例共享的已成功显示图片缓存。 */
const loadedImageCache = new LRUCache<string, string>(LOADED_IMAGE_CACHE_CAPACITY)

/** 跨背景运行时实例共享的 hydration 稳定回退图片缓存。 */
const sessionFallbackCache = new Map<string, string>()

/**
 * 生成稳定回退图片的模块级缓存键。
 *
 * @param scope - 背景生效范围。
 * @param background - 当前解析后的背景。
 * @returns 由范围、来源、随机模式及回退候选组成的稳定键。
 */
function getFallbackCacheKey(scope: BackgroundScope, background: ResolvedBackground) {
  return [
    scope,
    background.source,
    background.random ? 'random' : 'stable',
    background.fallbackImageUrl,
    background.staticImageUrls.join('|'),
  ].join(':')
}

/**
 * 读取已成功显示过的背景图片，并刷新其 LRU 使用顺序。
 *
 * @param cacheKey - 背景图片缓存键。
 * @returns 命中的图片地址；未命中时返回 `undefined`。
 */
export function getCachedBackgroundImage(cacheKey: string): string | undefined {
  return loadedImageCache.get(cacheKey)
}

/**
 * 缓存已成功显示的背景图片，供后续运行时实例直接复用。
 *
 * @param cacheKey - 背景图片缓存键。
 * @param imageUrl - 已成功显示的图片地址。
 */
export function cacheBackgroundImage(cacheKey: string, imageUrl: string): void {
  loadedImageCache.set(cacheKey, imageUrl)
}

/**
 * 获取 SSR 与 hydration 前后保持一致的静态回退图片。
 *
 * 随机模式不会在运行时重新挑选回退图，而是沿用解析结果中的稳定候选；
 * 真正的随机选择由客户端预加载和轮换流程负责。
 *
 * @param scope - 背景生效范围。
 * @param background - 当前解析后的背景。
 * @returns 稳定回退图片地址；不存在回退候选时返回空字符串。
 */
export function getStableFallbackImage(
  scope: BackgroundScope,
  background: ResolvedBackground,
): string {
  if (!background.fallbackImageUrl && !background.staticImageUrls.length)
    return ''

  const cacheKey = getFallbackCacheKey(scope, background)
  const cachedFallback = sessionFallbackCache.get(cacheKey)

  if (cachedFallback)
    return cachedFallback

  // hydration 前后的首屏 fallback 必须稳定一致。
  // 真正的随机切换交给 mounted 后的预加载与轮换流程处理。
  const fallbackImage = background.fallbackImageUrl

  if (fallbackImage)
    sessionFallbackCache.set(cacheKey, fallbackImage)

  return fallbackImage
}
