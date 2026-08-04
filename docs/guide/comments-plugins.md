# 评论与插件

Lolimeow 保持 Valaxy 的插件机制。评论服务建议通过 Valaxy addon 接入。

## 启用站点评论

先在 `site.config.ts` 中启用评论：

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  comment: {
    enable: true,
  },
})
```

## 使用 Waline

安装插件：

```bash
pnpm add valaxy-addon-waline
```

在 `valaxy.config.ts` 中配置：

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonWaline } from 'valaxy-addon-waline'

export default defineValaxyConfig({
  theme: 'lolimeow',
  addons: [
    addonWaline({
      serverURL: 'https://your-waline-server',
      pageview: true,
      comment: true,
      login: 'force',
      requiredMeta: ['nick', 'mail'],
    }),
  ],
})
```

## SSR 兼容注意事项

插件通常依赖浏览器环境。建议优先使用 Valaxy addon 的官方接入方式，不要在主题配置文件顶层直接访问浏览器 API。

如果后续添加自定义组件，请避免在模块顶层访问：

- `window`
- `document`
- `localStorage`
- `sessionStorage`
- 浏览器专属 DOM API

需要访问时，放到客户端生命周期内，或使用对应框架提供的客户端限定能力。

## 插件建议

- 评论服务应先在独立服务端完成部署和验证
- 本地开发时可以先关闭评论，只验证页面构建
- 生产环境建议配置评论服务的安全域名和反垃圾策略
