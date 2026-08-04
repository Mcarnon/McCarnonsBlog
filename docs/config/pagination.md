# 分页

分页配置由 `themeConfig.pagination` 控制，只负责文章列表加载方式。文章卡片展示请阅读 [文章列表](/config/post-list)。

## 标准分页

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    pagination: {
      type: 'standard',
      animation: true,
      itemsPerPage: 10,
    },
  },
})
```

## 无限滚动

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    pagination: {
      type: 'infinite-scroll',
      animation: true,
      itemsPerPage: 10,
      infiniteScrollOptions: {
        preload: true,
        threshold: 200,
      },
    },
  },
})
```

## 字段说明

| 字段                              | 说明                                          | 默认值       |
| --------------------------------- | --------------------------------------------- | ------------ |
| `type`                            | 分页类型，可选 `standard` / `infinite-scroll` | `'standard'` |
| `animation`                       | 是否启用加载动画                              | `true`       |
| `itemsPerPage`                    | 每页文章数量                                  | `10`         |
| `infiniteScrollOptions.preload`   | 是否预加载下一页                              | `true`       |
| `infiniteScrollOptions.threshold` | 距离底部多少 px 时触发加载                    | `200`        |

## 使用建议

- 文章数量较少时，标准分页更稳定
- 内容流较强的站点可以使用无限滚动
- 无限滚动更依赖客户端交互，部署前建议完整测试首页翻页行为
