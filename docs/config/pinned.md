# 置顶卡片

置顶卡片配置由 `themeConfig.pinned` 控制，适合放置项目入口、推荐文章或站点说明。

## 基础配置

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    pinned: {
      enable: true,
      title: 'START',
      entries: [
        {
          title: 'About',
          link: '/about/',
          desc: '关于这个博客',
          img: '/images/pinned-about.webp',
        },
        {
          title: 'Archives',
          link: '/archives/',
          desc: '查看全部文章',
          img: '/images/pinned-archives.webp',
        },
      ],
    },
  },
})
```

## 字段说明

| 字段      | 说明             | 默认值     |
| --------- | ---------------- | ---------- |
| `enable`  | 是否启用置顶卡片 | `false`    |
| `title`   | 置顶卡片区域标题 | `'Pinned'` |
| `entries` | 置顶卡片列表     | `[]`       |

## 卡片字段

| 字段    | 说明     | 必填 |
| ------- | -------- | ---- |
| `title` | 卡片标题 | 是   |
| `link`  | 卡片链接 | 是   |
| `desc`  | 卡片描述 | 否   |
| `img`   | 卡片图片 | 否   |

## 布局说明

- 移动端统一为横向滑动卡片组
- 桌面端 1 项时会收窄显示
- 桌面端 2 项时为双列
- 桌面端 3 项时为三列
- 桌面端超过 3 项时回到横向滑动
