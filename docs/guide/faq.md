# 常见问题

## 搜索按钮不显示？

需要同时配置站点搜索和导航工具。

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

## 随机图片不稳定？

远程随机图片 API 可能受到网络、缓存和跨域影响。建议同时配置本地兜底图片。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    postList: {
      coverFallback: ['/images/cover-1.webp'],
      coverApiUrls: ['https://example.com/random-image'],
      coverRandom: true,
    },
  },
})
```

## 友链状态不准确？

友链状态检测是浏览器端的尽力探测，受跨域限制影响，不能保证拿到真实 HTTP 状态码。

如果希望稳定展示，可以关闭：

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    links: {
      statusCheck: false,
      groups: [],
    },
  },
})
```

## 如何更新主题？

建议经常更新 Valaxy、主题和插件。

```bash
pnpm update valaxy valaxy-theme-lolimeow
```

如果使用 Waline 插件：

```bash
pnpm update valaxy-addon-waline
```

更新后建议重新执行构建。
