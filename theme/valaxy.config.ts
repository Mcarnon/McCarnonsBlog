import type { ThemeConfig } from './types'
import { defineTheme } from 'valaxy'
import { defaultThemeConfig, generateSafelist, themePlugin } from './node'

export default defineTheme<ThemeConfig>((options) => {
  return {
    themeConfig: defaultThemeConfig,
    vite: {
      plugins: [themePlugin(options)],
      optimizeDeps: {
        include: [
          '@braintree/sanitize-url',
          'dayjs/plugin/advancedFormat',
          'mermaid',
          '@mermaid-js/parser',
          'langium',
        ],
      },
      ssr: {
        noExternal: ['mermaid', '@mermaid-js/parser', 'langium'],
      },
    },
    unocss: {
      safelist: generateSafelist(options.config.themeConfig as ThemeConfig),
    },
  }
})
