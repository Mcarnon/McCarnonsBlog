/**
 * 将数值限制在给定闭区间内，统一处理需要上下界保护的计算结果。
 *
 * @param value - 待限制的数值。
 * @param min - 允许的最小值。
 * @param max - 允许的最大值。
 * @returns 不小于 `min` 且不大于 `max` 的数值。
 */
export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
