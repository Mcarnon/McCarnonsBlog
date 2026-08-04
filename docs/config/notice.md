# 公告

公告配置由 `themeConfig.notice` 控制，用于展示简短站点通知。

## 基础配置

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    notice: {
      enable: true,
      message: '欢迎来到我的博客',
      closable: true,
      scope: 'home',
    },
  },
})
```

## 字段说明

| 字段       | 说明                             | 默认值   |
| ---------- | -------------------------------- | -------- |
| `enable`   | 是否启用公告                     | `false`  |
| `message`  | 公告内容                         | `''`     |
| `closable` | 是否可关闭                       | `true`   |
| `scope`    | 显示范围，可选 `home` / `global` | `'home'` |

## 显示范围

`scope: 'home'` 表示只在首页显示。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    notice: {
      enable: true,
      message: '首页公告',
      scope: 'home',
    },
  },
})
```

`scope: 'global'` 表示在非首页页面显示全局公告。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    notice: {
      enable: true,
      message: '全局公告',
      scope: 'global',
    },
  },
})
```
