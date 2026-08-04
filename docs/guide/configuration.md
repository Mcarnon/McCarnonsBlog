# 基础配置

Lolimeow 的配置按职责拆分为多个模块。建议先完成最小配置，再按页面需要逐步补充。

## 配置文件职责

| 文件               | 职责                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| `site.config.ts`   | Valaxy 站点级配置，例如语言、时区、标题、作者、搜索、社交链接、评论开关  |
| `valaxy.config.ts` | 主题与插件配置，例如主题名、背景、Hero、导航、文章列表、友链、页脚、插件 |

## 最小可用配置

### `site.config.ts`

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  lang: 'zh-CN',
  timezone: 'Asia/Shanghai',
  title: 'My Blog',
  url: 'https://example.com/',
  author: {
    name: 'Your Name',
    avatar: '/path/to/avatar.jpg',
  },
})
```

::: warning
建议显式配置 `timezone`。如果服务端构建环境与客户端浏览器时区不同，文章日期等时间内容可能出现 SSR 水合不一致。
:::

### `valaxy.config.ts`

```ts
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    ui: {
      primary: '#66CCFF',
    },
  },
})
```

## 模块配置入口

| 模块             | 文档                                         | 适合配置的内容                               |
| ---------------- | -------------------------------------------- | -------------------------------------------- |
| 站点信息         | [站点信息](/config/site)                     | 标题、作者、时区、搜索、社交链接、评论开关   |
| 主题总览         | [主题配置总览](/config/theme)                | `themeConfig` 配置项索引与默认值来源         |
| 背景             | [背景](/config/background)                   | 全站背景、图片池、随机图片 API、渐变         |
| Hero             | [Hero](/config/hero)                         | 首页首屏文案、一言、打字机、独立封面         |
| 导航栏           | [导航栏](/config/navbar)                     | 导航菜单、工具按钮、移动端菜单               |
| 页面 Frontmatter | [页面 Frontmatter](/config/page-frontmatter) | Markdown 页面的 layout、标题、封面、评论开关 |
| 项目展示         | [项目展示](/config/projects)                 | 作品、开源项目、Demo 展示                    |
| 文章列表         | [文章列表](/config/post-list)                | 首页文章卡片、封面策略、摘要                 |
| 分页             | [分页](/config/pagination)                   | 标准分页、无限滚动、每页数量                 |
| 友链             | [友链](/config/links)                        | 友链分组、友链条目、状态检测                 |
| 置顶卡片         | [置顶卡片](/config/pinned)                   | 首页置顶卡片                                 |
| 公告             | [公告](/config/notice)                       | 首页公告、全局公告                           |
| 页脚             | [页脚](/config/footer)                       | 页脚年份、图标、备案                         |
| 评论与插件       | [评论与插件](/guide/comments-plugins)        | Waline、插件接入、SSR 注意事项               |

## 推荐配置顺序

1. 在 `site.config.ts` 中配置语言、时区、标题、站点地址与作者。
2. 在 `valaxy.config.ts` 中启用 `theme: 'lolimeow'`。
3. 配置 `navbar`，保证页面入口完整。
4. 配置 `background` 与 `hero`，确定站点视觉基调。
5. 配置 `postList` 与 `pagination`，调整首页文章展示方式。
6. 根据需要配置 `projects`、`links`、`pinned`、`notice`、`footer`、评论插件。

## 完整示例

完整示例按模块拆分在各配置页面中维护，避免单个页面过长且难以定位。建议从 [主题配置总览](/config/theme) 开始查看。
