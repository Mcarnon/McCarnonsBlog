# 友链

友链配置由 `themeConfig.links` 控制，只负责友链数据与状态检测。聚合页面 Frontmatter 请阅读 [页面 Frontmatter](/config/page-frontmatter)。

## 基础配置

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    links: {
      statusCheck: true,
      groups: [
        {
          title: 'Friends',
          items: [
            {
              name: 'Example Blog',
              desc: '一个安静写作的博客',
              url: 'https://example.com',
              avatar: 'https://example.com/avatar.jpg',
              color: '#66CCFF',
              blog: 'Example Notes',
              rss: 'https://example.com/atom.xml',
            },
          ],
        },
      ],
    },
  },
})
```

## 分组字段

| 字段    | 说明     | 必填 |
| ------- | -------- | ---- |
| `title` | 分组标题 | 否   |
| `items` | 友链列表 | 是   |

## 友链字段

| 字段     | 说明           | 必填 |
| -------- | -------------- | ---- |
| `name`   | 站点或作者名称 | 是   |
| `url`    | 站点链接       | 是   |
| `avatar` | 头像链接       | 是   |
| `desc`   | 简介           | 是   |
| `color`  | 主题色点缀     | 否   |
| `blog`   | 博客名称       | 否   |
| `rss`    | RSS 链接       | 否   |

## 可访问状态提示

`statusCheck` 开启后，主题会在浏览器端尝试检测友链可访问状态。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    links: {
      statusCheck: true,
      groups: [],
    },
  },
})
```

状态点含义：

- 主题色：检测中
- 绿色：可访问
- 红色：暂不可访问
- 灰色：未知状态

这是纯前端的尽力探测，跨域限制下不能保证拿到真实 HTTP 状态码。
