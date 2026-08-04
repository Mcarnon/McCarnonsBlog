// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    gitignore: true,
    unocss: true,
    formatters: true,
  },
  {
    ignores: [
      '**/*/.valaxy',
      '**/node_modules/**',
      '**/scripts/**',
      '.vite-ssg-dist/**',
      '.vite-ssg-temp/**',
      'temp/**',
      'dist/**',
      'dist-ssr/**',
      'public/atom.xml',
      'public/feed.json',
      'public/feed.xml',
      'public/valaxy-fuse-list.json',
    ],
  },
)
