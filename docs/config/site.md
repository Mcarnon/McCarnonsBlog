# 站点信息

站点信息由 Valaxy 的 `site.config.ts` 管理，主要用于描述博客本身，而不是主题外观。

## 基础信息

建议至少配置语言、时区、标题、站点地址和作者信息。

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  lang: 'zh-CN',
  timezone: 'Asia/Shanghai',
  title: 'My Blog',
  url: 'https://example.com/',
  description: 'A personal blog powered by Valaxy.',
  favicon: '/favicon.ico',
  author: {
    name: 'Your Name',
    avatar: '/path/to/avatar.jpg',
  },
})
```

::: warning
建议显式配置 `timezone`。如果服务端构建环境与客户端浏览器时区不同，文章日期等时间内容可能出现 SSR 水合不一致。
:::

## 语言

`siteConfig.lang` 用于选择主题固定 UI 文案的语言，例如搜索、分页、目录、404 按钮与辅助性标签。

Lolimeow 当前内置以下语言：

- `zh-CN`
- `en`

文章内容、导航文本、公告、置顶标题等作者配置内容不会被主题自动翻译，请直接使用站点目标语言编写。主题不提供运行时语言切换按钮。

## 搜索

Lolimeow 使用 Valaxy 生成的 Fuse 本地搜索数据。开启搜索后，可在主题导航栏中显示搜索入口。

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  search: {
    enable: true,
    provider: 'fuse',
  },
  fuse: {
    options: {
      keys: ['title', 'tags', 'categories', 'excerpt', 'content'],
      threshold: 0.35,
      ignoreLocation: true,
    },
  },
})
```

同时需要在主题导航工具中启用 `search`：

```ts
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    navbarOptions: {
      tools: ['toggleDark', 'search'],
    },
  },
})
```

## 社交链接

`siteConfig.social` 用于 Hero、作者信息等位置的社交入口。

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  social: [
    {
      name: 'GitHub',
      link: 'https://github.com/yourname',
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
  ],
})
```

## 评论开关

站点级评论开关由 `siteConfig.comment` 控制。具体评论服务可通过 Valaxy 插件配置。

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  comment: {
    enable: true,
  },
})
```
