/**
 * 为字符串生成跨客户端与构建阶段稳定的轻量无符号哈希值。
 *
 * @remarks
 * 该算法用于封面随机图、标签云等只要求稳定分布的场景，不提供加密安全性。
 *
 * @param input - 待计算哈希的字符串。
 * @returns 基于 31 倍累加得到的 32 位无符号整数。
 */
export function hashString(input: string) {
  return Array.from(input).reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) >>> 0
  }, 0)
}
