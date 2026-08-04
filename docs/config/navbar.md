# 导航栏

导航栏用于组织博客的主要页面入口。本文只说明 `themeConfig.navbar` 与 `themeConfig.navbarOptions`。

## 基础导航

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    navbar: [
      { text: '首页', link: '/', icon: 'i-ri-home-line' },
      { text: '归档', link: '/archives/', icon: 'i-ri-archive-line' },
      { text: '分类', link: '/categories/', icon: 'i-ri-folder-line' },
      { text: '标签', link: '/tags/', icon: 'i-ri-price-tag-3-line' },
      { text: '友链', link: '/links/', icon: 'i-ri-links-line' },
      { text: '关于', link: '/about/', icon: 'i-ri-user-line' },
    ],
  },
})
```

## 导航项字段

| 字段     | 说明             | 必填 |
| -------- | ---------------- | ---- |
| `text`   | 导航显示文本     | 否   |
| `link`   | 导航链接         | 是   |
| `icon`   | Iconify 图标类名 | 否   |
| `target` | 链接打开方式     | 否   |
| `items`  | 子菜单           | 否   |

## 外部链接

外部链接建议设置 `target: '_blank'`。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    navbar: [
      {
        text: 'GitHub',
        link: 'https://github.com/yourname/your-repo',
        icon: 'i-ri-github-line',
        target: '_blank',
      },
    ],
  },
})
```

## 子菜单

`items` 用于配置下拉菜单。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    navbar: [
      {
        text: '更多',
        link: '/more/',
        icon: 'i-ri-more-line',
        items: [
          { text: '友链', link: '/links/' },
          { text: '关于', link: '/about/' },
        ],
      },
    ],
  },
})
```

## 导航栏选项

`themeConfig.navbarOptions` 用于控制导航栏标题、工具按钮和移动端菜单。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    navbarOptions: {
      title: 'My Blog',
      showFavicon: true,
      tools: ['toggleDark', 'search'],
      hamburgerStyle: 'classic',
      autoHide: true,
    },
  },
})
```

## 导航栏选项字段

| 配置项           | 说明                                          | 默认值                     |
| ---------------- | --------------------------------------------- | -------------------------- |
| `showFavicon`    | 是否在导航栏显示站点图标                      | `true`                     |
| `title`          | 导航栏标题                                    | -                          |
| `tools`          | 导航栏工具按钮，可选 `toggleDark` / `search`  | `['toggleDark', 'search']` |
| `hamburgerStyle` | 移动端菜单按钮风格，可选 `uneven` / `classic` | `'uneven'`                 |
| `autoHide`       | 是否随滚动自动隐藏导航栏                      | `true`                     |

## 搜索入口

搜索按钮需要同时满足两处配置：

```ts
// site.config.ts
export default defineSiteConfig({
  search: {
    enable: true,
    provider: 'fuse',
  },
})
```

```ts
// valaxy.config.ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    navbarOptions: {
      tools: ['toggleDark', 'search'],
    },
  },
})
```
