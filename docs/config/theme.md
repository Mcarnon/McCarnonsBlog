# 主题配置总览

Lolimeow 的主题配置写在 `valaxy.config.ts` 的 `themeConfig` 中。

## 配置入口

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

## 配置模块

| 配置项          | 说明                                            | 文档                          |
| --------------- | ----------------------------------------------- | ----------------------------- |
| `ui`            | 基础 UI 配色与按钮图标                          | 本页                          |
| `background`    | 全局背景，支持图片、图片池、随机图片 API 与渐变 | [背景](/config/background)    |
| `hero`          | 首页首屏文案、封面、一言与打字机效果            | [Hero](/config/hero)          |
| `navbar`        | 导航菜单项                                      | [导航栏](/config/navbar)      |
| `navbarOptions` | 导航栏标题、工具按钮、移动端菜单和自动隐藏      | [导航栏](/config/navbar)      |
| `notice`        | 站点公告                                        | [公告](/config/notice)        |
| `pinned`        | 首页置顶卡片                                    | [置顶卡片](/config/pinned)    |
| `projects`      | 项目展示页                                      | [项目展示](/config/projects)  |
| `postList`      | 首页文章列表与封面策略                          | [文章列表](/config/post-list) |
| `pagination`    | 标准分页或无限滚动                              | [分页](/config/pagination)    |
| `links`         | 友链分组与可访问性状态提示                      | [友链](/config/links)         |
| `footer`        | 页脚年份、图标、备案与 Powered by 信息          | [页脚](/config/footer)        |

## UI 主色

`ui.primary` 用于主题品牌色。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    ui: {
      primary: '#66CCFF',
    },
  },
})
```

## 工具按钮图标

可以为明暗切换按钮指定图标。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    ui: {
      toggleDarkBtn: {
        lightIcon: 'i-ri-sun-line',
        darkIcon: 'i-ri-moon-line',
      },
    },
  },
})
```

## 默认值来源

主题默认值定义在 `theme/node/config.ts`。如果没有显式配置，主题会使用默认值进行兜底。
