import { defineConfig } from 'vite'

/**
 * 排查生产环境水合问题时，请临时在 Valaxy 构建产物中启用
 * __VUE_PROD_HYDRATION_MISMATCH_DETAILS__；Demo 侧的 Vite define 会被上游默认值覆盖。
 */
export default defineConfig({})
