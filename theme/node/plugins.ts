import type { ResolvedValaxyOptions } from 'valaxy'
import type { Plugin } from 'vite'
import type { ThemeConfig } from '../types'

// write a vite plugin
// https://vitejs.dev/guide/api-plugin.html
export function themePlugin(options: ResolvedValaxyOptions<ThemeConfig>): Plugin {
  const themeConfig = options.config.themeConfig || {}

  return {
    name: 'valaxy-theme-lolimeow',

    config() {
      return {
        css: {
          preprocessorOptions: {
            scss: {
              additionalData: `$lm-theme-primary: ${themeConfig.ui?.primary || '#66CCFF'} !default;\n`,
            },
          },
        },

        valaxy: {},
      }
    },

  }
}
