# 背景

背景配置由 `themeConfig.background` 控制，只负责全站背景。首页 Hero 的独立封面请阅读 [Hero](/config/hero)。

## 配置入口

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    background: {
      type: 'image',
    },
  },
})
```

## 背景类型

| 类型       | 说明                 |
| ---------- | -------------------- |
| `none`     | 不使用图片或渐变背景 |
| `image`    | 使用图片背景         |
| `gradient` | 使用 CSS 渐变背景    |

## 单图背景

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    background: {
      type: 'image',
      image: {
        light: '/images/background-light.webp',
        dark: '/images/background-dark.webp',
        position: 'center center',
        size: 'cover',
        fixed: true,
        overlayOpacity: 0.3,
      },
    },
  },
})
```

## 图片池

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    background: {
      type: 'image',
      image: {
        urls: [
          '/images/background-1.webp',
          '/images/background-2.webp',
        ],
        random: true,
        rotationInterval: 12000,
      },
    },
  },
})
```

## 随机图片 API

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    background: {
      type: 'image',
      image: {
        apiUrls: ['https://www.dmoe.cc/random.php'],
        random: true,
        overlayOpacity: 0.3,
      },
    },
  },
})
```

## 渐变背景

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    background: {
      type: 'gradient',
      gradient: {
        light: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
        dark: 'linear-gradient(135deg, #1f1f2e 0%, #111827 100%)',
      },
    },
  },
})
```

## 图片配置字段

| 字段               | 说明                  | 默认值            |
| ------------------ | --------------------- | ----------------- |
| `light`            | 浅色模式背景图        | `''`              |
| `dark`             | 深色模式背景图        | `''`              |
| `urls`             | 静态图片 URL 列表     | `[]`              |
| `apiUrls`          | 随机图片 API 列表     | `[]`              |
| `random`           | 是否随机取图          | `false`           |
| `rotationInterval` | 多图轮换间隔，单位 ms | `12000`           |
| `position`         | 背景图位置            | `'center center'` |
| `size`             | 背景图尺寸            | `'cover'`         |
| `fixed`            | 背景是否固定          | `true`            |
| `overlayOpacity`   | 背景遮罩透明度        | `0.3`             |
