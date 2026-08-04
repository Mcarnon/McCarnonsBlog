# 首屏

首屏配置由 `themeConfig.hero` 控制，只负责首页首屏展示。全站背景请阅读 [背景](/config/background)。

## 基础文案

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    hero: {
      motto: ['Welcome to my blog', '今日もいい天気'],
      mottoSource: 'config',
      typewriter: true,
      typingSpeed: 100,
      mottoInterval: 4000,
    },
  },
})
```

## 一言

将 `mottoSource` 设置为 `hitokoto` 后，主题会使用内置一言来源。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    hero: {
      mottoSource: 'hitokoto',
      hitokoto: {
        showFrom: true,
        fromSeparator: '——',
        sentenceTypes: ['a', 'b', 'c'],
        minLength: 1,
        maxLength: 30,
      },
    },
  },
})
```

## 独立封面

不配置 `hero.cover` 时，Hero 会透出全局背景。配置后，Hero 会使用独立封面。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    hero: {
      cover: {
        urls: ['/images/hero-1.webp', '/images/hero-2.webp'],
        random: true,
        rotationInterval: 12000,
        fixed: false,
        overlayOpacity: 0.3,
      },
    },
  },
})
```

## 单图封面

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    hero: {
      cover: {
        desktop: '/images/hero-desktop.webp',
        mobile: '/images/hero-mobile.webp',
      },
    },
  },
})
```

## Hero 字段

| 字段              | 说明                                 | 默认值     |
| ----------------- | ------------------------------------ | ---------- |
| `cover`           | 首屏独立封面                         | -          |
| `motto`           | 签名文案，支持字符串或字符串数组     | `''`       |
| `mottoSource`     | 文案来源，可选 `config` / `hitokoto` | `'config'` |
| `hitokoto`        | 一言配置                             | -          |
| `mottoInterval`   | 文案轮换间隔，单位 ms                | `4000`     |
| `typewriter`      | 是否启用打字机效果                   | `true`     |
| `typingSpeed`     | 打字速度，单位 ms/字符               | `100`      |
| `showSocialIcons` | 是否显示社交图标                     | `true`     |
| `showScrollDown`  | 是否显示向下滚动提示                 | `true`     |
| `height`          | Hero 高度                            | `'100vh'`  |
| `textAlign`       | 文本对齐方式                         | `'center'` |

## 一言字段

| 字段            | 说明             | 默认值  |
| --------------- | ---------------- | ------- |
| `showFrom`      | 是否显示来源     | `false` |
| `fromSeparator` | 正文与来源分隔符 | `'——'`  |
| `sentenceTypes` | 一言句子类型     | -       |
| `minLength`     | 最小长度         | -       |
| `maxLength`     | 最大长度         | -       |
