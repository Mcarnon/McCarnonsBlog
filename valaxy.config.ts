import type { ThemeConfig } from 'valaxy-theme-lolimeow'
import { defineConfig } from 'valaxy'
// @ts-expect-error - `valaxy-addon-waline` 仅提供源码与导出映射，CI 下 `vue-tsc` 可能无法正确解析包根类型
import { addonWaline } from 'valaxy-addon-waline'

/**
 * User Config
 * do not use export const config to avoid defu conflict
 */
export default defineConfig<ThemeConfig>({
  theme: 'lolimeow',

  themeConfig: {
    ui: {
      primary: '#1E90FF',
    },

    // 背景图
    background: {
      type: 'image',
      image: {
        light: '/images/background1.webp',
        dark: '/images/background2.webp',
        // urls: ['/images/background1.webp', '/images/background2.webp'],
        // apiUrls: [
        //   // 'https://www.dmoe.cc/random.php',
        //   'https://api.horosama.com/random.php',
        // ],
        // random: true,
        overlayOpacity: 0.5,
      },
    },

    // 首屏
    // hero: {
    //   mottoSource: 'hitokoto',
    //   // motto: ['中文测试test', 'Welcome to Valaxy Theme Lolimeow', 'Test Long Long Long Long Long Long Long Long Long Long Long Long Text'],
    //   hitokoto: {
    //     showFrom: true,
    //     sentenceTypes: ['a', 'b', 'c'],
    //     maxLength: 30,
    //   },
    //   // cover: {
    //   //   urls: ['/images/background1.webp', '/images/background2.webp'],
    //   //   apiUrls: [
    //   //     'https://www.loliapi.com/acg/?type=img',
    //   //   ],
    //   //   random: true,
    //   //   fixed: false,
    //   // },
    //   typewriter: true,
    // },

    // 导航栏
    navbar: [
      { text: '首页', link: '/', icon: 'i-ri-home-line' },
      { text: '归档', link: '/archives/', icon: 'i-ri-archive-line' },
      { text: '分类', link: '/categories/', icon: 'i-ri-folder-line' },
      { text: '标签', link: '/tags/', icon: 'i-ri-price-tag-3-line' },
      { text: '项目', link: '/projects/', icon: 'i-ri-apps-2-line' },
      { text: '友链', link: '/links/', icon: 'i-ri-links-line' },
      { text: '关于', link: '/about/', icon: 'i-ri-user-line' },
    ],
    navbarOptions: {
      // title: 'My Blog',
      tools: ['toggleDark', 'search'],
      hamburgerStyle: 'classic',
    },

    // 公告
    notice: {
      enable: true,
      message: 'This is a notice message.',
      closable: true,
      scope: 'home',
    },

    // 置顶
    pinned: {
      enable: true,
      title: 'START',
      entries: [
        {
          title: 'Valaxy Docs',
          link: 'https://valaxy.site',
          desc: 'Valaxy Documentation',
          img: '/images/background1.webp',
        },
        {
          title: 'Lolimeow Docs',
          link: 'https://lolimeow.yoyo514.top/docs/',
          desc: 'This Theme Documentation',
          img: '/images/background2.webp',
        },
      ],
    },

    // 项目
    projects: {
      groups: [
        {
          title: 'Open Source',
          desc: '主题、工具与一些可复用的小项目。',
          items: [
            {
              name: 'Valaxy Theme Lolimeow',
              desc: 'A cute and clean Valaxy theme for personal blogs.',
              link: 'https://lolimeow.yoyo514.top/',
              repo: 'https://github.com/Yoyo-514/valaxy-theme-lolimeow',
              docs: 'https://lolimeow.yoyo514.top/',
              cover: '/images/background2.webp',
              iconImg: '/images/favicon.ico',
              color: '#66CCFF',
              tags: ['Valaxy', 'Vue', 'Theme'],
              status: 'active',
              featured: true,
            },
            {
              name: 'Valaxy',
              desc: 'Next generation static blog framework.',
              link: 'https://valaxy.site/',
              repo: 'https://github.com/YunYouJun/valaxy',
              icon: 'i-ri-vuejs-line',
              color: '#8bd5ff',
              tags: ['Blog Framework', 'Vue', 'Vite'],
              status: 'active',
            },
            {
              name: 'Demo Lab',
              desc: 'A work-in-progress playground for theme experiments.',
              demo: 'https://example.com',
              icon: 'i-ri-flask-line',
              color: '#ffb86c',
              tags: ['Example', 'Demo', 'Experiment'],
              status: 'wip',
            },
          ],
        },
      ],
    },

    // 友链
    // statusCheck 开启后会在头像右下角显示状态点：
    // 主题色 = 检测中，绿色 = 可访问，红色 = 暂不可访问，灰色 = 未知状态。
    // 纯前端检测受跨域限制影响，只能作为可访问性的辅助提示。
    links: {
      statusCheck: true,
      groups: [
        {
          title: 'Neighbors',
          items: [
            {
              name: 'Moonlit Lab',
              desc: '记录前端、设计和一点点日常灵感。',
              url: 'https://example.com/moonlit-lab',
              avatar: '/images/link1.jpg',
              color: '#66CCFF',
              blog: 'Moonlit Notes',
            },
            {
              name: 'Pixel Nest',
              desc: '喜欢像素、动画与可爱的网页实验。',
              url: 'https://example.com/pixel-nest',
              avatar: '/images/link2.jpg',
              color: '#ff5a66',
              blog: 'Pixel Garden',
            },
            {
              name: 'Quiet Terminal',
              desc: '把工程笔记整理成更容易回看的形状。',
              url: 'https://example.com/quiet-terminal',
              avatar: '/images/link3.jpg',
              color: '#8bd5ff',
              blog: 'Terminal Log',
            },
          ],
        },
      ],
    },

    // 文章列表
    postList: {
      title: 'Discovery',
      coverApiUrls: ['https://www.loliapi.com/acg/?type=img'],
      coverRandom: true,
      showExcerpt: true,
      excerptLength: 140,
      maxColumns: 1,
      minCardWidth: '18rem',
    },

    pagination: {
      type: 'infinite-scroll',
      animation: true,
      itemsPerPage: 10,
      infiniteScrollOptions: {
        preload: true,
        threshold: 200,
      },
    },

    footer: {
      since: 2023,
    },
  },
  addons: [
    addonWaline({
      serverURL: 'https://waline.yoyo514.top',
      pageview: true,
      comment: true,
      login: 'force',
      requiredMeta: ['nick', 'mail'],
    }),
  ],
})
