import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/docs/',
  title: 'Lolimeow Docs',
  description: '一个轻二次元风格的 Valaxy 博客主题',
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'icon', href: '/docs/favicon.ico' }],
  ],
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    logo: '/favicon.ico',
    nav: [
      { text: '指南', link: '/guide/installation' },
      { text: '配置', link: '/config/theme' },
      { text: 'FAQ', link: '/guide/faq' },
      { text: 'Demo', link: 'https://lolimeow.yoyo514.top/' },
    ],
    sidebar: [
      {
        text: '开始使用',
        items: [
          { text: '安装', link: '/guide/installation' },
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '基础配置', link: '/guide/configuration' },
          { text: '部署', link: '/guide/deployment' },
        ],
      },
      {
        text: '主题配置',
        items: [
          { text: '配置总览', link: '/config/theme' },
          { text: '站点信息', link: '/config/site' },
          { text: '背景', link: '/config/background' },
          { text: '首屏', link: '/config/hero' },
          { text: '导航栏', link: '/config/navbar' },
          { text: '文章列表', link: '/config/post-list' },
          { text: '项目展示', link: '/config/projects' },
          { text: '分页', link: '/config/pagination' },
          { text: '友链', link: '/config/links' },
          { text: '置顶卡片', link: '/config/pinned' },
          { text: '公告', link: '/config/notice' },
          { text: '页脚', link: '/config/footer' },
        ],
      },
      {
        text: '其他',
        items: [
          { text: '页面 Frontmatter', link: '/config/page-frontmatter' },
          { text: '评论与插件', link: '/guide/comments-plugins' },
          { text: '常见问题', link: '/guide/faq' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Yoyo-514/valaxy-theme-lolimeow' },
    ],
    search: {
      provider: 'local',
    },
    outline: {
      label: '本页目录',
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    lastUpdated: {
      text: '最后更新',
    },
  },
})
