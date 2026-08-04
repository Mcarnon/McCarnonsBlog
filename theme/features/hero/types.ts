/**
 * 打字机逐字渲染一次文本时使用的选项。
 */
export interface TypewriterRenderOptions {
  /** 本次需要渲染的完整文本。 */
  text: string
  /** 相邻字符显示之间的间隔，单位为毫秒。 */
  speed: number
  /** 是否跳过逐字过程并立即显示完整文本。 */
  immediate?: boolean
  /** 文本完整显示后执行的回调，立即渲染和空文本同样会触发。 */
  onComplete?: () => void
}
